import { YELLOW } from '../../utils/constants';
import {LABEL_FONT_SIZE} from './LeaderboardChart';

const CustomRefLineLabel = ({viewBox, avg, fill = YELLOW}) => {
    const x = viewBox.width + viewBox.x + 66;
    const y = viewBox.y;

    const xMap = {
        1: x - 8,
        2: x - 4,
        3: x,
    };

    const avgX = xMap[avg.toString().length];

    return (
        <g>
            <text x={avgX}
                  y={y - 10}
                  textAnchor="end"
                  fill={fill}
                  fontWeight="bold"
                  fontSize={LABEL_FONT_SIZE}>
                {`${avg} / person avg`}
            </text>
        </g>
    )
};

export default CustomRefLineLabel;
