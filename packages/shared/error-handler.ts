// global error handling middleware for express
// app.use(errorHandler); must be placed after all routes
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    status?: number; // http status 
    statusCode?: number;
  }
  
function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token' });
        return
    }

    console.error(`[${req.method}] ${req.path} — ${err.message}`);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

export { errorHandler };
