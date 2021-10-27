import { useQuery, gql } from '@apollo/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Segment, Header } from 'semantic-ui-react';
import { BLUE, YELLOW } from '../utils/constants';
import CustomXAxisTick from './Chart/CustomXAxisTick';
import CustomYAxisTick from './Chart/CustomYAxisTick';
import CustomTooltip from './Chart/CustomTooltip';
import CustomRefLineLabel from './Chart/CustomRefLineLabel';
import LoadingChartView from './LoadingChartView';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const GET_GLOBAL_CHART_DATA = gql`
    query globalChartData {
        globalChartData {
            value
            label
        }
    }
`;

function GlobalChart({dailyAvg}) {
    const { loading, error, data, fetchMore } = useQuery(GET_GLOBAL_CHART_DATA);

    if (!data) return <LoadingChartView />;

    const {globalChartData} = data;
    const shouldShowAvg = globalChartData.length > 3;

    return (
        <>
            <Header as='h2'
                    attached='top'
                    style={{
                        backgroundColor: '#f9fafb',
                        paddingBottom: 20,
                        paddingTop: 20,
                    }}
                    textAlign="center">
                Push-Ups Over Time
            </Header>
            <Segment attached='bottom' padded="very" style={{
                paddingLeft: 0,
                paddingRight: 0,
            }}>
                <ResponsiveContainer width="100%" height={410}>
                    <BarChart
                        data={globalChartData}
                        margin={{right: shouldShowAvg ? 50 : 42}}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" height={70} tick={<CustomXAxisTick/>}/>
                        <YAxis allowDecimals={false} tick={<CustomYAxisTick />}/>
                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(185, 192, 201, .3)'}} />
                        <Bar dataKey="value" fill={BLUE} maxBarSize={100} />
                        {shouldShowAvg && (
                            <ReferenceLine y={dailyAvg}
                                           label={<CustomRefLineLabel avg={dailyAvg} />}
                                           stroke={YELLOW}
                                           strokeWidth={2}
                                           strokeDasharray="8"
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </Segment>
        </>
    );
}

export default GlobalChart;
