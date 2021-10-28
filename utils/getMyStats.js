import { getUserStats, getStreakData } from './firebaseQueries';
import format from 'date-fns/format';

async function getMyStats(userId, {tagUser} = {tagUser: false}) {
    try {
        const [stats, streakData] = await Promise.all([getUserStats(userId), getStreakData(userId)]);

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
                bestDailyTotal,
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
                label: 'Best Daily Total',
                value: `${bestDailyTotal.count.toLocaleString()} (${bestDailyTotal.created.join(', ')})`,
            }, {
                label: 'Longest Streak',
                value: `${longestStreak.toLocaleString()} ${dayOrDays(longestStreak)}`,
            }, {
                label: 'Current Streak',
                value: `${currentStreak.toLocaleString()} ${dayOrDays(currentStreak)}`,
            }, {
                label: 'Best Set',
                value: `${bestSet.count.toLocaleString()}`,
            }, {
                label: 'Average Set',
                value: `${avgSet.toLocaleString()}`,
            }, {
                label: 'Starting Set',
                value: `${firstSet.count.toLocaleString()} (${firstSet.createdShort})`,
            }, {
                label: 'Latest Set',
                value: `${mostRecentSet.count.toLocaleString()} (${mostRecentSet.createdShort})`,
            }, {
                label: 'Contribution',
                value: `${contributionPercentage}%`,
            }];

            const trimmedList = fullList.filter(item => item.label !== 'Catch the Leader');
            const textList = ranking === 1 ? trimmedList : fullList;

            const formattedText = textList.reduce((acc, curr) => {
                const {label, value} = curr;
                const spacing = totalColumnLength - (curr.label.length + 1);

                return acc + `${label}:${new Array(spacing).join(' ')}${value}\n`;
            }, '');

            const YOUR = tagUser ? `<@${userId}>'s` : 'YOUR';
            const webAppLink = `:bar_chart: _More fun data at <https://pushupheroes.com/users/${userId}|pushupheroes.com>._`;
            const myStatsCommand = '_Use the `/mystats` command to see your latest stats._';
            const context = tagUser ? `${myStatsCommand}\n${webAppLink}` : webAppLink;

            return {
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${YOUR} STATS - ${date}*`,
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
                            "text": context,
                        }
                    }],
                rawStats: {
                    ...stats,
                    ...streakData,
                }
            }
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export default getMyStats;
