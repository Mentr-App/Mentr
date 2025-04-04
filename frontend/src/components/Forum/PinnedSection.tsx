import React, { useEffect, useState } from "react";
import { Post } from "../CommonInterfaces/Interfaces";

interface PinnedSectionProps {
    isGridView: boolean;
    searchLoading: boolean;
    getFilteredFeed: (post:Post) => Post[];
}

const PinnedSection: React.FC<PinnedSectionProps> = ({
    isGridView,
    searchLoading,
    getFilteredFeed
}) => {

    
    if (searchLoading) {
        return (
            <></>
        )
    } else {
        return (
            <div className="flex-1 px-6 pb-6">
                <h1>Pinned</h1>
                {isGridView ? (
                    <div>
                        <div>
                        </div>
                    </div>
                )
                :
                (
                    <div>
                    </div>
                )
                }
            </div>
        )
    }
}

export default PinnedSection