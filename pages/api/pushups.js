import fetch from 'isomorphic-unfetch';
import { addUserData } from '../../utils/firebaseQueries';
import getSlackUser from '../../utils/getSlackUser';

async function handler(req, res) {
    const {user_id, user_name, text, channel_name} = req.body;
    const count = Number(text);

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
                name: display_name,
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
                    display_name,
                    real_name,
                    image_original,
                    image_24,
                    image_32,
                    image_48,
                    image_72,
                    image_192,
                    image_512,
                }
            });

            const pushUps = count === 1 ? 'push-up' : 'push-ups';
            const context = "_Use the `/pushups` command to log your set._";

            const blocks = [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `<@${user_id}> just did *${text}* ${pushUps}! :muscle:\n>Wow! That's a lot! Good job!\n${context}`
                }
            }];

            if (channel_name !== 'fun-push-up-challenge') {
                await fetch('https://slack.com/api/chat.postMessage', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                        Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
                    },
                    body: JSON.stringify({
                        channel: 'fun-push-up-challenge',
                        blocks,
                    })
                });

                const slackWarningMessage = {
                    response_type: 'ephemeral',
                    text: ':bravo:️ Thank you for logging your push-up count for the <#CNTT52KV0|fun-push-up-challenge>!',
                };

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                return res.json(slackWarningMessage);
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.json({
                response_type: "in_channel",
                blocks,
            });
        } catch (err) {
            console.error('Error:', err);
            throw new Error(err.message);
        }
    }
}

export default handler;
