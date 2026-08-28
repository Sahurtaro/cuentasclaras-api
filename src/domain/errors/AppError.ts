export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public message!: string;
  public details: object;

  constructor(statusCode: number, code: string, message: string, details?: object) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
    this.details = details ?? {};
  }
}
