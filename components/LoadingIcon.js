import { Loader } from 'semantic-ui-react';
import { jsx } from '@emotion/core';
/** @jsx jsx */

function LoadingIcon() {
    return (
        <div css={{marginTop: 10}}>
            <Loader active inline='centered' inverted size='medium' />
        </div>
    )
}

export default LoadingIcon;
