import Link from "next/link";
import {Grid, Statistic, Popup, Image} from 'semantic-ui-react';
import Party from './Party';
import {cellLinkCss} from './Stats';
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

function getStreakText(streakArr) {
    if (streakArr.length === 1) {
        return streakArr[0];
    }

    return `${streakArr[0]} - ${streakArr[streakArr.length - 1]}`;
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
        firstPlaceAthlete,
    } = userStats;

    return (
        <Grid doubling columns={3} stackable>
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
            <Popup flowing
                   hoverable={catchTheLeader !== 0}
                   position='top center'
                   size='huge'
                   style={{top: 12}}
                   trigger={
                       <Grid.Column>
                           <Stat color="red" hasPopup>
                               <Statistic inverted label='Catch the Leader' value={catchTheLeader.toLocaleString()} />
                           </Stat>
                       </Grid.Column>
                   }
            >
                {catchTheLeader === 0 ? (
                    <div>
                        <span css={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: 10,
                            width: 36,
                        }}>
                            <Party />
                        </span>
                        <span css={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                        }}>
                           Congrats! You're in the lead!
                        </span>
                    </div>
                ) : (
                    <Link href='/users/[id]' as={`/users/${firstPlaceAthlete.id}`}>
                        <a title={`${firstPlaceAthlete.profile.real_name}'s page`} css={cellLinkCss}>
                            <Image src={firstPlaceAthlete.profile.image_48} avatar />
                            <span css={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                                marginLeft: 5,
                            }}>
                                {firstPlaceAthlete.profile.real_name} leading with {firstPlaceAthlete.count.toLocaleString()}
                            </span>
                        </a>
                    </Link>
                )}
            </Popup>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Daily Average' value={dailyAvg.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Popup content={getStreakText(longestStreakDates)}
                   flowing
                   position='top center'
                   size='huge'
                   style={{top: 12}}
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
            <Popup content={getStreakText(currentStreakDates)}
                   flowing
                   position='top center'
                   size='huge'
                   style={{top: 12}}
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
                   style={{top: 12}}
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
                   style={{top: 12}}
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
