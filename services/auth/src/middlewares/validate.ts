// express-validator doesn't throw errors automatically, it attaches them to the req object
// so we need this middleware to check if there are errors and stop the request if there are
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Return 400 Bad Request with the list of errors
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({ field: (err as any).path, message: err.msg }))
    });
  }
  
  next(); // No errors? Move to the controller
};