declare module 'axios' {
  export interface AxiosRequestConfig {
    baseURL?: string;
    headers?: Record<string, string>;
  }

  export interface AxiosInstance {
    get: (url: string, config?: AxiosRequestConfig) => Promise<any>;
    post: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    put: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    delete: (url: string, config?: AxiosRequestConfig) => Promise<any>;
    interceptors: {
      request: {
        use: (
          onFulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
          onRejected?: (error: any) => any
        ) => void;
      };
    };
  }

  export function create(config?: AxiosRequestConfig): AxiosInstance;
  
  export default {
    create
  };
} 