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
    } = rawStats;

    if (ranking === 1) {
        return `Wanna know who's in the lead? Just look in the mirror! :party:`
    }

    if (ranking > 1 && totalPushUps === firstPlaceAthlete.count) {
        return `Congrats! Looks like you're tied with <@${firstPlaceAthlete.id}> for *first place*! :dancingmonkey:`
    }

    if (ranking === 2) {
        return `<@${firstPlaceAthlete.id}> should be scared. You're in *second place*! Only *${catchTheLeader.toLocaleString()}* more till you catch up!`
    }

    if (ranking === 3) {
        return `<@${firstPlaceAthlete.id}> should be shaking. You're in *third place*! Only *${catchTheLeader.toLocaleString()}* more till you catch up!`
    }

    const notYou = globalBestIndividualSet.athletes.filter(athlete => athlete.id !== id).map(a =>`<@${a.id}>`);

    let bestSetAthleteNames;
    if (notYou.length > 0) {
        bestSetAthleteNames = notYou.join(', ')
    }

    const joinTheRanks = bestSetAthleteNames ? `Join the ranks along with ${bestSetAthleteNames}.` : 'No one has done this many in one set.';

    if (count === globalBestIndividualSet.count) {
        return `Woah! This set is the best individual set so far! ${joinTheRanks} :micdrop:`;
    }

    if (currentStreak > 4) {
        return `Great job! You're currently on a *${currentStreak.toLocaleString()} day streak* (${currentStreakDates})! Keep it up buddy!`
    }

    if (count > dailyAvg) {
        return `Good one! This set is higher than your daily average of *${dailyAvg.toLocaleString()}*!`
    }

    if (count === bestSet.count) {
        return `Looks like this is your best set ever! Go celebrate, my friend! :celebrate-hands:`
    }

    if (count > avgSet) {
        return `Boom! This set is higher than your average set of *${avgSet.toLocaleString()}* push-ups. Dwayne “The Rock” Johnson would be proud!`
    }

    if (count > globalAvgSet) {
        return `Dwayne “The Rock” Johnson can smell what you're cooking... victory! This set is higher than the global average set of *${globalAvgSet.toLocaleString()}* push-ups. Nicely done, buddy!`
    }

    if (count > firstPlaceAthlete.dailyAvg) {
        return `<@${firstPlaceAthlete.id}>'s got nothing on you! This set is higher than the daily average of *${firstPlaceAthlete.dailyAvg.toLocaleString()}* from our current champ!`
    }

    if (count > firstPlaceAthlete.avgSet) {
        return `<@${firstPlaceAthlete.id}>'s got nothing on you! This set is higher than the average push-ups per set of *${firstPlaceAthlete.avgSet.toLocaleString()}* from our current champ!`
    }

    if (count > globalDailyAvg) {
        return `Nice! This set is higher than our global (group) daily average of *${globalDailyAvg.toLocaleString()}*!`
    }

    if (contributionPercentage > 60) {
        return `Wow! You're contributing more than most other athletes. ${contributionPercentage}% of the push-ups have been put away by you!`
    }

    const firstSetCount = firstSet.count;
    const diffFromFirstSet = count - firstSetCount;
    if (diffFromFirstSet > 15) {
        return `Oh, look how far you've come! Your current set is ${diffFromFirstSet.toLocaleString()} more than your first set of ${firstSetCount.toLocaleString()} on ${firstSet.created}.`;
    }

    return `Great job! Just *${catchTheLeader.toLocaleString()} more* till you catch up to *${firstPlaceAthlete.profile.real_name}*, our current champ!`;
}

export default getSmartResponse;
