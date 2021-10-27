import React, { useState } from 'react';
import format from 'date-fns/format';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import addDays from 'date-fns/addDays';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import isSameMonth from 'date-fns/isSameMonth';
import isToday from 'date-fns/isToday';
import isPast from 'date-fns/isPast';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import {Icon, Header, Segment} from 'semantic-ui-react';
import { BLUE, RED } from '../utils/constants';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const iconCss = {
    color: '#777',
    cursor: 'pointer',
    display: 'inline-block',
    transition: '.15s ease-out',
    marginLeft: '1em',
    marginRight: '1em',
    verticalAlign: 'middle',
    '&:hover': {
        transform: 'scale(1.75)',
        transition: '.25s ease-out',
        color: BLUE,
    }
};

const headerColumnCss = {
    flexGrow: 1,
    flexBasis: 0,
    maxWidth: '100%',
};

const columnCss = {
    flexGrow: 0,
    flexBasis: 'calc(100%/7)',
    width: 'calc(100%/7)',
};

const dayColumnCss = {
    justifyContent: 'center',
    textAlign: 'center',
    flexGrow: 1,
    flexBasis: 0,
    maxWidth: '100%',
};

const rowCss = {
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    textTransform: 'uppercase',
    borderBottom: '1px solid #eee',
};

const checkMarkCss = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    '@media(max-width: 767px)': {
        fontSize: '2em !important',
        lineHeight: '1.7 !important',
    }
};

function StreaksCalendar({challengeStartDate, countsByDayMap}) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const header = () => {
        const dateFormat = 'MMMM yyyy';
        return (
            <div css={{
                ...rowCss,
                fontWeight: 700,
                fontSize: '132%',
                padding: '1.5em 0',
            }}>
                <div css={{
                    ...headerColumnCss,
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                }}>
                    <div css={iconCss} onClick={prevMonth}>
                        <Icon name="angle left" />
                    </div>
                </div>
                <div css={{
                    ...headerColumnCss,
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: 1.3,
                }}>
                    {format(currentDate, dateFormat)}
                </div>
                <div css={{
                    ...headerColumnCss,
                    justifyContent: 'flex-end',
                    textAlign: 'right',
                }}>
                    <div css={iconCss} onClick={nextMonth}>
                        <Icon name="angle right" />
                    </div>
                </div>
            </div>
        );
    };

    const days = () => {
        const dateFormat = 'EEE';
        const days = [];
        const startDate = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div css={dayColumnCss} key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div css={{
            ...rowCss,
            fontWeight: 400,
            fontSize: '90%',
            padding: '.75em 0',
        }}>{days}</div>;
    };

    const cells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const dateFormat = 'd';
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const formattedFullDate = format(day, 'yyyy-MM-dd');
                const didPushUps = countsByDayMap[formattedFullDate];
                const isInThePast = isPast(day) && !isToday(day);
                const isAfterChallengeStartDate = isAfter(day, parseISO(challengeStartDate));

                days.push(
                    <div
                        css={{
                            position: 'relative',
                            height: '7em',
                            borderRight: '1px solid #eee',
                            overflow: 'hidden',
                            transition: '0.25s ease-out',
                            ...columnCss,
                            '&:hover': {
                                background: '#f9f9f9',
                                transition: '0.5s ease-out',
                            },
                            '&:last-child': {
                                borderRight: 'none',
                            },
                            color: !isSameMonth(day, monthStart) ? '#ccc' :
                                isToday(day) ? '#1a8fff' : 'inherit',
                            pointerEvents: !isSameMonth(day, monthStart) ? 'none' : 'auto',
                            '@media(max-width: 767px)': {
                                height: '5em'
                            }
                        }}
                        key={day}
                    >
                        <span css={{
                            position: 'absolute',
                            lineHeight: 1,
                            top: '.75em',
                            right: '.75em',
                            fontWeight: 700,
                        }}>
                            {formattedDate}
                        </span>
                        {didPushUps && (
                            <Icon color="green"
                                  name="check"
                                  size="huge"
                                  css={checkMarkCss}
                            />
                        )}
                        {!didPushUps && isAfterChallengeStartDate && isInThePast && (
                            <Icon name="times"
                                  size="huge"
                                  css={{...checkMarkCss, color: RED}}
                            />
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div css={{
                    ...rowCss,
                    '&:last-child': {
                        borderBottom: 'none',
                    }
                }} key={day}> {days} </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };


    return (
        <>
            <Header as='h2' style={{marginTop: 44}}>Streaks</Header>
            <Segment style={{
                padding: 0,
                marginBottom: 64
            }}>
                <div>{header()}</div>
                <div>{days()}</div>
                <div>{cells()}</div>
            </Segment>
        </>
    );
}

export default StreaksCalendar;
