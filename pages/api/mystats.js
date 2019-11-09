import getMyStats from '../../utils/getMyStats';

async function handler(req, res) {
    const {user_id} = req.body;

    if (req.method === 'POST') {
        try {
            const {blocks} = await getMyStats(user_id);

            if (blocks) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                return res.json({
                    response_type: 'ephemeral',
                    blocks,
                });
            }
        } catch (err) {
            console.error('Error:', err);

            const userNotFoundMessage = {
                response_type: 'ephemeral',
                text: `:sadtears: Looks like you haven't done any push-ups yet. Check the <#CNTT52KV0|fun-push-up-challenge> channel for details on how you can participate.`,
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.json(userNotFoundMessage);
        }
    }
}

export default handler;
