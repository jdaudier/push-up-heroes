import fetch from 'isomorphic-unfetch'

async function handler(req, res) {
    const {user_id, text, channel_name, team_id} = req.body;
    // text: <@U8BBPU36K|joanne> 3
    const [recipientName, stringCount] = text.split(' ');
    const [splitUserId] = recipientName.split('|');
    const recipientId = splitUserId.replace(/[<@]/g, '');

    const isZapierTeam = team_id === 'T024VA8T9';
    const isSupremeLeadersTeam = team_id === 'T3JF64RD0';
    const isTeamAllowed = isSupremeLeadersTeam || isZapierTeam;

    if (req.method === 'POST' && isTeamAllowed) {
        if (!text) {
            const slackWarningMessage = {
                response_type: 'ephemeral',
                text: ':warning: The `/challenge` command expects a user name and number. Try again!',
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.json(slackWarningMessage);
        }

        if (!Number(stringCount)) {
            const slackWarningMessage = {
                response_type: 'ephemeral',
                text: ':warning: The `/challenge` command expects a number. Try again!',
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.json(slackWarningMessage);
        }

        const count = Number(stringCount);
        const pushUps = count === 1 ? 'push-up' : 'push-ups';
        const context = "_You too can challenge someone with the `/challenge` command._";

        try {
            await fetch('https://slack.com/api/chat.postMessage', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
                },
                body: JSON.stringify({
                    channel: 'fun-push-up-challenge',
                    blocks: [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*CHALLENGE TIME!* :alarm_clock:"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `<@${user_id}> just challenged ${recipientName} to *${count}* ${pushUps}!\n*Do you accept this challenge ${recipientName}?*\n\n_If you accept, *${count}* more ${pushUps} will be logged for you_.`
                            },
                            "accessory": {
                                "type": "image",
                                "image_url": "https://zappy.zapier.com/ooh-cat%202019-10-1219%20at%2019.22.51.gif",
                                "alt_text": "funny image"
                            }
                        }, {
                            "type": "actions",
                            "block_id": "peer-challenge",
                            "elements": [
                                {
                                    "type": "button",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Accept"
                                    },
                                    "value": "accept",
                                    "action_id": `${recipientId}-${count}-${user_id}-accept`,
                                    "style": "primary"
                                },
                                {
                                    "type": "button",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Decline"
                                    },
                                    "value": "decline",
                                    "action_id": `${recipientId}-${count}-${user_id}-decline`,
                                    "style": "danger"
                                }
                            ]
                        }, {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": context
                            }
                        }
                    ]
                })
            });
        } catch (err) {
            console.error('Error:', err);
            throw new Error(err.message);
        }

        if (channel_name !== 'fun-push-up-challenge') {
            const slackWarningMessage = {
                response_type: 'ephemeral',
                text: `:yay_yay:️ Thank you for challenging ${recipientName} for the <#CNTT52KV0|fun-push-up-challenge>!`,
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.json(slackWarningMessage);
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.json(null);
    }
}

export default handler;
