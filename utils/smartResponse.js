import {NUM_HOURS_AWAKE} from './constants';

function maybePluralizePushUps(count) {
    return  count === 1 ? 'push-up' : 'push-ups';
}

function getSmartResponse(rawStats) {
    const {
        id,
        count,
        ranking,
        catchTheLeader,
        bestSet,
        firstSet,
        totalPushUps,
        dailyAvg,
        globalDailyAvg,
        avgSet,
        globalAvgSet,
        currentStreak,
        currentStreakDates,
        contributionPercentage,
        firstPlaceAthlete,
        globalBestIndividualSet,
        totalSets,
        numOfDaysWithEntries,
    } = rawStats;

    const hasMoreThan1Set = totalSets > 1;
    const hasMoreThan1DayOfEntries = numOfDaysWithEntries > 1;

    const facts = [];

    if (ranking === 1) {
        facts.push(`Congrats! You're in the lead!`);
    }

    if (ranking > 1 && totalPushUps === firstPlaceAthlete.count) {
        facts.push(`Congrats! You're tied with <@${firstPlaceAthlete.id}> for *first place*! :dancingmonkey:`);
    }

    const shouldShowSecondPlaceMsg = ranking === 2 && catchTheLeader <= 40;
    if (shouldShowSecondPlaceMsg) {
        facts.push(`<@${firstPlaceAthlete.id}> should be scared. You're in *second place*! Only *${catchTheLeader.toLocaleString()}* more till you catch up!`);
    }

    const shouldShowThirdPlaceMsg = ranking === 3 && catchTheLeader <= 50;
    if (shouldShowThirdPlaceMsg) {
        facts.push( `<@${firstPlaceAthlete.id}> should be shaking. You're in *third place*! Only *${catchTheLeader.toLocaleString()}* more till you catch up!`);
    }

    const notYou = globalBestIndividualSet.athletes.filter(athlete => athlete.id !== id).map(a =>`<@${a.id}>`);

    let bestSetAthleteNames;
    if (notYou.length > 0) {
        bestSetAthleteNames = notYou.join(', ')
    }

    const joinTheRanks = bestSetAthleteNames ? `Join the ranks along with ${bestSetAthleteNames}.` : 'No one has done this many in one set.';

    if (count === globalBestIndividualSet.count) {
        facts.push(`This set is the best individual set so far! ${joinTheRanks} :micdrop:`);
    }

    if (currentStreak > 4) {
        facts.push(`You're currently on a *${currentStreak.toLocaleString()} day streak* (${currentStreakDates})! Keep it up!`);
    }

    if (hasMoreThan1DayOfEntries && count > dailyAvg) {
        facts.push(`This set is higher than your daily average of *${dailyAvg.toLocaleString()}*!`);
    }

    if (hasMoreThan1Set && count === bestSet.count && count !== globalBestIndividualSet.count) {
        facts.push(`This is your best set ever! Go celebrate! :celebrate-hands:`);
    }

    if (count > avgSet) {
        facts.push(`This set is higher than your average set of *${avgSet.toLocaleString()}* push-ups.`);
    }

    if (count > globalAvgSet) {
        facts.push(`This set is higher than the *global* average set of *${globalAvgSet.toLocaleString()}* push-ups. Nicely done!`)
    }

    const isNotInFirstPlace = id !== firstPlaceAthlete.id;

    if (count > firstPlaceAthlete.dailyAvg && isNotInFirstPlace) {
        facts.push(`This set is higher than the daily average of *${firstPlaceAthlete.dailyAvg.toLocaleString()}* from our current champ *${firstPlaceAthlete.profile.real_name}*!`);
    }

    if (count > firstPlaceAthlete.avgSet && isNotInFirstPlace) {
        facts.push(`This set is higher than the average push-ups per set of *${firstPlaceAthlete.avgSet.toLocaleString()}* from our current champ *${firstPlaceAthlete.profile.real_name}*!`);
    }

    if (count > globalDailyAvg) {
        facts.push(`This set is higher than our *global* group daily average of *${globalDailyAvg.toLocaleString()}*!`);
    }

    if (contributionPercentage > 60) {
        facts.push(`You're contributing more than most other athletes. *${contributionPercentage}%* of the push-ups have been put away by you!`);
    }

    const firstSetCount = firstSet.count;
    const diffFromFirstSet = count - firstSetCount;
    if (diffFromFirstSet > 15) {
        facts.push(`Your current set is *${diffFromFirstSet.toLocaleString()}* more than your first set of *${firstSetCount.toLocaleString()}* on ${firstSet.created}.`);
    }

    const alreadyHasCatchUpMessage = shouldShowSecondPlaceMsg || shouldShowThirdPlaceMsg;

    if (ranking > 1 && totalPushUps !== firstPlaceAthlete.count && !alreadyHasCatchUpMessage) {
        const perHourCount = Math.round(catchTheLeader / NUM_HOURS_AWAKE);
        const perHourMessage = catchTheLeader >= 50 ? ` No big deal! That's just *${perHourCount}* ${maybePluralizePushUps(perHourCount)} per hour for the next *${NUM_HOURS_AWAKE}* hours.` : '';

        facts.push(`Just *${catchTheLeader.toLocaleString()} more* till you catch up to *${firstPlaceAthlete.profile.real_name}*, our current champ!${perHourMessage}`);
    }

    const numberOfFacts = facts.length;

    if (numberOfFacts === 1) {
        return `>${facts[0]}`;
    }

    const factsString = `• ${facts.slice(0, 5).join('\n• ')}`;
    return `*Fun facts about this set:*\n${factsString}`
}

export default getSmartResponse;
