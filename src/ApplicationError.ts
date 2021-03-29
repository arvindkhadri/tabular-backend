export default class ApplicationError extends Error {
  status: string | number;
  constructor(message?: string, status?: string | number) {
    super();

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.message = message || "Something went wrong. Please try again.";

    this.status = status || 500;
  }
}
