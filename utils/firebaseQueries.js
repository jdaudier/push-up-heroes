import db from '../init-firebase';
import { collection, getDocs, addDoc, orderBy, query, limit, startAfter, where } from "firebase/firestore";
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import differenceInDays from 'date-fns/differenceInDays';
import { utcToZonedTime } from 'date-fns-tz';
import isYesterday from 'date-fns/isYesterday';
import { FEED_LIMIT, MAX_NUM_FOR_SUMMARY } from '../utils/constants';
import getBestIndividualSetAthletes from './getBestIndividualSetAthletes';

export const CHALLENGE_ID = 'challenge-2';
const collectionRef = collection(db, CHALLENGE_ID);

export async function getCollectionSize() {
    try {
        const snapshot = await getDocs(collectionRef);
        return snapshot.size;
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

function getBestDailyTotalOverall(countsByDayByUser) {
    const bestDailyTotal = Object.entries(countsByDayByUser).reduce((acc, curr) => {
        const [date, userMap] = curr;

        const highestByDay = Object.entries(userMap).reduce((a, c) => {
            const [id, profile] = c;
            const {count} = profile;
            const fullProfile = {
                id,
                ...profile.profile,
                date,
            };

            const isCurrentCountHigher = count > a.count;
            if (isCurrentCountHigher) {
                return {
                    profiles: [fullProfile],
                    count,
                }
            }

            const isCurrentCountSameAsHighest = count === a.count;
            if (isCurrentCountSameAsHighest) {
                return {
                    profiles: [...a.profiles, fullProfile],
                    count,
                }
            }

            return a;
        }, {
            profiles: [],
            count: 0,
        });

        const isCurrentCountHigher = highestByDay.count > acc.count;
        if (isCurrentCountHigher) {
            return {
                profiles: highestByDay.profiles,
                count: highestByDay.count,
            }
        }

        const isCurrentCountSameAsHighest = highestByDay.count === acc.count;
        if (isCurrentCountSameAsHighest) {
            return {
                profiles: [...acc.profiles, ...highestByDay.profiles],
                count: highestByDay.count,
            }
        }

        return acc;
    }, {
        profiles: [],
        count: 0,
    });

    const dedupedProfiles = bestDailyTotal.profiles.reduce((acc, curr) => {
        const index = acc.findIndex(profile => profile.id === curr.id);
        const alreadyExists = index >= 0;

        if (alreadyExists) {
            const existingProfile = acc[index];

            acc[index] = {
                ...existingProfile,
                date: `${existingProfile.date}, ${curr.date}`
            };
            return acc;
        }

        return [...acc, curr];
    }, []);

    return {
        profiles: dedupedProfiles,
        count: bestDailyTotal.count
    }
}

export async function getFullLeaderboardData() {
    try {
        const snapshot = await getDocs(collectionRef);

        if (snapshot.size === 0) {
            return {
                totalPushUps: 0
            }
        }

        const data = snapshot.docs.reduce((acc, doc) => {
            /*
            id: "myID",
            name: "joanne",
            count: 22,
            created: "2019-10-07T09:08:22.000Z",
            timeZone: "America/New_York"
            */
            const data = doc.data();
            const rawCreated = data.created.toDate();

            const createdShort = format(utcToZonedTime(
                rawCreated,
                data.timeZone,
            ), 'MMM d');

            const {id, count, name, profile} = data;
            const currentAthlete = {
                id,
                name,
                count,
                created: createdShort,
                profile,
            };

            const usersMap = acc.countsByDayByUser[createdShort];
            const prevCount = usersMap && usersMap[id] ? usersMap[id].count : 0;

            return {
                ...acc,
                slackIdMap: {
                    ...acc.slackIdMap,
                    [id]: name,
                },
                slackProfileMap: {
                    ...acc.slackProfileMap,
                    [id]: profile,
                },
                leaderboard: {
                    ...acc.leaderboard,
                    [id]: acc.leaderboard[id] ? acc.leaderboard[id] + count : count,
                },
                totalPushUps: acc.totalPushUps + count,
                bestIndividualSet: {
                    count: count > acc.bestIndividualSet.count ? count : acc.bestIndividualSet.count,
                    athletes: getBestIndividualSetAthletes({
                        count: count,
                        accCount: acc.bestIndividualSet.count,
                        currentAthlete,
                        accAthletes: acc.bestIndividualSet.athletes
                    })
                },
                countsByDayByUser: {
                    ...acc.countsByDayByUser,
                    [createdShort]: {
                        ...acc.countsByDayByUser[createdShort],
                        [id]: {
                            profile,
                            count: prevCount ? prevCount + count : count,
                        },
                    }
                },
            }
        }, {
            slackIdMap: {},
            slackProfileMap: {},
            leaderboard: {},
            totalPushUps: 0,
            bestIndividualSet: {
                count: 0,
                athletes: [],
            },
            countsByDayByUser: {},
        });

        const {totalPushUps, bestIndividualSet, leaderboard, slackIdMap, slackProfileMap, countsByDayByUser} = data;
        const totalChallengeDays = await getTotalChallengeDays();
        const bestDailyTotalOverall = getBestDailyTotalOverall(countsByDayByUser);

        const leaderArr = Object.keys(leaderboard).map((id) => {
            const name = slackIdMap[id];
            const count =  leaderboard[id];
            const profile = slackProfileMap[id];
            return {
                name,
                count,
                id,
                profile,
                dailyAvg: Math.round(count / totalChallengeDays),
                contributionPercentage: Math.round((count / totalPushUps) * 100) || Math.ceil((count / totalPushUps) * 100),
            };
        });

        const sortedLeaderboard = leaderArr.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        const totalSets = snapshot.size;

        return {
            rankings: sortedLeaderboard,
            totalPushUps,
            totalSets,
            totalAthletes: sortedLeaderboard.length,
            avgSet: Math.round(totalPushUps / totalSets),
            dailyAvg: Math.round(totalPushUps / totalChallengeDays),
            bestIndividualSet,
            bestDailyTotalOverall,
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getAllUsersFeeds({page}) {
    const firstPageQuery = query(collectionRef, orderBy('created', 'desc'), limit(FEED_LIMIT));

    let currentPage = 1;

    async function getPaginatedPageQuery(q) {
        if (currentPage < page) {
            const snapshot = await getDocs(q);
            const { length, [length - 1]: last } = snapshot.docs;

            const next = query(collectionRef, orderBy('created', 'desc'), startAfter(last), limit(FEED_LIMIT));

            currentPage++;
            return getPaginatedPageQuery(next);
        }

        return q;
    }

    try {
        const pageQuery = await getPaginatedPageQuery(firstPageQuery);
        const snapshot = await getDocs(pageQuery);

        return snapshot.docs.reduce(async (acc, doc) => {
            const prevAcc = await acc;

            const data = doc.data();
            const dayOfWeek = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'E');

            const date = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'MMM d, y');

            const time = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'h:mm aaaa');

            const simplifiedDate = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'yyyy-MM-dd');

            return {
                feed:[...prevAcc.feed, {
                    ...data,
                    slackId: data.id,
                    dayOfWeek,
                    date,
                    time,
                    simplifiedDate,
                }],
                setsByDayMap: {
                    ...prevAcc.setsByDayMap,
                    [simplifiedDate]: prevAcc.setsByDayMap[simplifiedDate] ? prevAcc.setsByDayMap[simplifiedDate] + 1 : 1,
                }
            }
        }, Promise.resolve({
            feed: [],
            setsByDayMap: {}
        }));
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getLeaderboardText(userId, withContext = true) {
    try {
        const snapshot = await getDocs(collectionRef);
        const data = snapshot.docs.reduce((acc, doc) => {
            /*
             id: "myID",
             name: "joanne",
             count: 22,
             created: "2019-10-07T09:08:22.000Z",
             timeZone: "America/New_York"
            */
            const data = doc.data();
            const {id, count, profile: {real_name: name}} = data;

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

        const hasMoreData = leaderArr.length > 20;
        const clippedLeaderboard = hasMoreData ? [...leaderArr.slice(0, MAX_NUM_FOR_SUMMARY)] : leaderArr;

        const sortedLeaderboard = clippedLeaderboard.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        const formattedText = sortedLeaderboard.reduce((acc, {name, count}, i, arr) => {
            const isFirst = i === 0;
            const rank = i + 1;
            const {longestNameLength, longestCountLength} = data;
            const padding = 4;
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
                return `#    ${headingWithSpacing}${heading2WithSpacing}${heading3Text}\n${rank}.   ${nameWithSpacing}${countWithSpacing}\n`;
            }

            const isSingleDigitRank = rank < 10;
            if (isSingleDigitRank) {
                // This is to line up the names
                return `${acc}${rank}.   ${nameWithSpacing}${countWithSpacing}${catchTheLeader} more\n`;
            }

            return `${acc}${rank}.  ${nameWithSpacing}${countWithSpacing}${catchTheLeader} more\n`;
        }, '');

        const leaderboardText = "```" + formattedText + "```";

        const context = userId ? `_<@${userId}>` + " triggered this from the `/leaderboard` command._" : '_Use the `/leaderboard` command to see the latest data._';
        const webLink = ':linechart: _More fun data at <https://pushupheroes.com|pushupheroes.com>._';

        const top3 = sortedLeaderboard.slice(0, 3);
        const summary = top3.map((person, i) => {
            switch (i) {
                case (0): return `*${person.name}* is in first place! :first_place_medal:`;
                case (1): return `*${person.name}* is in second place! :second_place_medal:`;
                case (2): return `*${person.name}* is in third place! :third_place_medal:`;
            }
        }).join('\n');

        const fallbackDate = format(new Date(), 'EEE, MMM dd');
        const date = `<!date^${Math.floor(new Date() / 1000)}^{date_short_pretty} at {time}|${fallbackDate}>`;

        const fullText = withContext ? `*LEADERBOARD - ${date}*\n${summary}\n${leaderboardText}\n${context}\n${webLink}` : `*LEADERBOARD - ${date}*\n${summary}\n${leaderboardText}\n${webLink}`;

        return sortedLeaderboard.length > 0 ? fullText : '';
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

async function getLeaderboardData() {
    try {
        const snapshot = await getDocs(collectionRef);
        const data = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();

            const created = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'EEE, MMM d');

            const {id, count, name, profile} = data;

            const currentAthlete = {
                id,
                name,
                count,
                created,
                profile,
            };

            return {
                ...acc,
                slackIdMap: {
                    ...acc.slackIdMap,
                    [id]: name,
                },
                slackProfileMap: {
                    ...acc.slackProfileMap,
                    [id]: profile,
                },
                setsMapById: {
                    ...acc.setsMapById,
                    [id]: acc.setsMapById[id] ? acc.setsMapById[id] + 1 : 1,
                },
                bestIndividualSet: {
                    count: count > acc.bestIndividualSet.count ? count : acc.bestIndividualSet.count,
                    athletes: count > acc.bestIndividualSet.count ? [currentAthlete] :
                        count === acc.bestIndividualSet.count && !acc.bestIndividualSet.athletes.find(a => a.id === id) ?
                            [...acc.bestIndividualSet.athletes, currentAthlete] :
                            acc.bestIndividualSet.athletes,
                },
                leaderboard: {
                    ...acc.leaderboard,
                    [id]: acc.leaderboard[id] ? acc.leaderboard[id] + count : count,
                },
                totalPushUps: acc.totalPushUps + count,
            }
        }, {
            slackIdMap: {},
            slackProfileMap: {},
            setsMapById: {},
            bestIndividualSet: {
                count: 0,
                athletes: [],
            },
            leaderboard: {},
            totalPushUps: 0,
        });

        const {totalPushUps, leaderboard, slackIdMap, slackProfileMap, setsMapById, bestIndividualSet} = data;

        const leaderArr = Object.keys(leaderboard).map(id => {
            const name = slackIdMap[id];
            const profile = slackProfileMap[id];

            return {
                id,
                name,
                count: leaderboard[id],
                totalSets: setsMapById[id],
                profile,
            }
        });

        const sortedLeaderboard = leaderArr.sort((aPerson, bPerson) => {
            const aCount = aPerson.count;
            const bCount = bPerson.count;
            return bCount - aCount;
        });

        return {
            rankings: sortedLeaderboard,
            totalPushUps,
            bestIndividualSet,
            totalSets: snapshot.size,
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function addUserData({
                                      name,
                                      id,
                                      count,
                                      timeZone,
                                      profile,
                                  }) {
    return await addDoc(collectionRef, {
        name,
        id,
        count: count,
        created: new Date(),
        timeZone,
        profile,
    });
}

export async function getTotalChallengeDays() {
    try {
        const firstSnapshot = await getDocs(query(collectionRef, orderBy('created', 'asc'), limit(1)));
        const firstEntryDate = firstSnapshot.docs.map(doc => doc.data().created.toDate())[0];
        const now = new Date();

        return differenceInDays(now, firstEntryDate) + 1
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getMostRecentSet() {
    try {
        const q = query(collectionRef, orderBy('created', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            const created = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'EEE, MMM d');

            return {
                ...data,
                created,
            }
        })[0];
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getGlobalChartData() {
    try {
        const q = query(collectionRef, orderBy('created'));
        const snapshot = await getDocs(q);

        const {
            firstEntry,
            lastEntry,
            countsByDayMap,
        } = snapshot.docs.reduce((acc, doc, i, arr) => {
            const data = doc.data();
            const created = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'yyyy-MM-dd');

            const currentSet = {
                ...data,
                created,
                rawCreated: data.created.toDate(),
            };
            const prevCount = acc.countsByDayMap[created];
            return {
                ...acc,
                firstEntry: i === 0 ? currentSet : acc.firstEntry,
                lastEntry: i === arr.length - 1 ? currentSet : acc.lastEntry,
                countsByDayMap: {
                    ...acc.countsByDayMap,
                    [created]: prevCount ? prevCount + currentSet.count : currentSet.count,
                }
            }
        }, {
            firstEntry: {},
            lastEntry: {},
            countsByDayMap: {},
        });

        const firstEntryDateLocalTime = format(utcToZonedTime(
            firstEntry.rawCreated,
            firstEntry.timeZone,
        ), 'yyyy-MM-dd');

        const lastEntryDateLocalTime = format(utcToZonedTime(
            lastEntry.rawCreated,
            lastEntry.timeZone,
        ), 'yyyy-MM-dd');

        const datesArray = eachDayOfInterval(
            { start: parseISO(firstEntryDateLocalTime), end: parseISO(lastEntryDateLocalTime) }
        );

        return datesArray.map(date => {
            const key = format(date, 'yyyy-MM-dd');

            return {
                label: format(date, 'EEE, MMM d'),
                value: countsByDayMap[key] ? countsByDayMap[key] : 0,
            }
        });
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

/* INDIVIDUAL QUERIES */
async function getUserPushUpsById(id) {
    try {
        const q = query(collectionRef, where('id', '==', id), orderBy('created'));
        const snapshot = await getDocs(q);

        return snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const created = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'yyyy-MM-dd');

            const humanReadableCreated = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'EEE, MMM d');

            const currentSet = {
                ...data,
                created,
                humanReadableCreated,
                rawCreated: data.created.toDate(),
            };
            const prevCount = acc.countsByDayMap[created];
            return {
                ...acc,
                sortedList: [...acc.sortedList, currentSet],
                countsByDayMap: {
                    ...acc.countsByDayMap,
                    [created]: prevCount ? prevCount + currentSet.count : currentSet.count,
                }
            }
        }, {
            sortedList: [],
            countsByDayMap: {},
        });
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err);
    }
}

export async function getPushUpsByUserId(id) {
    try {
        const {countsByDayMap, sortedList} = await getUserPushUpsById(id);

        const firstEntry = sortedList[0];
        const firstEntryDateLocalTime = format(utcToZonedTime(
            firstEntry.rawCreated,
            firstEntry.timeZone,
        ), 'yyyy-MM-dd');


        const lastEntry = sortedList[sortedList.length - 1];
        const lastEntryDateLocalTime = format(utcToZonedTime(
            lastEntry.rawCreated,
            lastEntry.timeZone,
        ), 'yyyy-MM-dd');

        const datesArray = eachDayOfInterval(
            { start: parseISO(firstEntryDateLocalTime), end: parseISO(lastEntryDateLocalTime) }
        );

        return {
            sorted: sortedList,
            byDay: datesArray.map(date => {
                const key = format(date, 'yyyy-MM-dd');

                return {
                    label: format(date, 'EEE, MMM d'),
                    value: countsByDayMap[key] ? countsByDayMap[key] : 0,
                }
            }),
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getUserStats(id) {
    try {
        const [leaderboardData, totalChallengeDays] = await Promise.all([
            getLeaderboardData(),
            getTotalChallengeDays(),
        ]);

        const q = query(collectionRef, where('id', '==', id), orderBy('created'));
        const snapshot = await getDocs(q);

        const {rankings, totalPushUps: totalPushUpsGlobally, bestIndividualSet, totalSets} = leaderboardData;

        const ranking = rankings.findIndex((r) => r.id === id) + 1;

        const results = snapshot.docs.reduce((acc, doc, index) => {
            const data = doc.data();
            const rawCreated = data.created.toDate();
            const created = format(utcToZonedTime(
                rawCreated,
                data.timeZone,
            ), 'EEE, MMM d');

            const createdShort = format(utcToZonedTime(
                rawCreated,
                data.timeZone,
            ), 'MMM d');

            const {count} = data;

            const prevCount = acc.countsByDayMap[createdShort];

            const countsByDayMap = {
                ...acc.countsByDayMap,
                [createdShort]: prevCount ? prevCount + count : count,
            }

            const createdShortISO = format(utcToZonedTime(
                rawCreated,
                data.timeZone,
            ), 'yyyy-MM-dd');

            const today = format(utcToZonedTime(
                new Date(),
                data.timeZone,
            ), 'yyyy-MM-dd');

            const prevCountByISO = acc.countsByDayInISOMap[createdShortISO];

            const countsByDayInISOMap = {
                ...acc.countsByDayInISOMap,
                [createdShortISO]: prevCountByISO ? prevCountByISO + count : count,
            }

            const todayCount = countsByDayInISOMap[today];

            function getNumOfSetsWithBestSet(count, bestSetCount, numOfSets) {
                if (count > bestSetCount) {
                    return 1;
                }

                if (count === bestSetCount) {
                    return numOfSets + 1;
                }

                return numOfSets;
            }

            return {
                ...acc,
                bestSet: {
                    count: count > acc.bestSet.count ? count : acc.bestSet.count,
                    created: count > acc.bestSet.count ? [created] :
                        count === acc.bestSet.count && acc.bestSet.created.indexOf(created) === -1 ?
                            [...acc.bestSet.created, created] : acc.bestSet.created,
                    createdShort: count > acc.bestSet.count ? [createdShort] :
                        count === acc.bestSet.count && acc.bestSet.created.indexOf(created) === -1 ?
                            [...acc.bestSet.createdShort, createdShort] : acc.bestSet.createdShort,
                    numOfSets: getNumOfSetsWithBestSet(count, acc.bestSet.count, acc.bestSet.numOfSets)
                },
                firstSet: {
                    count: index === 0 ? count : acc.firstSet.count,
                    created: index === 0 ? created : acc.firstSet.created,
                    createdShort: index === 0 ? createdShort : acc.firstSet.createdShort,
                },
                mostRecentSet: {
                    count,
                    created: rawCreated,
                    createdShort,
                },
                countsByDayMap,
                countsByDayInISOMap,
                totalPushUps: acc.totalPushUps + count,
                numOfDaysWithEntries: Object.keys(countsByDayMap).length,
                todayCount: todayCount === undefined ? 0 : todayCount,
            }
        }, {
            bestSet: {
                count: 0,
                created: [],
                createdShort: [],
                numOfSets: 0,
            },
            firstSet: {
                count: 0,
                created: '',
                createdShort: '',
            },
            mostRecentSet: {
                count: 0,
                created: '',
                createdShort: '',
            },
            countsByDayMap: {},
            countsByDayInISOMap: {},
            totalPushUps: 0,
            totalSets: snapshot.size,
            numOfDaysWithEntries: 0,
            todayCount: 0,
        });

        const {totalPushUps, countsByDayMap, todayCount} = results;

        const firstPlaceAthlete = rankings[0];

        const bestDailyTotal = Object.entries(countsByDayMap).reduce((acc, curr) => {
            const [date, count] = curr;

            const isCurrentCountHigher = count > acc.count;
            if (isCurrentCountHigher) {
                return {
                    created: [date],
                    count,
                }
            }

            const isCurrentCountSameAsHighest = count === acc.count;
            if (isCurrentCountSameAsHighest) {
                return {
                    created: [...acc.created, date],
                    count,
                }
            }

            return acc;
        }, {
            created: [],
            count: 0,
        });

        return {
            ...results,
            todayCount,
            bestDailyTotal,
            ranking,
            dailyAvg: Math.round(totalPushUps / totalChallengeDays),
            globalDailyAvg: Math.round(totalPushUpsGlobally / totalChallengeDays),
            avgSet: Math.round(totalPushUps / snapshot.size),
            globalAvgSet: Math.round(totalPushUpsGlobally / totalSets),
            contributionPercentage: Math.round((totalPushUps / totalPushUpsGlobally) * 100) || Math.ceil((totalPushUps / totalPushUpsGlobally) * 100),
            catchTheLeader: rankings[0].count - totalPushUps,
            firstPlaceAthlete: {
                ...firstPlaceAthlete,
                dailyAvg: Math.round(firstPlaceAthlete.count / totalChallengeDays),
                avgSet: Math.round(firstPlaceAthlete.count / firstPlaceAthlete.totalSets),
            },
            globalBestIndividualSet: bestIndividualSet,
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getStreakData(id) {
    try {
        const q = query(collectionRef, orderBy('created', 'asc'), limit(1));
        const firstSnapshot = await getDocs(q);

        const challengeStartDate = firstSnapshot.docs.map(doc => {
            const data = doc.data();
            const rawCreated = data.created.toDate();
            return format(utcToZonedTime(
                rawCreated,
                data.timeZone,
            ), 'yyyy-MM-dd');
        })[0];

        const {sortedList, countsByDayMap} = await getUserPushUpsById(id);
        const {length, 0: firstEntry, [length - 1]: lastEntry} = sortedList;

        const firstEntryDate = format(utcToZonedTime(
            firstEntry.rawCreated,
            firstEntry.timeZone,
        ), 'yyyy-MM-dd');

        const lastEntryDate = format(utcToZonedTime(
            lastEntry.rawCreated,
            lastEntry.timeZone,
        ), 'yyyy-MM-dd');

        const localToday = format(utcToZonedTime(
            new Date(),
            firstEntry.timeZone,
        ), 'yyyy-MM-dd');

        const yesterdayOrToday = isYesterday(parseISO(lastEntryDate)) ? lastEntryDate : localToday;

        const datesArray = eachDayOfInterval(
            { start: parseISO(firstEntryDate), end: parseISO(yesterdayOrToday) }
        );

        const results = datesArray.reduce((acc, date) => {
            const simplifiedDate = format(date, 'yyyy-MM-dd');
            const formattedDate = format(date, 'EEE, MMM d');
            const formattedDateShort = format(date, 'MMM d');

            const didPushUps = Boolean(countsByDayMap[simplifiedDate]);

            if (didPushUps) {
                const lastIndex = acc.longestStreakDates.length - 1;
                const lastArr = acc.longestStreakDates[lastIndex];
                const lastArrShort = acc.longestStreakDatesShort[lastIndex];
                const currentStreak = acc.currentStreak + 1;

                let updatedLongestStreakDates, updatedLongestStreakDatesShort;
                if (acc.currentStreak === 0) {
                    updatedLongestStreakDates = [...acc.longestStreakDates, [formattedDate]];
                    updatedLongestStreakDatesShort = [...acc.longestStreakDatesShort, [formattedDateShort]];
                } else {
                    updatedLongestStreakDates = [...acc.longestStreakDates.slice(0, lastIndex), [...lastArr, formattedDate]];
                    updatedLongestStreakDatesShort = [...acc.longestStreakDatesShort.slice(0, lastIndex), [...lastArrShort, formattedDateShort]];
                }

                return {
                    longestStreak: currentStreak > acc.longestStreak ? currentStreak : acc.longestStreak,
                    currentStreak,
                    longestStreakDates: updatedLongestStreakDates,
                    longestStreakDatesShort: updatedLongestStreakDatesShort,
                    currentStreakDates: [...acc.currentStreakDates, formattedDate],
                    currentStreakDatesShort: [...acc.currentStreakDatesShort, formattedDateShort],
                }
            }

            return {
                longestStreak: acc.currentStreak > acc.longestStreak ? acc.currentStreak : acc.longestStreak,
                currentStreak: 0,
                longestStreakDates: acc.longestStreakDates,
                longestStreakDatesShort: acc.longestStreakDatesShort,
                currentStreakDates: [],
                currentStreakDatesShort: [],
            };
        }, {
            longestStreak: 0,
            currentStreak: 0,
            longestStreakDates: [],
            longestStreakDatesShort: [],
            currentStreakDates: [],
            currentStreakDatesShort: [],
        });

        const {longestStreak, currentStreak, longestStreakDates, currentStreakDates, longestStreakDatesShort, currentStreakDatesShort} = results;

        const longestStreakDatesFormatted = longestStreakDates.reduce((acc, curr) => {
            if (curr.length > acc.length) {
                return curr;
            }

            return acc;
        }, []);

        const longestStreakDatesShortFormatted = longestStreakDatesShort.reduce((acc, curr) => {
            if (curr.length > acc.length) {
                return curr;
            }

            return acc;
        }, []);


        const longestStreakDatesText = longestStreakDatesFormatted.length === 1 ?
            longestStreakDatesFormatted[0] :
            `${longestStreakDatesFormatted[0]} - ${longestStreakDatesFormatted[longestStreakDatesFormatted.length - 1]}`;

        const currentStreakDatesText = currentStreakDates.length === 0 ? '' :
            currentStreakDates.length === 1 ? currentStreakDates[0] :
                `${currentStreakDates[0]} - ${currentStreakDates[currentStreakDates.length - 1]}`;

        const longestStreakDatesShortText = longestStreakDatesShortFormatted.length === 1 ?
            longestStreakDatesShortFormatted[0] :
            `${longestStreakDatesShortFormatted[0]} - ${longestStreakDatesShortFormatted[longestStreakDatesShortFormatted.length - 1]}`;

        const currentStreakDatesShortText = currentStreakDatesShort.length === 0 ? '' :
            currentStreakDatesShort.length === 1 ? currentStreakDatesShort[0] :
                `${currentStreakDatesShort[0]} - ${currentStreakDatesShort[currentStreakDatesShort.length - 1]}`;

        return {
            challengeStartDate,
            countsByDayMap,
            longestStreak,
            currentStreak,
            longestStreakDates: longestStreakDatesText,
            longestStreakDatesShort: longestStreakDatesShortText,
            currentStreakDates: currentStreakDatesText,
            currentStreakDatesShort: currentStreakDatesShortText,
        };
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getUserFeed({id, page}) {
    const firstPageQuery = query(collectionRef, where('id', '==', id), orderBy('created', 'desc'), limit(FEED_LIMIT));

    let currentPage = 1;

    async function getPaginatedPageQuery(q) {
        if (currentPage < page) {
            const snapshot = await getDocs(q);
            const { length, [length - 1]: last } = snapshot.docs;

            const nextQuery = query(collectionRef, where('id', '==', id), orderBy('created', 'desc'), startAfter(last), limit(FEED_LIMIT));

            currentPage++;
            return getPaginatedPageQuery(nextQuery);
        }

        return q;
    }

    try {
        const pageQuery = await getPaginatedPageQuery(firstPageQuery);
        const snapshot = await getDocs(pageQuery);

        return snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const dayOfWeek = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'E');

            const date = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'MMM d, y');

            const time = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'h:mm aaaa');

            const simplifiedDate = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'yyyy-MM-dd');

            return {
                feed: [...acc.feed, {
                    ...data,
                    dayOfWeek,
                    date,
                    time,
                    simplifiedDate,
                }],
                setsByDayMap: {
                    ...acc.setsByDayMap,
                    [simplifiedDate]: acc.setsByDayMap[simplifiedDate] ? acc.setsByDayMap[simplifiedDate] + 1 : 1,
                }
            }
        }, {
            feed: [],
            setsByDayMap: {}
        });
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}
