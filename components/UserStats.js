import {Grid, Statistic, Popup, Image} from 'semantic-ui-react';
/** @jsx jsx */
import { jsx } from '@emotion/core';

const statsBoxBase = (hasPopup) => ({
    borderRadius: 4,
    cursor: hasPopup ? 'pointer' : 'auto',
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5'
});

const statsBoxCss = ({color, hasPopup}) => {
    switch (color) {
        case 'blue':
            return {
                ...statsBoxBase(hasPopup),
                backgroundColor: '#55acee',
            };
        case 'yellow':
            return {
                ...statsBoxBase(hasPopup),
                backgroundColor: '#ffac33',
            };

        case 'red':
            return {
                ...statsBoxBase(hasPopup),
                backgroundColor: '#dd2e44',
            };

    }
};

const Stat = ({color, hasPopup, children}) => {
    return (
        <div css={statsBoxCss({color, hasPopup})}>
            {children}
        </div>
    )
};

function getDayorDays(count) {
    return count === 1 ? 'day' : 'days';
}

const Stats = ({data}) => {
    if (!data) return null;

    const {userStats,
        streakData: {
            longestStreak,
            currentStreak,
            longestStreakDates,
            currentStreakDates
        }} = data;

    const {
        ranking,
        totalPushUps,
        catchTheLeader,
        dailyAvg,
        avgSet,
        contributionPercentage,
        firstSet,
        bestSet,
    } = userStats;

    return (
        <Grid doubling columns={3} stackable style={{marginBottom: 40}}>
            <Grid.Column>
                <Stat color="blue">
                    <Statistic inverted label='Your Rank' value={ranking.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Total Push-Ups' value={totalPushUps.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="red">
                    <Statistic inverted label='Catch the Leader' value={catchTheLeader.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Daily Average' value={dailyAvg.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Popup content={`${longestStreakDates[0]} - ${longestStreakDates[longestStreakDates.length - 1]}`}
                   flowing
                   position='top center'
                   size='huge'
                   offset='0, -12px'
                   trigger={
                       <Grid.Column>
                           <Stat color="red" hasPopup>
                               <Statistic inverted>
                                   <Statistic.Value>
                            <span css={{
                                verticalAlign: 'top',
                                display: 'inline-block',
                            }}>
                                {longestStreak.toLocaleString()}
                            </span>
                                       <span css={{
                                           color: 'rgba(255,255,255,.7)',
                                           display: 'inline-block',
                                           fontSize: 14,
                                           fontWeight: 700,
                                           marginLeft: 5,
                                           textTransform: 'uppercase',
                                           verticalAlign: 'top',
                                       }}>
                                {getDayorDays(longestStreak)}
                            </span>
                                   </Statistic.Value>
                                   <Statistic.Label>Longest Streak</Statistic.Label>
                               </Statistic>
                           </Stat>
                       </Grid.Column>
                   }
            />
            <Popup content={`${currentStreakDates[0]} - ${currentStreakDates[currentStreakDates.length - 1]}`}
                   flowing
                   position='top center'
                   size='huge'
                   offset='0, -12px'
                   trigger={
                       <Grid.Column>
                           <Stat color="blue" hasPopup>
                               <Statistic inverted>
                                   <Statistic.Value>
                            <span css={{
                                verticalAlign: 'top',
                                display: 'inline-block',
                            }}>
                                {currentStreak.toLocaleString()}
                            </span>
                                       <span css={{
                                           color: 'rgba(255,255,255,.7)',
                                           display: 'inline-block',
                                           fontSize: 14,
                                           fontWeight: 700,
                                           marginLeft: 5,
                                           textTransform: 'uppercase',
                                           verticalAlign: 'top',
                                       }}>
                                {getDayorDays(currentStreak)}
                            </span>
                                   </Statistic.Value>
                                   <Statistic.Label>Current Streak</Statistic.Label>
                               </Statistic>
                           </Stat>
                       </Grid.Column>
                   }
            />
            <Popup content={firstSet.created}
                   position='top center'
                   size='huge'
                   offset='0, -12px'
                   trigger={
                       <Grid.Column>
                           <Stat color="red" hasPopup>
                               <Statistic inverted label='Starting Set' value={firstSet.count.toLocaleString()} />
                           </Stat>
                       </Grid.Column>}
            />
            <Popup content={bestSet.created}
                   position='top center'
                   size='huge'
                   offset='0, -12px'
                   trigger={
                       <Grid.Column>
                           <Stat color="blue" hasPopup>
                               <Statistic inverted label='Best Set' value={bestSet.count.toLocaleString()} />
                           </Stat>
                       </Grid.Column>}
            />
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Average Set' value={avgSet.toLocaleString()} />
                </Stat>
            </Grid.Column>
        </Grid>
    )
};

export default Stats;
