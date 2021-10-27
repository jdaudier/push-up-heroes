import { BLUE } from '../../utils/constants';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const CustomTooltip = ({active, payload, label}) => {
    if (active) {
        const count = payload[0].value;

        if (count > 0) {
            return (
                <div css={{
                    background: 'rgb(53, 60, 72)',
                    borderRadius: '.28571429rem',
                    color: 'white',
                    lineHeight: 1.4,
                    textAlign: 'center',
                    padding: 10,
                }}>
                    <time css={{display: 'block', fontSize: 16}}>{label}</time>
                    <div css={{color: BLUE, fontSize: 25, fontWeight: 900}}>
                        {count}
                    </div>
                </div>
            );
        }

        return null;
    }

    return null;
};

export default CustomTooltip;
