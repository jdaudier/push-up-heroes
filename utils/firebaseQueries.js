import db from '../init-firebase';
import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import getSlackProfile from "./getSlackProfile";

export async function getUsers() {
    try {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => {
            const created = startOfDay(doc.data().created.toDate());
            return {
                ...doc.data(),
                created,
            }
        });
    } catch (err) {
        throw new Error(err.message);
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
