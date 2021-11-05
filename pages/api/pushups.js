import fetch from 'isomorphic-unfetch';
import { addUserData } from '../../utils/firebaseQueries';
import getSlackUser from '../../utils/getSlackUser';
import getMyStats from '../../utils/getMyStats';
import randomCelebrations from '../../utils/randomCelebrations';
import getSmartResponse from '../../utils/smartResponse';

const slackPostMessageUrl = 'https://slack.com/api/chat.postMessage';

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function handler(req, res) {
    const {user_id, user_name, text, channel_name} = req.body;
    const count = Number(text);
    const pushUps = count === 1 ? 'push-up' : 'push-ups';

    if (req.method === 'POST') {
        if (!Number(text)) {
            const slackWarningMessage = {
                response_type: 'ephemeral',
                text: ':warning: The `/pushups` command expects a number. Try again!',
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.json(slackWarningMessage);
        }

        try {
            const {
                tz,
                real_name,
                profile: {
                    image_original,
                    image_24,
                    image_32,
                    image_48,
                    image_72,
                    image_192,
                    image_512,
                }
            } = await getSlackUser(user_id);

            await addUserData({
                name: user_name,
                id: user_id,
                count: count,
                timeZone: tz,
                profile: {
                    real_name,
                    image_original: image_original ?? image_512,
                    image_24,
                    image_32,
                    image_48,
                    image_72,
                    image_192,
                    image_512: image_512 || image_original,
                }
            });

            async function postToChannel() {
                const context = "_Use the `/pushups` command to log your set._";

                try {
                    const {blocks: myStatsBlocks, rawStats} = await getMyStats(user_id, {tagUser: false});
                    const smartResponse = getSmartResponse({id: user_id, count, ...rawStats});
                    const smartResponseText = `<@${user_id}> just did *${text}* ${pushUps}! :muscle:\n${smartResponse}\n${context}`;

                    const blocks = [{
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            text: smartResponseText,
                        }
                    }];

                    const response = await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify({
                            channel: 'fun-push-up-challenge',
                            text: smartResponseText,
                            blocks,
                        })
                    });

                    const {channel, ts} = await response.json();

                    const fallbackText = `${myStatsBlocks[0].text.text}\n${myStatsBlocks[1].text.text}`;

                    const myStatsResponse = {
                        channel,
                        thread_ts: ts,
                        text: fallbackText,
                        blocks: myStatsBlocks,
                    };

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(myStatsResponse)
                    });

                    const randomIndex = getRandomInt(randomCelebrations.length);
                    const randomCelebration = randomCelebrations[randomIndex];

                    const habitReminder = `According to the book _Tiny Habits_, immediately after you do your new habit, celebrate so you feel a positive emotion. That’s what wires the habit into your brain.\n\nHere's one idea:\n>*${randomCelebration}*`;

                    const habitResponse = {
                        channel,
                        thread_ts: ts,
                        text: habitReminder,
                    };

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(habitResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message);
                }
            }

            await postToChannel();

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;

            if (channel_name !== 'fun-push-up-challenge') {
                const confirmationMessage = {
                    response_type: 'ephemeral',
                    text: `:bravo:️ We got you down for *${text}* ${pushUps}! Thanks for participating in the <#CNTT52KV0|fun-push-up-challenge>!`,
                };

                return res.json(confirmationMessage);
            }
            
            res.json(null);
        } catch (err) {
            console.error('Error:', err);
            throw new Error(err.message);
        }
    }
}

export default handler;
