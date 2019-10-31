import { getUserStats, getStreakData } from '../../utils/firebaseQueries';
import format from 'date-fns/format';

async function handler(req, res) {
    const {user_id} = req.body;

    if (req.method === 'POST') {
        try {
            const [stats, streakData] = await Promise.all([getUserStats(user_id), getStreakData(user_id)]);
            console.log('stats',stats);
            console.log('streakData', streakData);

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
                    firstPlaceAthlete,
                } = stats;

                const {
                    longestStreak,
                    currentStreak,
                    longestStreakDates,
                    currentStreakDates,
                } = streakData;

                const dayOrDays = (number) => number === 1 ? 'day' : 'days';

                const fallbackDate = format(new Date(), 'EEE, MMM dd');
                const date = `<!date^${Math.floor(new Date() / 1000)}^{date_short_pretty} at {time}|${fallbackDate}>`;

                const formattedTextFull = [
                    `Rank: ${ranking.toLocaleString()} ${ranking === 1 ? "Congrats! You're in the lead!" : ''}`,
                    `Total Push-Ups: ${totalPushUps.toLocaleString()}`,
                    `Catch the Leader: ${catchTheLeader.toLocaleString()} more`,
                    `First Place: ${firstPlaceAthlete.profile.real_name} is in the lead with ${firstPlaceAthlete.count.toLocaleString()}`,
                    `Daily Average: ${dailyAvg.toLocaleString()}`,
                    `Longest Streak: ${longestStreak.toLocaleString()} ${dayOrDays(longestStreak)} ${longestStreak === 0 ? '' : `(${longestStreakDates})`}`,
                    `Current Streak: ${currentStreak.toLocaleString()} ${dayOrDays(currentStreak)} ${currentStreak === 0 ? '' : `(${currentStreakDates})`}`,
                    `Starting Set: ${firstSet.count.toLocaleString()} on ${firstSet.created}`,
                    `Best Set: ${bestSet.count.toLocaleString()} on ${bestSet.created.join(', ')}`,
                    `Average Set: ${avgSet.toLocaleString()}`,
                    `Latest Set: ${mostRecentSet.count.toLocaleString()} on ${format(mostRecentSet.created, 'EEE, MMM dd')}`,
                    `Contribution: ${contributionPercentage}% of the total push-ups`,
                ];

                const firstTwo = formattedTextFull.slice(0, 2);
                const lastPortion = formattedTextFull.slice(4);
                const trimmedList = [...firstTwo, ...lastPortion];
                const formattedText = ranking === 1 ? trimmedList.join(`\n`) : formattedTextFull.join(`\n`);

                const blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*YOUR STATS - ${date}* :bar_chart:`,
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
                            "text": "_More fun data at <https://push-up-heroes.now.sh|push-up-heroes.now.sh>._",
                        }
                    }];

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                return res.json({
                    response_type: 'ephemeral',
                    blocks,
                });
            }

            const userNotFoundMessage = {
                response_type: 'ephemeral',
                text: `:sadtears: Looks like you haven't done any push-ups yet. Check the <#CNTT52KV0|fun-push-up-challenge> channel for details on how you can participate.`,
            };

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.json(userNotFoundMessage);
        } catch (err) {
            console.error('Error:', err);
            throw new Error(err.message);
        }
    }
}

export default handler;
