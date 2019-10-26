import fetch from 'isomorphic-unfetch'
import {addUserData} from "../../utils/firebaseQueries";
import getSlackUser from '../../utils/getSlackUser';

const slackPostMessageUrl = 'https://slack.com/api/chat.postMessage';

async function handler(req, res) {
    const {user, actions: [action], team, message, channel} = JSON.parse(req.body.payload);
    const [recipientId, stringCount, challengerId] = action.action_id.split('-');
    const isMatchingChallenger = user.id === recipientId;
    const hasAccepted = action.value === 'accept';

    const isZapierTeam = team.id === 'T024VA8T9';
    const isSupremeLeadersTeam = team.id === 'T3JF64RD0';
    const isTeamAllowed = isSupremeLeadersTeam || isZapierTeam;
    const isPeerChallenge = action.block_id === 'peer-challenge';

    if (req.method === 'POST' && isTeamAllowed) {
        if (isPeerChallenge) {
            if (!isMatchingChallenger) {
                try {
                    const slackResponse = {
                        "channel": channel.id,
                        "thread_ts": message.ts,
                        "text": `<@${user.id}> This challenge wasn't meant for you, but that doesn't mean you can't get down and do some push-ups! :flex2:`,
                    };

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
                        },
                        body: JSON.stringify(slackResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message)
                }

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                return res.json(null);
            }

            const count = Number(stringCount);
            const pushUps = count === 1 ? 'push-up' : 'push-ups';

            if (hasAccepted) {
                try {
                    const user = await getSlackUser(user.id);

                    await addUserData({
                        name: user.username,
                        id: user.id,
                        count,
                        timeZone: user.tz,
                    });

                    const slackResponse = {
                        "channel": channel.id,
                        "thread_ts": message.ts,
                        "text": `<@${user.id}> We've logged *${count}* new ${pushUps} for you. Kudos for accepting the challenge from <@${challengerId}>! :party:`
                    };

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
                        },
                        body: JSON.stringify(slackResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message)
                }
            } else {
                try {
                    const slackResponse = {
                        "channel": channel.id,
                        "thread_ts": message.ts,
                        "text": `<@${user.id}> We get it! You're too busy to get down and do *${count}* ${pushUps}. Don't worry, plenty of chances to make <@${challengerId}> proud. :grandpa-simpson-shake-fist:`
                    };

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
                        },
                        body: JSON.stringify(slackResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message)
                }
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.json(null);
        }
    }
}

export default handler;
