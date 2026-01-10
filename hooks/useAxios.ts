import { useRef } from "react";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { createAxiosClient } from "../api/axios";

interface UseAxiosReturn {
  apiGet: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  client: AxiosInstance;
}

export default function useAxios(): UseAxiosReturn {
  const clientRef = useRef<AxiosInstance | null>(null);

  if (!clientRef.current) {
    clientRef.current = createAxiosClient();
  }

  const client = clientRef.current;

  return {
    apiGet: client.get,
    post: client.post,
    put: client.put,
    patch: client.patch,
    delete: client.delete,
    client,
  };
}
