import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../prisma/generated/client';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error Log]: ${err.stack || err.message}`);

  // handle known prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(StatusCodes.CONFLICT).json({
          message: `A record with this ${err.meta?.target} already exists.`,
        });
      case 'P2025':
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'The requested record was not found.',
        });
      default:
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'A database error occurred.',
        });
    }
  }

  // fallback for all other unexpected errors
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
};