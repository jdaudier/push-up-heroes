import {Grid, Statistic, Popup, Image} from 'semantic-ui-react';
/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import Crown from "./Crown";
import Link from "next/link";

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

const Stats = ({data}) => {
    if (!data) return null;

    const {mostRecentSet, leaderboard} = data;
    const {totalAthletes, totalPushUps, dailyAvg, avgSet, bestIndividualSet} = leaderboard;

    if (totalAthletes === 0) {
        return null;
    }

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
                   size='huge'
                   style={{top: 12}}
                   trigger={
                <Grid.Column>
                    <Stat color="red" hasPopup>
                        <Statistic inverted label='Best Individual Set' value={bestIndividualSet.count.toLocaleString()} />
                    </Stat>
                </Grid.Column>}
            >
                <Link href='/users/[id]' as={`/users/${bestIndividualSet.id}`}>
                    <a title={`${bestIndividualSet.profile.real_name}'s page`} css={cellLinkCss}>
                        <Image src={bestIndividualSet.profile.image_48} avatar />
                        <span css={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginLeft: 5,
                        }}>
                            {bestIndividualSet.profile.real_name} on {bestIndividualSet.created}
                        </span>
                    </a>
                </Link>
            </Popup>
            <Popup flowing
                   position='top center'
                   hoverable
                   size='huge'
                   style={{top: 12}}
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
