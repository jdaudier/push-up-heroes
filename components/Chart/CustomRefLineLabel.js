import { YELLOW } from '../../utils/constants';

const CustomRefLineLabel = ({viewBox, avg, fill = YELLOW}) => {
    const x = viewBox.width + viewBox.x + 35;
    const y = viewBox.y + 4;

    const xMap = {
        1: x - 8,
        2: x - 4,
        3: x,
    };

    const avgX = xMap[avg.toString().length];

    return (
        <g>
            <text x={avgX} y={y - 16} textAnchor="end" fill={fill} fontWeight="bold">{avg}</text>
            <text x={x} y={y} textAnchor="end" fill={fill} fontWeight="bold">avg</text>
        </g>
    )
};

export default CustomRefLineLabel;
