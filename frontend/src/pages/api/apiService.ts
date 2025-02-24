import apiClient from "./apiClient";

export interface FeedItem {
    id: string;
    title: string;
    content: string;
    author?: string;
    createdAt: string;
}

export interface FeedResponse {
    message: string;
    feed: Array<{
        _id: string;
        title: string;
        content: string;
        author?: string;
        created_at: string;
    }>;
}

class FeedService {
    public static async fetchFeed(): Promise<FeedItem[]> {
        try {
            const response = await apiClient.get<FeedResponse>("/feed");
            return response.feed.map((item) => ({
                id: item._id,
                title: item.title,
                content: item.content,
                author: item.author,
                createdAt: item.created_at,
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch feed: ${error.message}`);
            }
            throw new Error("Failed to fetch feed: Unknown error");
        }
    }

    public static async fetchFeedItem(id: string): Promise<FeedItem> {
        try {
            const response = await apiClient.get<{ item: FeedItem }>(
                `/feed/${id}`
            );
            return response.item;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch feed item: ${error.message}`);
            }
            throw new Error("Failed to fetch feed item: Unknown error");
        }
    }

    public static async createFeedItem(
        item: Omit<FeedItem, "id" | "createdAt">
    ): Promise<FeedItem> {
        try {
            const response = await apiClient.post<{ item: FeedItem }>(
                "/feed",
                item
            );
            return response.item;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create feed item: ${error.message}`);
            }
            throw new Error("Failed to create feed item: Unknown error");
        }
    }
}

export default FeedService;
