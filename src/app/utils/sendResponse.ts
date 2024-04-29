import { Response } from "express";

const sendResponse = <T>(
    res: Response,
    jsonData: {
        statusCode: number;
        success: boolean;
        message: string;
        data: T | null | undefined;
        meta?:
            | {
                  page: number;
                  limit: number;
                  total: number;
              }
            | null
            | undefined;
    }
) => {
    res.status(jsonData.statusCode).json({
        success: jsonData.success,
        message: jsonData.message,
        meta: jsonData.meta || null || undefined,
        data: jsonData.data || null || undefined,
    });
};

export default sendResponse;
