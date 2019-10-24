import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {Segment, Header} from 'semantic-ui-react';

const CustomizedAxisTick = ({x, y, stroke, payload}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)" fontWeight="bold">{payload.value}</text>
        </g>
    );
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
                        <XAxis dataKey="name" height={60} tick={<CustomizedAxisTick/>}/>
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#55acee" />
                    </BarChart>

                </ResponsiveContainer>
            </Segment>
        </>
    );
};

export default UserChart;
