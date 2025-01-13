export interface ResponseData<T = any> {
  data: T;
  code: number;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path?: string;
  success: boolean;
}
