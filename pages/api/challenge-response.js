import fetch from 'isomorphic-unfetch'
import { addUserData } from "../../utils/firebaseQueries";
import getSlackUser from '../../utils/getSlackUser';

const slackPostMessageUrl = 'https://slack.com/api/chat.postMessage';
const slackUpdateMessageUrl = 'https://slack.com/api/chat.update';
const slackSendEphemeralMessageUrl = 'https://slack.com/api/chat.postEphemeral'

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
                        channel: channel.id,
                        user: user.id,
                        text: `<@${user.id}> This challenge wasn't meant for you, but that doesn't mean you can't get down and do some push-ups! :flex2:`,
                    };

                    await fetch(slackSendEphemeralMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(slackResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message)
                }

                return res.status(200).end();
            }

            const count = Number(stringCount);
            const pushUps = count === 1 ? 'push-up' : 'push-ups';

            if (hasAccepted) {
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
                    } = await getSlackUser(user.id);

                    await addUserData({
                        name: user.username,
                        id: user.id,
                        count,
                        timeZone: tz,
                        profile: {
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

                    const slackResponse = {
                        "channel": channel.id,
                        "thread_ts": message.ts,
                        "text": `<@${user.id}> We've logged *${count}* new ${pushUps} for you. Kudos for accepting the challenge from <@${challengerId}>! :party:`
                    };

                    const updatedMessage = {
                        "channel": channel.id,
                        "ts": message.ts,
                        "text": message.text,
                        "blocks": [
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
                                    "text": `<@${challengerId}> just challenged <@${user.id}> to *${count}* ${pushUps}!\n*Do you accept this challenge <@${user.id}>?*\n\n_If you accept, *${count}* ${pushUps} will be logged for you_.`
                                },
                                "accessory": {
                                    "type": "image",
                                    "image_url": "https://zappy.zapier.com/ooh-cat%202019-10-1219%20at%2019.22.51.gif",
                                    "alt_text": "funny image"
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": ":white_check_mark: *ACCEPTED!*"
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": "_You too can challenge someone with the `/challenge` command._"
                                }
                            }
                        ]
                    };

                    await fetch(slackUpdateMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(updatedMessage)
                    });

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(slackResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message)
                }
            } else {
                try {
                    const updatedMessage = {
                        "channel": channel.id,
                        "ts": message.ts,
                        "text": message.text,
                        "blocks": [
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
                                    "text": `<@${challengerId}> just challenged <@${user.id}> to *${count}* ${pushUps}!\n*Do you accept this challenge <@${user.id}>?*\n\n_If you accept, *${count}* ${pushUps} will be logged for you_.`
                                },
                                "accessory": {
                                    "type": "image",
                                    "image_url": "https://zappy.zapier.com/ooh-cat%202019-10-1219%20at%2019.22.51.gif",
                                    "alt_text": "funny image"
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": ":x: DECLINED!"
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": "_You too can challenge someone with the `/challenge` command._"
                                }
                            }
                        ]
                    };

                    await fetch(slackUpdateMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(updatedMessage)
                    });

                    const slackResponse = {
                        "channel": channel.id,
                        "thread_ts": message.ts,
                        "text": `<@${user.id}> We get it! You're too busy to get down and do *${count}* ${pushUps}. Don't worry, there's plenty of other chances to make <@${challengerId}> proud. :grandpa-simpson-shake-fist:`
                    };

                    await fetch(slackPostMessageUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.zapierSlackToken}`,
                        },
                        body: JSON.stringify(slackResponse)
                    });
                } catch (err) {
                    console.error('Error:', err);
                    throw new Error(err.message)
                }
            }

            res.status(200).end();
        }
    }
}

export default handler;
