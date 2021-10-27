import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Segment, Header } from 'semantic-ui-react';
import { BLUE, YELLOW } from '../utils/constants';
import CustomYAxisTick from './Chart/CustomYAxisTick';
import CustomTooltip from './Chart/CustomTooltip';
import CustomRefLineLabel from './Chart/CustomRefLineLabel';
import CustomXAxisTick from "./Chart/CustomXAxisTick";

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const UserChart = ({data, avgSet}) => {
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
                Sets Over Time
            </Header>
            <Segment attached='bottom' padded="very" style={{
                paddingLeft: 0,
                paddingRight: 0,
                marginBottom: 64
            }}>
                <ResponsiveContainer width="100%" height={410}>
                    <AreaChart
                        data={data}
                        margin={{right: shouldShowAvg ? 50 : 42}}
                    >
                        <defs>
                            <linearGradient id="set" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={BLUE} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="humanReadableCreated" height={70} tick={<CustomXAxisTick/>} />
                        <YAxis allowDecimals={false} tick={<CustomYAxisTick />}/>
                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(185, 192, 201, .3)'}} />
                        <Area type="monotone" dataKey="count" stroke={BLUE} fillOpacity={1} fill="url(#set)" />
                        {shouldShowAvg && (
                            <ReferenceLine y={avgSet}
                                           label={<CustomRefLineLabel avg={avgSet} />}
                                           stroke={YELLOW}
                                           strokeWidth={2}
                                           strokeDasharray="8"
                            />
                        )}
                    </AreaChart>

                </ResponsiveContainer>
            </Segment>
        </>
    );
};

export default UserChart;
