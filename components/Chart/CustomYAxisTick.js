const CustomYAxisTick = ({x, y, payload}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={5} textAnchor="end" fill="#666" fontWeight="bold">{payload.value}</text>
        </g>
    );
};

export default CustomYAxisTick;
