import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Centralized Axios Instance with enterprise-grade timeouts and credential mappings
export const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject trace correlation headers and JWT Bearer fallback
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Inject correlation ID for end-to-end request tracing
    if (typeof window !== 'undefined') {
      let traceId = localStorage.getItem('trace_id');
      if (!traceId) {
        traceId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('trace_id', traceId);
      }
      config.headers['X-Correlation-ID'] = traceId;
    }

    // 2. Inject Authorization token if stored in localStorage (optional fallback)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful unpacking, retry controls, and silent auth refresh
apiInstance.interceptors.response.use(
  (response) => {
    // Transparently unpack the standardized backend ApiResponse wrapper if present
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'success' in resData && 'data' in resData) {
      return resData.data; 
    }
    return resData;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Automatic retry handling for network faults and Render cold-start responses
    if (error.code === 'ECONNABORTED' || !error.response || 
        [502, 503, 504].includes(error.response?.status)) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (originalRequest._retryCount < 3 && ['get', 'GET'].includes(originalRequest.method || '')) {
        originalRequest._retryCount++;
        const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000; // 1s, 2s, 4s
        console.warn(`API Client: Retrying request (${originalRequest._retryCount}/3) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiInstance(originalRequest);
      }
    }

    // Interactive token silent refresh sequence
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          console.log("Central API Client: Session access expired. Triggering silent refresh token call...");
          
          // Send credentials so the secure HTTP refresh cookie is emitted to the server
          const refreshRes: any = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
            withCredentials: true,
          });

          // Standardize response extraction
          const token = refreshRes.data?.data?.token || refreshRes.data?.token;
          const email = refreshRes.data?.data?.email || refreshRes.data?.email;

          if (token && email) {
            localStorage.setItem('token', token);
            localStorage.setItem('email', email);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            processQueue(null, token);
            resolve(apiInstance(originalRequest));
          } else {
            throw new Error("Invalid response format on refresh");
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.error("Central API Client: Silent session refresh failed. User must re-authenticate.");
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            window.location.href = '/';
          }
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Generic Wrapper supporting standard Fetch calls compatible with the old signature
export const apiClient = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  // Convert standard fetch options to Axios requests to preserve backward compatibility
  const method = (options.method || 'GET') as AxiosRequestConfig['method'];
  let data = undefined;
  if (options.body) {
    try {
      data = JSON.parse(options.body as string);
    } catch {
      data = options.body;
    }
  }

  const cleanUrl = url.replace(API_BASE_URL, '');

  return apiInstance.request<any, T>({
    url: cleanUrl,
    method,
    data,
    headers: options.headers as any,
  });
};
