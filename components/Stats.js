import { Grid, Statistic, Popup, Image } from 'semantic-ui-react';
import Link from 'next/link';
import LoadingIcon from './LoadingIcon';
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

export const cellLinkCss = {
    display: 'block',
    cursor: 'pointer',
    color: 'initial',
};

const Stat = ({color, hasPopup, children}) => {
    return (
        <div css={statsBoxCss({color, hasPopup})}>
            {children}
        </div>
    )
};

function LoadingStat({color, label}) {
    return (
        <Grid.Column>
            <Stat color={color}>
                <LoadingIcon />
                <Statistic inverted label={label}  />
            </Stat>
        </Grid.Column>
    )
}

const Stats = ({data}) => {
    if (!data) {
        return (
            <Grid doubling columns={3} stackable style={{marginBottom: 40}}>
                <LoadingStat color="blue" label="Total Athletes" />
                <LoadingStat color="yellow" label="Total Push-Ups" />
                <LoadingStat color="red" label="Daily Average" />
                <LoadingStat color="yellow" label="Average Set" />
                <LoadingStat color="red" label="Best Individual Set" />
                <LoadingStat color="blue" label="Most Recent Set" />
            </Grid>
        )
    }

    const {mostRecentSet, leaderboard} = data;
    const {totalAthletes, totalPushUps, dailyAvg, avgSet, bestIndividualSet} = leaderboard;

    const MAX_BEST_SET_ATHLETES = 8;
    const trimmedBestSetAthletes = bestIndividualSet.athletes.slice(0, MAX_BEST_SET_ATHLETES);
    const numberOfBestSetAthletes = bestIndividualSet.athletes.length;
    const numberOfHiddenBestSetAthletes = numberOfBestSetAthletes - MAX_BEST_SET_ATHLETES > 0 ? numberOfBestSetAthletes - MAX_BEST_SET_ATHLETES : 0;

    return (
        <Grid doubling columns={3} stackable style={{marginBottom: 40}}>
            <Grid.Column>
                <Stat color="blue">
                    <Statistic inverted label='Total Athletes' value={totalAthletes.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Total Push-Ups' value={totalPushUps.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="red">
                    <Statistic inverted label='Daily Average' value={dailyAvg.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Grid.Column>
                <Stat color="yellow">
                    <Statistic inverted label='Average Set' value={avgSet.toLocaleString()} />
                </Stat>
            </Grid.Column>
            <Popup flowing
                   position='top center'
                   hoverable
                   offset={[0, -10]}
                   size='huge'
                   trigger={
                <Grid.Column>
                    <Stat color="red" hasPopup>
                        <Statistic inverted label='Best Individual Set' value={bestIndividualSet.count.toLocaleString()} />
                    </Stat>
                </Grid.Column>}
            >
                {trimmedBestSetAthletes.map(athlete => {
                    return (
                        <Link href='/users/[id]' as={`/users/${athlete.id}`} key={athlete.id}>
                            <a title={`${athlete.profile.real_name}'s page`} css={{
                                ...cellLinkCss,
                                marginBottom: 10,
                                '&:last-child': {
                                    marginBottom: 0,
                                }
                            }}>
                                <Image src={athlete.profile.image_48} avatar />
                                <span css={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    marginLeft: 5,
                                }}>
                                    {athlete.profile.real_name} on {athlete.created}
                                </span>
                            </a>
                        </Link>
                    )
                })}

                {Boolean(numberOfHiddenBestSetAthletes) && (
                    <div css={{textAlign: 'center'}}>
                        and {numberOfHiddenBestSetAthletes} more {numberOfHiddenBestSetAthletes === 1 ? 'athlete' : 'athletes'}
                    </div>
                )}
            </Popup>
            <Popup flowing
                   position='top center'
                   hoverable
                   offset={[0, -10]}
                   size='huge'
                   trigger={
                <Grid.Column>
                    <Stat color="blue" hasPopup>
                        <Statistic inverted label='Most Recent Set' value={mostRecentSet.count.toLocaleString()} />
                    </Stat>
                </Grid.Column>}
            >
                <Link href='/users/[id]' as={`/users/${mostRecentSet.id}`}>
                    <a title={`${mostRecentSet.profile.real_name}'s page`} css={cellLinkCss}>
                        <Image src={mostRecentSet.profile.image_48} avatar />
                        <span css={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginLeft: 5,
                        }}>
                            {mostRecentSet.profile.real_name} on {mostRecentSet.created}
                        </span>
                    </a>
                </Link>
            </Popup>
        </Grid>
    )
};

export default Stats;
