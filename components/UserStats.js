import Link from 'next/link';
import { Grid, Statistic, Popup, Image } from 'semantic-ui-react';
import Party from './Party';
import Crown from './Crown';
import { cellLinkCss } from './Stats';
import { BLUE, RED, YELLOW } from '../utils/constants';
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
                backgroundColor: BLUE,
            };
        case 'yellow':
            return {
                ...statsBoxBase(hasPopup),
                backgroundColor: YELLOW,
            };

        case 'red':
            return {
                ...statsBoxBase(hasPopup),
                backgroundColor: RED,
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

    const MAX_BEST_SET_DATES = 6;
    const trimmedBestSetDates = bestSet.created.slice(0, MAX_BEST_SET_DATES);
    const numberOfBestSetDates = bestSet.created.length;
    const numberOfHiddenBestSetDates = numberOfBestSetDates - MAX_BEST_SET_DATES > 0 ? numberOfBestSetDates - MAX_BEST_SET_DATES : 0;

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
                               <Statistic inverted>
                                   <Statistic.Value>
                                       {catchTheLeader === 0 ? (
                                           <div css={{height: 56}}>
                                               <Crown height={56} fill="white" />
                                           </div>
                                       ) : (
                                           catchTheLeader.toLocaleString()
                                       )}
                                   </Statistic.Value>
                                   <Statistic.Label>Catch the Leader</Statistic.Label>
                               </Statistic>
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
            {longestStreak > 0 ? (
                <Popup content={longestStreakDates}
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
            ) : (
                <Grid.Column>
                    <Stat color="red">
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
            )}
            {currentStreak > 0 ? (
                <Popup content={currentStreakDates}
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
            ) : (
                <Grid.Column>
                    <Stat color="blue">
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
            )}
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
            <Popup position='top center'
                   size='huge'
                   style={{top: 12}}
                   trigger={
                       <Grid.Column>
                           <Stat color="blue" hasPopup>
                               <Statistic inverted label='Best Set' value={bestSet.count.toLocaleString()} />
                           </Stat>
                       </Grid.Column>}
            >
                {trimmedBestSetDates.map(date => <div css={{textAlign: 'center'}} key={date}>{date}</div>)}

                {Boolean(numberOfHiddenBestSetDates) && (
                    <div css={{textAlign: 'center'}}>
                        and {numberOfHiddenBestSetDates} more {numberOfHiddenBestSetDates === 1 ? 'time' : 'times'}
                    </div>
                )}
            </Popup>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Average Set' value={avgSet.toLocaleString()} />
                </Stat>
            </Grid.Column>
        </Grid>
    )
};

export default Stats;
