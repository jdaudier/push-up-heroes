function getCombineDatesForSameAthlete({
                                        currentAthlete,
                                        currentAthleteInArray,
                                        currentAthleteInArrayIndex,
                                        accAthletes,
                                    }) {
    const updatedCurrAthlete = {
        ...currentAthleteInArray,
        created: currentAthleteInArray.created.includes(currentAthlete.created) ? currentAthleteInArray.created : `${currentAthleteInArray.created}, ${currentAthlete.created}`,
    }

    const updatedAccAthletes = [...accAthletes];
    updatedAccAthletes[currentAthleteInArrayIndex] = updatedCurrAthlete;

    return updatedAccAthletes;
}


function getBestIndividualSetAthletes({count, accCount, currentAthlete, accAthletes}) {
    const currentAthleteInArray = accAthletes.find(a => a.id === currentAthlete.id);
    const currentAthleteInArrayIndex = accAthletes.findIndex(a => a.id === currentAthlete.id);

    if (count > accCount) {
        return [currentAthlete];
    }

    if (count === accCount) {
        if (!currentAthleteInArray) {
            return [...accAthletes, currentAthlete];
        }

        return getCombineDatesForSameAthlete({
            currentAthlete,
            currentAthleteInArray,
            currentAthleteInArrayIndex,
            accAthletes,
        });
    }

    return accAthletes;
}

module.exports = getBestIndividualSetAthletes;
