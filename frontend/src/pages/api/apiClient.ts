interface TokenPair {
    accessToken: string | null;
    refreshToken: string | null;
}

interface RefreshResponse {
    access_token: string;
    refresh_token?: string;
}

interface APIErrorResponse {
    message: string;
    status: number;
}

interface APIClientOptions {
    baseURL?: string;
    timeout?: number;
}

type RefreshSubscriber = (token: string) => Promise<void> | void;

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

class APIError extends Error {
    status: number;
    
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

class APIClient {
    private baseURL: string;
    private isRefreshing: boolean;
    private refreshSubscribers: RefreshSubscriber[];
    private timeout: number;

    constructor(options: APIClientOptions = {}) {
        this.baseURL = options.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        this.timeout = options.timeout || 5000;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    private getStoredTokens(): TokenPair {
        return {
            accessToken: localStorage.getItem('access_token'),
            refreshToken: localStorage.getItem('refresh_token')
        };
    }

    private storeTokens(accessToken: string, refreshToken?: string): void {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }

    private clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    private addRefreshSubscriber(callback: RefreshSubscriber): void {
        this.refreshSubscribers.push(callback);
    }

    private processSubscribers(newToken: string): void {
        this.refreshSubscribers.forEach(callback => callback(newToken));
        this.refreshSubscribers = [];
    }

    private async refreshToken(): Promise<string> {
        const { refreshToken } = this.getStoredTokens();
        
        if (!refreshToken) {
            throw new APIError('No refresh token available', 401);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new APIError('Token refresh failed', response.status);
            }

            const data = await response.json() as RefreshResponse;
            this.storeTokens(data.access_token, data.refresh_token);
            return data.access_token;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData: APIErrorResponse = await response.json().catch(() => ({
                message: 'An unknown error occurred',
                status: response.status
            }));
            throw new APIError(errorData.message, errorData.status);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return response.json();
        }
        return {} as T;
    }

    public async fetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { accessToken } = this.getStoredTokens();

        if (options.params) {
            const queryParams = new URLSearchParams(options.params).toString();
            endpoint = `${endpoint}${queryParams ? `?${queryParams}` : ''}`;
        }

        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');

        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (response.ok) {
                return this.handleResponse<T>(response);
            }

            if (response.status === 401) {
                if (this.isRefreshing) {
                    return new Promise((resolve, reject) => {
                        this.addRefreshSubscriber(async (newToken) => {
                            try {
                                headers.set('Authorization', `Bearer ${newToken}`);
                                const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                                    ...options,
                                    headers,
                                });
                                resolve(await this.handleResponse<T>(retryResponse));
                            } catch (error) {
                                reject(error);
                            }
                        });
                    });
                }

                this.isRefreshing = true;

                try {
                    const newToken = await this.refreshToken();
                    this.processSubscribers(newToken);
                    headers.set('Authorization', `Bearer ${newToken}`);
                    const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                        ...options,
                        headers,
                    });
                    return this.handleResponse<T>(retryResponse);
                } catch (error) {
                    this.clearTokens();
                    window.location.href = '/login';
                    throw error;
                } finally {
                    this.isRefreshing = false;
                }
            }

            return this.handleResponse<T>(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new APIError('Request timeout', 408);
                }
                throw error;
            }
            throw new APIError('Network error', 500);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    public async get<T>(endpoint: string, options: Omit<RequestOptions, 'body' | 'method'> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: 'GET' });
    }

    public async post<T, D = unknown>(endpoint: string, data?: D, options: Omit<RequestOptions, 'body' | 'method'> = {}): Promise<T> {
        return this.fetch<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    public async put<T, D = unknown>(endpoint: string, data?: D, options: Omit<RequestOptions, 'body' | 'method'> = {}): Promise<T> {
        return this.fetch<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    public async delete<T>(endpoint: string, options: Omit<RequestOptions, 'body' | 'method'> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

const apiClient = new APIClient();
export default apiClient;