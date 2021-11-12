import {useMemo} from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Text, ResponsiveContainer, Cell, Tooltip, ReferenceLine } from 'recharts';
import {Header, Segment} from "semantic-ui-react";
import {BLUE, YELLOW} from "../../utils/constants";
import CustomTooltip from '../Chart/CustomTooltip';
import CustomRefLineLabel from "./CustomRefLineLabel";

/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";

export const FIRST_CHART_HEADING = 'Total Push-Ups / Person';
export const LABEL_FONT_SIZE = 18;

const wrapperCss = css`
  margin-bottom: 30px;
  margin-top: 4px;
`

const imageByNameMap = {};

const BAR_SIZE = 38;
const IMAGE_WIDTH = 38;
const IMAGE_LEFT_MARGIN = -10;
const Y_AXIS_LEFT_PADDING = 65;

const formatDataForLeaderboardChart = rankings => {
    return rankings.map(rank => {
        const name = rank.profile.real_name;
        imageByNameMap[name] = rank.profile.image_48;

        return {
            name,
            count: rank.count,
            image: rank.profile.image_48,
        }
    });
}

const CustomXAxisTick = ({x, y, payload: {value}}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={10} y={0} dy={5} textAnchor="end" fill="#666" fontWeight="bold">{value}</text>
        </g>
    );
};

const customYAxisTickFontSize = 16;


const CustomYAxisTick = ({ x, y, index, payload: { value } }) => {
    const rank = index + 1;

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={-IMAGE_WIDTH + IMAGE_LEFT_MARGIN} y={-10} dy={16} textAnchor="end" fill="#666" fontSize={customYAxisTickFontSize} fontWeight="bold">{value} {rank}. </text>
            <image x={-IMAGE_WIDTH} y={-20} href={imageByNameMap[value]} width={IMAGE_WIDTH} />
        </g>
    );
};

const CustomizedLabel =(props) => {
    const { y, fill, value, height, width, yAxisWidth } = props;

    const buffer = 6;
    const yOffset = LABEL_FONT_SIZE + (height - (LABEL_FONT_SIZE + buffer))/2;

    return (
        <Text fill={fill} fontSize={LABEL_FONT_SIZE} x={width + yAxisWidth + 12} y={y + yOffset} textAnchor="start">
            {value.toLocaleString()}
        </Text>
    );
};

let ctx;

// Inspo: https://codesandbox.io/s/recharts-horizontal-bar-with-dual-y-axis-25v91?file=/src/index.js:1060-1092
export const measureTextWidth = text => {
    if (!ctx) {
        ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${customYAxisTickFontSize}px Lato`;
    }

    return ctx.measureText(text).width;
};

function LeaderboardChart({rankings, avgPerPerson}) {
    const data = formatDataForLeaderboardChart(rankings);
    const shouldShowAvg = rankings.length > 3;

    const maxNameWidth = useMemo(
        () =>
            data.reduce((acc, cur) => {
                const {name} = cur;
                const width = measureTextWidth(name);
                if (width > acc) {
                    return width;
                }
                return acc;
            }, 0),
        [data]
    );

    const letterMap = {
        single: `${9}. `,
        double: `${85}. `,
        triple: `${854}. `,
        quadruple: `${8537}. `,
    }

    const getDigitLengthForRank = (length) => {
        if (length < 10) {
            return 'single';
        }

        if (length >= 10 && length < 100) {
            return 'double';
        }

        if (length >= 100 && length < 1000) {
            return 'triple';
        }

        if (length >= 1000 && length < 10000) {
            return 'quadruple';
        }
    }

    const sampleRankText = letterMap[getDigitLengthForRank(rankings.length)];
    const RANK_TEXT_WIDTH = measureTextWidth(sampleRankText);

    const Y_AXIS_WIDTH = maxNameWidth + IMAGE_WIDTH + IMAGE_LEFT_MARGIN + RANK_TEXT_WIDTH + Y_AXIS_LEFT_PADDING;

    return (
        <div css={wrapperCss}>
            <Header as='h2'
                    attached='top'
                    style={{
                        backgroundColor: '#f9fafb',
                        paddingBottom: 20,
                        paddingTop: 20,
                    }}
                    textAlign="center">
                {FIRST_CHART_HEADING}
            </Header>
            <Segment attached='bottom' padded="very" style={{
                paddingLeft: 0,
                paddingRight: 0,
            }}>
                <ResponsiveContainer width="100%" height={50 * data.length} debounce={50}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 25, right: 70 }}
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" vertical={true} />
                        <XAxis allowDecimals={false}
                               axisLine={false}
                               tick={<CustomXAxisTick/>}
                               tickCount={6}
                               tickLine={false}
                               tickMargin={10}
                               type="number"
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={true}
                            tickLine={false}
                            tick={CustomYAxisTick}
                            width={Y_AXIS_WIDTH}
                        />
                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(185, 192, 201, .3)'}} />
                        <Bar barSize={BAR_SIZE}
                             dataKey="count"
                             label={<CustomizedLabel yAxisWidth={Y_AXIS_WIDTH}/>}
                             minPointSize={2}
                        >
                            {data.map((d) => {
                                return <Cell key={d.name} fill={BLUE} />;
                            })}
                        </Bar>
                        {shouldShowAvg && (
                            <ReferenceLine x={avgPerPerson}
                                           label={<CustomRefLineLabel avg={avgPerPerson} />}
                                           stroke={YELLOW}
                                           strokeWidth={2}
                                           strokeDasharray="8"
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </Segment>
        </div>
    )
}

export default LeaderboardChart;