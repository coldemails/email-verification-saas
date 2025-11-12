import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
};
