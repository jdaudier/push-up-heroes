import {MAX_NUM_FOR_SUMMARY} from '../../utils/constants';

async function handler(req, res) {
    const {user_id} = req.body;

    if (req.method === 'POST') {
        try {
            const blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Hi <@${user_id}>! The Rock here. Welcome to <https://pushupheroes.com|Push-Up Heroes>!\n\n\n\n*Here are all the commands you can use:*`
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://pushupheroes.com/images/the-rock.jpg",
                            "alt_text": "The Rock"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*/pushups* _number_ \n To log each set of push-ups that you do."
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://media.giphy.com/media/SIVAv1U9uvuy4/giphy.gif",
                            "alt_text": "Push-ups"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*/challenge* _@user number_ \nTo challenge another user. If they click the *Accept* button, that number of push-ups will be logged for them."
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://media.giphy.com/media/MremVACtqrh8A/giphy-downsized.gif",
                            "alt_text": "Challenge Me"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*/mystats*\nTo see your latest stats _(only visibible to you)_."
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://media.giphy.com/media/l2JdTgYZ7VG4EeBVe/giphy.gif",
                            "alt_text": "Stats"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*/leaderboard*\nTo see the top ${MAX_NUM_FOR_SUMMARY} athletes currently at the top of the leaderboard _(visible to everyone)_.`
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://media.giphy.com/media/FMapondVtL2Fi/giphy.gif",
                            "alt_text": "Winner"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": ":linechart: _Visit <https://pushupheroes.com|pushupheroes.com> for more fun stats and data visualization!_"
                        }
                    }
                ];

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.json({
                response_type: 'ephemeral',
                blocks,
            });
        } catch (err) {
            console.error('Error:', err);

            const errorMessage = {
                response_type: 'ephemeral',
                text: `:sadtears: Looks like we ran into an error: ${err}!`,
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.json(errorMessage);
        }
    }
}

export default handler;
