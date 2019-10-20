import format from 'date-fns/format';
import { getUsers } from './firebaseQueries';

async function getLeaderboardText(userId) {
    try {
        const allRows = await getUsers();
        /*
        id: "myID",
        name: "joanne",
        count: 22,
        created: "2019-10-07T09:08:22.000Z"
        */
        const data = allRows.reduce((acc, curr) => {
            const name = curr.name;
            const count = curr.count;
            const countLength = (count).toString().length;

            return {
                ...acc,
                slackIdMap: {
                    ...acc.slackIdMap,
                    [name]: curr.id,
                },
                leaderboard: {
                    ...acc.leaderboard,
                    [name]: acc.leaderboard[name] ? acc.leaderboard[name] + count : count,
                },
                longestNameLength: name.length > acc.longestNameLength ? name.length : acc.longestNameLength,
                longestCountLength: countLength > acc.longestCountLength ? countLength : acc.longestCountLength
            }
        }, {
            slackIdMap: {},
            leaderboard: {},
            longestNameLength: 0,
            longestCountLength: 0,
        });

        const leaderArr = Object.keys(data.leaderboard).map(name => ({
            name,
            count: data.leaderboard[name],
            id: data.slackIdMap[name],
        }));

        const maxAmountForSummary = 20;
        const hasMoreData = leaderArr.length > 20;
        const clippedLeaderboard = hasMoreData ? [...leaderArr.slice(0, maxAmountForSummary)] : [...leaderArr];

        const sortedLeaderboard = clippedLeaderboard.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        const formattedText = sortedLeaderboard.reduce((acc, {name, count}, i) => {
            const isFirst = i === 0;
            const rank = i + 1;
            const {longestNameLength, longestCountLength} = data;
            const padding = 10;
            const nameColLength = longestNameLength + padding;
            const countColLength = longestCountLength + padding;
            const headingText = 'Athlete';
            const nameHeadingLength = headingText.length;
            const nameLength = name.length;
            const spaceAfterNameHeading = nameColLength - nameHeadingLength;
            const spaceAfterName = nameColLength - nameLength;
            const headingWithSpacing = headingText + new Array(spaceAfterNameHeading + 1).join(' ');
            const nameWithSpacing = name + new Array(spaceAfterName + 1).join(' ');

            if (isFirst) {
                return `#   ${headingWithSpacing}Total Push-Ups\n${rank}.  ${nameWithSpacing}${count}\n`;
            }

            return `${acc}${rank}.  ${nameWithSpacing}${count}\n`;
        }, '');

        const leaderboardText = "```" + formattedText + "```";

        const context = userId ? `_<@${userId}>` + " triggered this from the `/leaderboard` command._" : '_Use the `/leaderboard` command to see the latest data._';
        const webLink = '_More fun data at <https://push-up-heroes.now.sh|push-up-heroes.now.sh>._';

        const summary = sortedLeaderboard.map((person, i) => {
            switch (i) {
                case (0): return `<@${person.id}> is in first place! :first_place_medal:`;
                case (1): return `<@${person.id}> is in second place! :second_place_medal:`;
                case (2): return `<@${person.id}> is in third place! :third_place_medal:`;
            }
        }).join('\n');

        const fallbackDate = format(new Date(), 'EEE, MMM dd');
        const date = `<!date^${Math.floor(new Date() / 1000)}^{date_short_pretty} at {time}|${fallbackDate}>`;

        return sortedLeaderboard.length > 0 ? `*LEADERBOARD - ${date}*\n${summary}\n${leaderboardText}\n${context}\n${webLink}` : '';
    } catch (error) {
        console.error('Error:', error);
        return {error};
    }
}

export default getLeaderboardText;
