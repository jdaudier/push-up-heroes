/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";

const Code = ({text}) => {
    return (
        <code css={{
            backgroundColor: 'rgba(27,31,35,.05)',
            borderRadius: 3,
            fontSize: '95%',
            padding: '.2em .4em',
            marginLeft: 4,
            marginRight: 4,
        }}>
            {text}
        </code>
    )
}

export default Code;