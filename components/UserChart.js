import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {Segment, Header} from 'semantic-ui-react';
import {BLUE} from '../utils/constants';

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const CustomXAxisTick = ({x, y, stroke, payload}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)" fontWeight="bold">{payload.value}</text>
        </g>
    );
};

const CustomYAxisTick = ({x, y, stroke, payload}) => {
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
                <Segment compact raised css={{lineHeight: 1.4}}>
                    <time css={{display: 'block', fontSize: 16}}>{label}</time>
                    <div css={{color: BLUE, fontSize: 16}}>
                        Count:&nbsp;
                        <span css={{fontWeight: 'bold'}}>{count}</span>
                    </div>
                </Segment>
            );
        }

        return null;
    }

    return null;
};

const UserChart = ({data}) => {
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
            <Segment attached='bottom' padded="very" style={{paddingLeft: 0}}>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name" height={60} tick={<CustomXAxisTick/>}/>
                        <YAxis tick={<CustomYAxisTick />}/>
                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(185, 192, 201, .3)'}} />
                        <Bar dataKey="count" fill={BLUE} />
                    </BarChart>

                </ResponsiveContainer>
            </Segment>
        </>
    );
};

export default UserChart;
