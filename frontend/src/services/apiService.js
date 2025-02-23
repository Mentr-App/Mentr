import apiClient from "./apiClient";

export const fetchFeed = async () => {
    try {
        const response = await apiClient.get("/feed")
        console.log("respone:", response.data.feed)
        return response.data.feed
    } catch (error) {
        throw new Error('Failed to fetch feed:', error.message)
    }
}