import db from '../init-firebase';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import getSlackProfile from './getSlackProfile';
import { utcToZonedTime } from 'date-fns-tz';
import isYesterday from 'date-fns/isYesterday';

const CHALLENGE_ID = 'users';

export async function getFullLeaderboardData() {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).get();
        const data = snapshot.docs.reduce((acc, doc) => {
            /*
            id: "myID",
            name: "joanne",
            count: 22,
            created: "2019-10-07T09:08:22.000Z",
            timeZone: "America/New_York"
            */
            const data = doc.data();
            const created = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'EEE, MMM d');

            const {id, count, name} = data;
            const currentAthlete = {
                id,
                name,
                count,
                created,
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
                    athletes: count > acc.bestIndividualSet.count ? [currentAthlete] :
                        count === acc.bestIndividualSet.count && !acc.bestIndividualSet.athletes.find(a => a.id === id) ?
                            [...acc.bestIndividualSet.athletes, currentAthlete] :
                            acc.bestIndividualSet.athletes,
                }
            }
        }, {
            slackIdMap: {},
            leaderboard: {},
            totalPushUps: 0,
            bestIndividualSet: {
                count: 0,
                athletes: [],
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

        const bestIndividualSetAthletes = await Promise.all(bestIndividualSet.athletes.map(async (athlete) => {
            const bestIndividualSetProfile = await getSlackProfile(athlete.id);
            return {
                ...athlete,
                profile: bestIndividualSetProfile,
            };
        }));

        return {
            rankings: sortedLeaderboard,
            totalPushUps,
            totalAthletes: sortedLeaderboard.length,
            avgSet: Math.round(totalPushUps / snapshot.docs.length),
            dailyAvg: Math.round(totalPushUps / totalChallengeDays),
            bestIndividualSet: {
                count: bestIndividualSet.count,
                athletes: bestIndividualSetAthletes,
            }
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getAllUsersFeeds() {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).orderBy('created', 'desc').get();

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
                    profile: await getSlackProfile(data.id),
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

export async function getLeaderboardText(userId) {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).get();
        const data = snapshot.docs.reduce((acc, doc) => {
            /*
             id: "myID",
             name: "joanne",
             count: 22,
             created: "2019-10-07T09:08:22.000Z",
             timeZone: "America/New_York"
            */
            const data = doc.data();
            const {id, count, name} = data;

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
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getLeaderboardData() {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).get();
        const data = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const {id, count, name} = data;
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
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getTotalPushUpsCount() {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).get();
        return snapshot.docs.reduce((acc, doc) => {
            const {count} = doc.data();
            return acc + count;
        }, 0);
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
                                  }) {
    return db.collection(CHALLENGE_ID).add({
        name,
        id,
        count: count,
        created: new Date(),
        timeZone,
    });
}

export async function getTotalChallengeDays() {
    try {
        const [firstSnapshot, lastSnapshot] = await Promise.all([
            await db.collection(CHALLENGE_ID)
                .orderBy('created', 'asc')
                .limit(1).get(),

            await db.collection(CHALLENGE_ID)
                .orderBy('created', 'desc')
                .limit(1).get()
        ]);

        const firstEntryDate = firstSnapshot.docs.map(doc => doc.data().created.toDate())[0];
        const lastEntryDate = lastSnapshot.docs.map(doc => doc.data().created.toDate())[0];

        return differenceInCalendarDays(lastEntryDate, firstEntryDate) + 1
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getMostRecentSet() {
    try {
        const snapshot = await db.collection(CHALLENGE_ID)
            .orderBy('created', 'desc')
            .limit(1).get();

        return snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const created = format(utcToZonedTime(
                data.created.toDate(),
                data.timeZone,
            ), 'EEE, MMM d');

            const profile = await getSlackProfile(data.id);
            return {
                ...data,
                profile,
                created,
            }
        })[0];
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

/* INDIVIDUAL QUERIES */
async function getUserSetsById(id) {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).where('id', '==', id).orderBy('created').get();

        return snapshot.docs.reduce((acc, doc) => {
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

export async function getDailySetsByUserId(id) {
    try {
        const {countsByDayMap, sortedList} = await getUserSetsById(id);

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

export async function getUserStats(id) {
    try {
        const [leaderboardData, totalChallengeDays] = await Promise.all([
            await getLeaderboardData(),
            await getTotalChallengeDays(),
        ]);

        const snapshot = await db.collection(CHALLENGE_ID).where('id', '==', id).orderBy('created').get();

        const {rankings, totalPushUps: totalPushUpsGlobally} = leaderboardData;

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
                },
                firstSet: {
                    count: index === 0 ? count : acc.firstSet.count,
                    created: index === 0 ? created : acc.firstSet.created,
                    createdShort: index === 0 ? createdShort : acc.firstSet.createdShort,
                },
                mostRecentSet: {
                    count,
                    created: rawCreated,
                },
                totalPushUps: acc.totalPushUps + count,
            }
        }, {
            bestSet: {
                count: 0,
                created: [],
                createdShort: [],
            },
            firstSet: {
                count: 0,
                created: '',
                createdShort: '',
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
            avgSet: Math.round(totalPushUps / snapshot.docs.length),
            contributionPercentage: Math.round((totalPushUps / totalPushUpsGlobally) * 100),
            catchTheLeader: rankings[0].count - totalPushUps,
            firstPlaceAthlete: rankings[0],
        }
    } catch (err) {
        console.error('Error:', err);
        throw new Error(err.message);
    }
}

export async function getStreakData(id) {
    try {
        const {sortedList, countsByDayMap} = await getUserSetsById(id);
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

                let updatedLongestStreakDates, updatedLongestStreakDatesShort;
                if (acc.currentStreak === 0) {
                    updatedLongestStreakDates = [...acc.longestStreakDates, [formattedDate]];
                    updatedLongestStreakDatesShort = [...acc.longestStreakDatesShort, [formattedDateShort]];
                } else {
                    updatedLongestStreakDates = [...acc.longestStreakDates.slice(0, lastIndex), [...lastArr, formattedDate]];
                    updatedLongestStreakDatesShort = [...acc.longestStreakDatesShort.slice(0, lastIndex), [...lastArrShort, formattedDateShort]];
                }

                return {
                    longestStreak: acc.longestStreak,
                    currentStreak: acc.currentStreak + 1,
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

export async function getUserFeed(id) {
    try {
        const snapshot = await db.collection(CHALLENGE_ID).where('id', '==', id).orderBy('created', 'desc').get();

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
