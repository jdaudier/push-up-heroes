import { Grid, Statistic } from 'semantic-ui-react';
/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const statsBoxBase = {
    borderRadius: 4,
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5'
};

const statsBoxCss = (color) => {
    switch (color) {
        case 'blue':
            return {
                ...statsBoxBase,
                backgroundColor: '#55acee',
            };
        case 'yellow':
            return {
                ...statsBoxBase,
                backgroundColor: '#ffac33',
            };

        case 'red':
            return {
                ...statsBoxBase,
                backgroundColor: '#dd2e44',
            };

    }
};

const Stat = ({color, children}) => {
    return (
        <div css={statsBoxCss(color)}>
            {children}
        </div>
    )
};

const Stats = ({data}) => {
    if (!data) return null;

    const {mostRecentSet, leaderboard} = data;
    const {totalAthletes, totalPushUps, dailyAvg, avgSet, bestIndividualSet} = leaderboard;

    return (
        <Grid doubling columns={3} stackable style={{marginBottom: 40}}>
            <Grid.Column>
                <Stat color="blue">
                    <Statistic inverted label='Total Athletes' value={totalAthletes} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Total Push-Ups' value={totalPushUps} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="red">
                    <Statistic inverted label='Daily Average' value={dailyAvg} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Average Set' value={avgSet} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="red">
                    <Statistic inverted label='Best Individual Set' value={bestIndividualSet.count} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="blue">
                    <Statistic inverted label='Most Recent Set' value={mostRecentSet.count} />
                </Stat>
            </Grid.Column>
        </Grid>
    )
};

export default Stats;
