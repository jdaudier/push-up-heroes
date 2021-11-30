import { getLeaderboardText } from '../../utils/firebaseQueries';

async function handler(req, res) {
    const {user_id} = req.body;

    if (req.method === 'POST') {
        try {
            const leaderboardText = await getLeaderboardText(user_id, false);

            if (leaderboardText) {
                const blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": leaderboardText
                        }
                    }];

                const responseMessage = {
                    response_type: 'ephemeral',
                    text: leaderboardText,
                    blocks,
                }

                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(responseMessage);
            }

            const slackEmptyLeaderboardMessage = {
                response_type: 'ephemeral',
                text: ':sadtears: Looks like no one has done any push-ups yet. Check the <#CNTT52KV0|fun-push-up-challenge> channel for details on how you can participate.',
            };

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(slackEmptyLeaderboardMessage);
        } catch (err) {
            console.error('Error:', err);
            throw new Error(err.message);
        }
    }
}

export default handler;
