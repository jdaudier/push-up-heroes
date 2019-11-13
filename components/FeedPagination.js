import React from 'react'
import { Pagination } from 'semantic-ui-react'

const FeedPagination = ({activePage, disabled, onPageChange, totalPages}) => {
    return (
        <Pagination
            activePage={activePage}
            disabled={disabled}
            firstItem={null}
            lastItem={null}
            onPageChange={onPageChange}
            nextItem={{
                'aria-label': 'Next item',
                content: '⟩',
                disabled: activePage === totalPages,
            }}
            prevItem={{
                'aria-label': "Previous item",
                content: "⟨",
                disabled: activePage === 1,
            }}
            siblingRange={1}
            totalPages={totalPages}
        />
    )
};

export default FeedPagination;
