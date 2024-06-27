export interface IResponse {
    message: string;
    data?: any;
    error?: string;
    statusCode: number;
}