import { useQuery, gql } from '@apollo/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Segment, Header } from 'semantic-ui-react';
import { BLUE, YELLOW } from '../utils/constants';
import CustomXAxisTick from './Chart/CustomXAxisTick';
import CustomYAxisTick from './Chart/CustomYAxisTick';
import CustomTooltip from './Chart/CustomTooltip';
import CustomRefLineLabel from './Chart/CustomRefLineLabel';
import LoadingChartView from './LoadingChartView';
import LeaderboardChart from './LeaderboardChart';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import format from "date-fns/format";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import parseISO from "date-fns/parseISO";

const GET_GLOBAL_CHART_DATA = gql`
    query globalChartData {
        globalChartData {
            created,
            count,
        }
    }
`;

const formatDataForGlobalChart = data => {
    const {
        firstEntry,
        lastEntry,
        countsByDayMap,
    } = data.globalChartData.reduce((acc, data, i, arr) => {
        const createdDate = new Date(data.created);

        const created = format(createdDate, 'yyyy-MM-dd');

        const currentSet = {
            ...data,
            created,
        };
        
        const prevCount = acc.countsByDayMap[created];
        return {
            ...acc,
            firstEntry: i === 0 ? currentSet : acc.firstEntry,
            lastEntry: i === arr.length - 1 ? currentSet : acc.lastEntry,
            countsByDayMap: {
                ...acc.countsByDayMap,
                [created]: prevCount ? prevCount + currentSet.count : currentSet.count,
            }
        }
    }, {
        firstEntry: {},
        lastEntry: {},
        countsByDayMap: {},
    });

    const datesArray = eachDayOfInterval(
        { start: parseISO(firstEntry.created), end: parseISO(lastEntry.created) }
    );

    return datesArray.map(date => {
        const key = format(date, 'yyyy-MM-dd');

        return {
            label: format(date, 'EEE, MMM d'),
            value: countsByDayMap[key] ? countsByDayMap[key] : 0,
        }
    });
}

function GlobalChart({ leaderboardData}) {
    const { loading, error, data, fetchMore } = useQuery(GET_GLOBAL_CHART_DATA);

    const dailyAvg = leaderboardData.leaderboard.dailyAvg;

    const avgPerPerson = leaderboardData.leaderboard.totalPushUps / leaderboardData.leaderboard.totalAthletes;

    if (!data) return <LoadingChartView />;

    const globalChartData = formatDataForGlobalChart(data)

    const shouldShowAvg = globalChartData.length > 3;

    return (
        <>
            <LeaderboardChart avgPerPerson={avgPerPerson} rankings={leaderboardData.leaderboard.rankings} />
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
