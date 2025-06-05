import { Response } from "express";

interface ApiResponse<T> {
  status: number;
  data: T | null;
  error: string | null;
  message?: string | null;
}

export const createResponse = <T>(
  res: Response,
  status: number,
  data: T | null,
  error: string | null,
  message?: string | null
) => {
  const response: ApiResponse<T> = {
    status,
    data,
    error,
    message,
  };
  res.status(status).json(response);
};
