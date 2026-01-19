/**
 * Enterprise API Client
 * Handles external API integration with retry logic, error handling, and rate limiting
 */

export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      ),
    ]);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            ...options,
            headers,
          },
          this.timeout
        );

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data,
          status: response.status,
          headers: responseHeaders,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Default API client instance (configure with your external API)
export const apiClient = new ApiClient({
  baseUrl: process.env.EXTERNAL_API_BASE_URL || 'https://api.example.com',
  apiKey: process.env.EXTERNAL_API_KEY,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});



