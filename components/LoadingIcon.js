import { Loader } from 'semantic-ui-react';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

function LoadingIcon() {
    return (
        <div css={{marginTop: 10}}>
            <Loader active inline='centered' inverted size='medium' />
        </div>
    )
}

export default LoadingIcon;
