import fetch from 'isomorphic-unfetch';
import getLeaderboardText from '../../utils/getLeaderboardText';

async function handler(req, res) {
    const {user_id, channel_name} = req.body;

    if (req.method === 'POST') {
        try {
            const leaderboardText = await getLeaderboardText(user_id);

            if (leaderboardText) {
                const blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": leaderboardText
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
                        text: ':warning:️ Check the <#CNTT52KV0|fun-push-up-challenge> channel for leaderboard results.',
                    };

                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    return res.json(slackWarningMessage);
                }

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                return res.json({
                    response_type: "in_channel",
                    blocks,
                });
            }

            const slackEmptyLeaderboardMessage = {
                response_type: 'ephemeral',
                text: ':sadtears: Looks like no one has done any push-ups yet. Check the <#CNTT52KV0|fun-push-up-challenge> channel for details on how you can participate.',
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.json(slackEmptyLeaderboardMessage);
        } catch (error) {
            console.error('Error:', error);
            return {error};
        }
    }
}

export default handler;
