import axios from 'axios'

// Axios instance for simplicity
const apiClient = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
})

// Flags to track whether refresh is in progress
let isRefreshing = false
let refreshSubscribers = []

// Function to add subscribers for new tokens
const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback)
}

// Function to process subscribers (waiting requests) with new token
const processSubscribers = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken))
    refreshSubscribers = []
}

apiClient.interceptors.request.use(
    (config) => {
        console.log("config:",config)
        const token = localStorage.getItem("access_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        console.log("original request:", originalRequest, error)
        // if token expired and its not a refresh request
        if (error.response && error.response.status == 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // if another process is in progress, wait for it
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                        resolve(apiClient(originalRequest)) // Retry failed request
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const refreshToken = localStorage.getItem("refresh_token")
                if (!refreshToken) {
                    throw new Error("No refresh token available womp womp")
                }

                const response = await apiClient.post("/auth/refresh", {
                    refreshToken: refreshToken
                })

                const newAccessToken = response.data.access_token
                localStorage.setItem("access_token", newAccessToken)

                // process subscribers (waiting requests)
                processSubscribers(newAccessToken)

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                console.error("Refresh token expired. Logging out...")
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                window.location.href = "/login"
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient