import { getUserStats, getStreakData } from '../../utils/firebaseQueries';
import format from 'date-fns/format';

async function handler(req, res) {
    const {user_id} = req.body;

    if (req.method === 'POST') {
        try {
            const [stats, streakData] = await Promise.all([getUserStats(user_id), getStreakData(user_id)]);

            if (stats && streakData) {
                const {
                    ranking,
                    catchTheLeader,
                    bestSet,
                    firstSet,
                    mostRecentSet,
                    totalPushUps,
                    dailyAvg,
                    avgSet,
                    contributionPercentage,
                } = stats;

                const {
                    longestStreak,
                    currentStreak,
                } = streakData;

                const dayOrDays = (number) => number === 1 ? 'day' : 'days';

                const fallbackDate = format(new Date(), 'EEE, MMM dd');
                const date = `<!date^${Math.floor(new Date() / 1000)}^{date_short_pretty} at {time}|${fallbackDate}>`;

                const padding = 8;
                const longestHeadingLength = 'Catch the Leader'.length;
                const totalColumnLength = longestHeadingLength + padding;

                const fullList = [{
                    label: 'Rank',
                    value: `${ranking.toLocaleString()} ${ranking === 1 ? "Congrats!" : ''}`
                }, {
                    label: 'Total Push-Ups',
                    value:  `${totalPushUps.toLocaleString()}`,
                }, {
                    label: 'Catch the Leader',
                    value: `${catchTheLeader.toLocaleString()} more`,
                }, {
                    label: 'Daily Average',
                    value: `${dailyAvg.toLocaleString()}`,
                }, {
                    label: 'Longest Streak',
                    value: `${longestStreak.toLocaleString()} ${dayOrDays(longestStreak)}`,
                }, {
                    label: 'Current Streak',
                    value: `${currentStreak.toLocaleString()} ${dayOrDays(currentStreak)}`,
                }, {
                    label: 'Starting Set',
                    value: `${firstSet.count.toLocaleString()} (${firstSet.createdShort})`,
                }, {
                    label: 'Best Set',
                    value: `${bestSet.count.toLocaleString()}`,
                }, {
                    label: 'Average Set',
                    value: `${avgSet.toLocaleString()}`,
                }, {
                    label: 'Latest Set',
                    value: `${mostRecentSet.count.toLocaleString()} (${format(mostRecentSet.created, 'MMM dd')})`,
                }, {
                    label: 'Contribution',
                    value: `${contributionPercentage}%`,
                }];

                const firstTwo = fullList.slice(0, 2);
                const lastPortion = fullList.slice(3);
                const trimmedList = [...firstTwo, ...lastPortion];
                const textList = ranking === 1 ? trimmedList : fullList;

                const formattedText = textList.reduce((acc, curr) => {
                    const {label, value} = curr;
                    const spacing = totalColumnLength - (curr.label.length + 1);

                    return acc + `${label}:${new Array(spacing).join(' ')}${value}\n`;
                }, '');

                const blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*YOUR STATS - ${date}*`,
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "```" + formattedText + "```",
                        }
                    }, {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": ":bar_chart: _More fun data at <https://push-up-heroes.now.sh|push-up-heroes.now.sh>._",
                        }
                    }];

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
