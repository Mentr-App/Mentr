import React from "react";

interface UserAnalytics {
    post_count: number;
    comment_count: number;
    connection_count: number;
    helpful_count: number;
    unhelpful_count: number;
    total_marks: number;
    helpfulness_rating: number;
    is_new_user: boolean;
}

interface ProfileAnalyticsProps {
    analytics: UserAnalytics | null;
    isLoading: boolean;
    error: string | null;
    isOwnProfile: boolean;
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
    analytics,
    isLoading,
    error,
    isOwnProfile,
}) => {
    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-32'>
                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='text-center text-red-500 py-4'>
                <p>Failed to load analytics: {error}</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className='text-center text-text-secondary py-4'>
                <p>No analytics available</p>
            </div>
        );
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 80) return "#22c55e"; // green-500
        if (rating >= 60) return "#84cc16"; // lime-500
        if (rating >= 40) return "#eab308"; // yellow-500
        if (rating >= 20) return "#f97316"; // orange-500
        return "#ef4444"; // red-500
    };

    // Simple percentage badge
    const RatingBadge = ({ rating }: { rating: number }) => {
        const color = getRatingColor(rating);
        return (
            <div className='flex flex-col items-center'>
                <div
                    className='flex items-center justify-center rounded-full w-20 h-20 text-xl font-bold'
                    style={{
                        backgroundColor: `${color}20`, // 20% opacity version of the color
                        color: color,
                        border: `3px solid ${color}`,
                    }}>
                    {rating}%
                </div>
            </div>
        );
    };

    return (
        <div className='bg-foreground p-4 rounded'>
            <h2 className='text-lg font-semibold text-text-primary mb-4'>
                {isOwnProfile ? "Your Analytics" : "User Analytics"}
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {/* Helpfulness Rating */}
                <div className='bg-background rounded-lg p-4 flex flex-col items-center'>
                    <h3 className='text-text-primary text-sm font-medium mb-2'>
                        Helpfulness Rating
                    </h3>
                    <div className='w-20 h-20 mb-2'>
                        {analytics.is_new_user ? (
                            <div className='w-full h-full flex items-center justify-center text-text-secondary text-xs text-center border-2 border-gray-500 rounded-full'>
                                New user
                            </div>
                        ) : (
                            <RatingBadge rating={analytics.helpfulness_rating} />
                        )}
                    </div>
                    <p className='text-xs text-text-secondary mt-1'>
                        {analytics.is_new_user
                            ? "Not enough ratings yet"
                            : `Based on ${analytics.total_marks} ratings`}
                    </p>
                </div>

                {/* Post Count */}
                <div className='bg-background rounded-lg p-4 flex flex-col items-center'>
                    <h3 className='text-text-primary text-sm font-medium mb-2'>Posts</h3>
                    <div className='text-3xl font-bold text-primary'>
                        {analytics.post_count}
                    </div>
                    <p className='text-xs text-text-secondary mt-2'>
                        {isOwnProfile ? "Posts you've created" : "Created posts"}
                    </p>
                </div>

                {/* Comment Count */}
                <div className='bg-background rounded-lg p-4 flex flex-col items-center'>
                    <h3 className='text-text-primary text-sm font-medium mb-2'>
                        Comments
                    </h3>
                    <div className='text-3xl font-bold text-primary'>
                        {analytics.comment_count}
                    </div>
                    <p className='text-xs text-text-secondary mt-2'>
                        {isOwnProfile ? "Comments you've made" : "Public comments"}
                    </p>
                </div>

                {/* Connection Count */}
                <div className='bg-background rounded-lg p-4 flex flex-col items-center'>
                    <h3 className='text-text-primary text-sm font-medium mb-2'>
                        Connections
                    </h3>
                    <div className='text-3xl font-bold text-primary'>
                        {analytics.connection_count}
                    </div>
                    <p className='text-xs text-text-secondary mt-2'>
                        {isOwnProfile ? "Your mentorships" : "Active mentorships"}
                    </p>
                </div>
            </div>

            {analytics.total_marks > 0 && (
                <div className='mt-4 pt-4 border-t border-gray-600'>
                    <div className='flex justify-between items-center'>
                        <div className='text-sm'>
                            <span className='inline-block w-3 h-3 rounded-full bg-green-500 mr-2'></span>
                            <span className='text-text-primary'>
                                Helpful: {analytics.helpful_count}
                            </span>
                        </div>
                        <div className='text-sm'>
                            <span className='inline-block w-3 h-3 rounded-full bg-red-500 mr-2'></span>
                            <span className='text-text-primary'>
                                Unhelpful: {analytics.unhelpful_count}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileAnalytics;
