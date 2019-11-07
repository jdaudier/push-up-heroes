import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Segment, Header } from 'semantic-ui-react';
import { BLUE, YELLOW } from '../utils/constants';

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const CustomXAxisTick = ({x, y, payload}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)" fontWeight="bold">{payload.value}</text>
        </g>
    );
};

const CustomYAxisTick = ({x, y, payload}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={5} textAnchor="end" fill="#666" fontWeight="bold">{payload.value}</text>
        </g>
    );
};

const CustomTooltip = ({active, payload, label}) => {
    if (active) {
        const count = payload[0].value;

        if (count > 0) {
            return (
                <div css={{
                    background: 'rgb(53, 60, 72)',
                    borderRadius: '.28571429rem',
                    color: 'white',
                    lineHeight: 1.4,
                    textAlign: 'center',
                    padding: 10,
                }}>
                    <time css={{display: 'block', fontSize: 16}}>{label}</time>
                    <div css={{color: BLUE, fontSize: 25, fontWeight: 900}}>
                        {count}
                    </div>
                </div>
            );
        }

        return null;
    }

    return null;
};

const CustomLabel = ({viewBox, dailyAvg}) => {
    const x = viewBox.width + viewBox.x + 35;
    const y = viewBox.y + 4;

    const xMap = {
        1: x - 8,
        2: x - 4,
        3: x,
    };

    const avgX = xMap[dailyAvg.toString().length];

    return (
        <g>
            <text x={avgX} y={y - 16} textAnchor="end" fill={YELLOW} fontWeight="bold">{dailyAvg}</text>
            <text x={x} y={y} textAnchor="end" fill={YELLOW} fontWeight="bold">avg</text>
        </g>
    )
};

const UserChart = ({data, dailyAvg}) => {
    const shouldShowAvg = data.length > 3;

    return (
        <>
            <Header as='h2'
                    attached='top'
                    style={{
                        backgroundColor: '#f9fafb',
                        marginTop: 40,
                        paddingBottom: 20,
                        paddingTop: 20,
                    }}
                    textAlign="center">
                Push-Ups Over Time
            </Header>
            <Segment attached='bottom' padded="very" style={{
                paddingLeft: 0,
                paddingRight: 0,
                marginBottom: 64
            }}>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data} margin={{right: shouldShowAvg ? 50 : 42}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="label" height={70} tick={<CustomXAxisTick/>}/>
                        <YAxis allowDecimals={false} tick={<CustomYAxisTick />}/>
                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(185, 192, 201, .3)'}} />
                        <Bar dataKey="value" fill={BLUE} maxBarSize={100} />
                        {shouldShowAvg && <ReferenceLine y={dailyAvg} label={<CustomLabel dailyAvg={dailyAvg} />} stroke={YELLOW} strokeWidth={2} strokeDasharray="8" />}
                    </BarChart>

                </ResponsiveContainer>
            </Segment>
        </>
    );
};

export default UserChart;
