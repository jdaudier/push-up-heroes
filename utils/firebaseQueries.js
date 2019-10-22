import db from '../init-firebase';
import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import getSlackProfile from './getSlackProfile';

export async function getFullLeaderboardData() {
    try {
        const snapshot = await db.collection('users').get();
        const data = snapshot.docs.reduce((acc, doc) => {
            /*
            id: "myID",
            name: "joanne",
            count: 22,
            created: "2019-10-07T09:08:22.000Z"
            */
            const rawData = doc.data();
            const {id, count, name, created} = {
                ...rawData,
                created: startOfDay(rawData.created.toDate()),
            };

            return {
                ...acc,
                slackIdMap: {
                    ...acc.slackIdMap,
                    [id]: name,
                },
                leaderboard: {
                    ...acc.leaderboard,
                    [id]: acc.leaderboard[id] ? acc.leaderboard[id] + count : count,
                },
                totalPushUps: acc.totalPushUps + count,
                bestIndividualSet: {
                    count: count > acc.bestIndividualSet.count ? count : acc.bestIndividualSet.count,
                    id: count > acc.bestIndividualSet.count ? id : acc.bestIndividualSet.id,
                    name: count > acc.bestIndividualSet.count ? name : acc.bestIndividualSet.name,
                    created: count > acc.bestIndividualSet.count ? created : acc.bestIndividualSet.created,
                }
            }
        }, {
            slackIdMap: {},
            leaderboard: {},
            totalPushUps: 0,
            bestIndividualSet: {
                count: 0,
                id: '',
                name: '',
            },
        });

        const {totalPushUps, bestIndividualSet, leaderboard, slackIdMap} = data;
        const totalChallengeDays = await getTotalChallengeDays();

        const leaderArr = await Promise.all(Object.keys(leaderboard).map(async (id) => {
            const name = slackIdMap[id];
            const count =  leaderboard[id];
            return {
                name,
                count,
                id,
                profile: await getSlackProfile(id),
                dailyAvg: Math.round(count / totalChallengeDays),
                contributionPercentage: Math.round((count / totalPushUps) * 100),
            };
        }));

        const sortedLeaderboard = leaderArr.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        const bestIndividualSetProfile = await getSlackProfile(bestIndividualSet.id);
        return {
            rankings: sortedLeaderboard,
            totalPushUps,
            totalAthletes: sortedLeaderboard.length,
            avgSet: Math.round(totalPushUps / snapshot.docs.length),
            dailyAvg: Math.round(totalPushUps / totalChallengeDays),
            bestIndividualSet: {
                ...bestIndividualSet,
                profile: bestIndividualSetProfile,
            },
        }
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getLeaderboardText(userId) {
    try {
        const snapshot = await db.collection('users').get();
        const data = snapshot.docs.reduce((acc, doc) => {
            /*
             id: "myID",
             name: "joanne",
             count: 22,
             created: "2019-10-07T09:08:22.000Z"
            */
            const rawData = doc.data();
            const {id, count, name} = {
                ...rawData,
                created: startOfDay(rawData.created.toDate()),
            };
            const countLength = (count).toString().length;

            return {
                ...acc,
                slackIdMap: {
                    ...acc.slackIdMap,
                    [id]: name,
                },
                leaderboard: {
                    ...acc.leaderboard,
                    [id]: acc.leaderboard[id] ? acc.leaderboard[id] + count : count,
                },
                longestNameLength: name.length > acc.longestNameLength ? name.length : acc.longestNameLength,
                longestCountLength: countLength > acc.longestCountLength ? countLength : acc.longestCountLength,
            }
        }, {
            slackIdMap: {},
            leaderboard: {},
            longestNameLength: 0,
            longestCountLength: 0,
        });

        const {leaderboard, slackIdMap} = data;

        const leaderArr = Object.keys(leaderboard).map(id => ({
            id,
            name: slackIdMap[id],
            count: leaderboard[id],
        }));

        const maxAmountForSummary = 20;
        const hasMoreData = leaderArr.length > 20;
        const clippedLeaderboard = hasMoreData ? [...leaderArr.slice(0, maxAmountForSummary)] : [...leaderArr];

        const sortedLeaderboard = clippedLeaderboard.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        const formattedText = sortedLeaderboard.reduce((acc, {name, count}, i, arr) => {
            const isFirst = i === 0;
            const rank = i + 1;
            const {longestNameLength, longestCountLength} = data;
            const padding = 8;
            const nameColLength = longestNameLength + padding;
            const headingText = 'Athlete';
            const nameHeadingLength = headingText.length;

            const heading2Text = 'Total';
            const heading3Text = 'Catch Up';

            const nameLength = name.length;
            const spaceAfterNameHeading = nameColLength - nameHeadingLength;
            const spaceAfterName = nameColLength - nameLength;
            const headingWithSpacing = headingText + new Array(spaceAfterNameHeading + 1).join(' ');
            const heading2WithSpacing = heading2Text + new Array(padding).join(' ');
            const nameWithSpacing = name + new Array(spaceAfterName + 1).join(' ');
            const leaderCount = arr[0].count;
            const catchTheLeader = leaderCount - count;
            const spaceAfterCount = heading2WithSpacing.length - count.toString().length;
            const countWithSpacing = count + new Array(spaceAfterCount + 1).join(' ');

            if (isFirst) {
                return `#   ${headingWithSpacing}${heading2WithSpacing}${heading3Text}\n${rank}.  ${nameWithSpacing}${countWithSpacing}\n`;
            }

            return `${acc}${rank}.  ${nameWithSpacing}${countWithSpacing}${catchTheLeader} more\n`;
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

export async function getLeaderboardData() {
    try {
        const snapshot = await db.collection('users').get();
        const data = snapshot.docs.reduce((acc, doc) => {
            const rawData = doc.data();
            const {id, count, name} = {
                ...rawData,
                created: startOfDay(rawData.created.toDate()),
            };
            return {
                ...acc,
                slackIdMap: {
                    ...acc.slackIdMap,
                    [id]: name,
                },
                leaderboard: {
                    ...acc.leaderboard,
                    [id]: acc.leaderboard[id] ? acc.leaderboard[id] + count : count,
                },
                totalPushUps: acc.totalPushUps + count,
            }
        }, {
            slackIdMap: {},
            leaderboard: {},
            totalPushUps: 0,
        });

        const {totalPushUps, leaderboard, slackIdMap} = data;

        const leaderArr = await Promise.all(Object.keys(leaderboard).map(async id => {
            const name = slackIdMap[id];

            return {
                id,
                name,
                count: leaderboard[id],
                profile: await getSlackProfile(id),
            }
        }));

        const sortedLeaderboard = leaderArr.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        return {
            rankings: sortedLeaderboard,
            totalPushUps,
        }
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getTotalPushUpsCount() {
    try {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.reduce((acc, doc) => {
            const {count} = doc.data();
            return acc + count;
        }, 0);
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function addUserData({
                                      name,
                                      id,
                                      count
                                  }) {
    return db.collection('users').add({
        name,
        id,
        count: count,
        created: new Date(),
    });
}

export async function getTotalChallengeDays() {
    try {
        const [firstSnapshot, lastSnapshot] = await Promise.all([
            await db.collection('users')
                .orderBy('created', 'asc')
                .limit(1).get(),

            await db.collection('users')
                .orderBy('created', 'desc')
                .limit(1).get()
        ]);

        const firstEntryDate = firstSnapshot.docs.map(doc => doc.data().created.toDate())[0];
        const lastEntryDate = lastSnapshot.docs.map(doc => doc.data().created.toDate())[0];

        return differenceInCalendarDays(lastEntryDate, firstEntryDate) + 1
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getMostRecentSet() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('created', 'desc')
            .limit(1).get();

        return snapshot.docs.map(async (doc) => {
            const rawData = doc.data();
            const created = startOfDay(rawData.created.toDate());
            const profile = await getSlackProfile(rawData.id);
            return {
                ...rawData,
                profile,
                created,
            }
        })[0];
    } catch (err) {
        throw new Error(err.message);
    }
}

/* INDIVIDUAL QUERIES */
async function getUserSetsById(id) {
    return await db.collection('users').where('id', '==', id).get();
}

export async function getDailySetsByUserId(id) {
    try {
        const snapshot = await getUserSetsById(id);

        const countsByDayMap = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const created = format(data.created.toDate(), 'M-d-yyyy');

            return {
                ...acc,
                [created]: acc[created] ? acc[created] + data.count : data.count,
            }
        }, {});

        const firstSnapshot = await db.collection('users')
            .orderBy('created', 'asc')
            .limit(1).get();

        const firstEntryDate = firstSnapshot.docs.map(doc => doc.data().created.toDate())[0];

        const datesArray = eachDayOfInterval(
            { start: firstEntryDate, end: new Date() }
        );

        return datesArray.map(date => {
            const key = format(date, 'M-d-yyyy');

            return {
                name: format(date, 'EEE, MMM d'),
                value: countsByDayMap[key] ? countsByDayMap[key] : 0,
            }
        });
    } catch (err) {
        throw new Error(err.message);
    }
}

export async function getUserStats(id) {
    try {
        const [leaderboardData, totalChallengeDays] = await Promise.all([
            await getLeaderboardData(),
            await getTotalChallengeDays(),
        ]);
        const snapshot = await getUserSetsById(id);

        const {rankings, totalPushUps: totalPushUpsGlobally} = leaderboardData;

        const ranking = rankings.findIndex((r) => r.id === id) + 1;

        const results = snapshot.docs.reduce((acc, doc, index) => {
            const {count, created} = doc.data();
            const formattedCreated = format(created.toDate(), 'EEE, MMM d');

            return {
                ...acc,
                bestSet: {
                    count: count > acc.bestSet.count ? count : acc.bestSet.count,
                    created: count > acc.bestSet.count ? formattedCreated : acc.bestSet.created,
                },
                firstSet: {
                    count,
                    created: formattedCreated,
                },
                mostRecentSet: {
                    count: index === 0 ? count : acc.mostRecentSet.count,
                    created: index === 0 ? formattedCreated : acc.mostRecentSet.created,
                },
                totalPushUps: acc.totalPushUps + count,
            }
        }, {
            bestSet: {
                count: 0,
                created: '',
            },
            firstSet: {
                count: 0,
                created: '',
            },
            mostRecentSet: {
                count: 0,
                created: '',
            },
            totalPushUps: 0,
        });

        const {totalPushUps} = results;
        return {
            ...results,
            ranking,
            dailyAvg: Math.round(totalPushUps / totalChallengeDays),
            contributionPercentage: Math.round((totalPushUps / totalPushUpsGlobally) * 100),
            catchTheLeader: rankings[0].count - totalPushUps,
        }

    } catch (err) {
        throw new Error(err.message);
    }
}
