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
                <Segment compact raised css={{lineHeight: 1.4, textAlign: 'center'}}>
                    <time css={{display: 'block', fontSize: 16}}>{label}</time>
                    <div css={{color: BLUE, fontSize: 25, fontWeight: 900}}>
                        {count}
                    </div>
                </Segment>
            );
        }

        return null;
    }

    return null;
};

const CustomLabel = ({viewBox}) => {
    const x = viewBox.width + viewBox.x + 30;
    const y = viewBox.y + 5;
    return (
        <text x={x} y={y} textAnchor="end" fill={YELLOW} fontWeight="bold">Avg</text>
    )
};

const UserChart = ({data, dailyAvg}) => {
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
                    <BarChart data={data} margin={{right: 42}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="label" height={60} tick={<CustomXAxisTick/>}/>
                        <YAxis allowDecimals={false} tick={<CustomYAxisTick />}/>
                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(185, 192, 201, .3)'}} />
                        <Bar dataKey="value" fill={BLUE} maxBarSize={100} />
                        {data.length > 3 && <ReferenceLine y={dailyAvg} label={<CustomLabel />} stroke={YELLOW} strokeWidth={2} strokeDasharray="8" />}
                    </BarChart>

                </ResponsiveContainer>
            </Segment>
        </>
    );
};

export default UserChart;