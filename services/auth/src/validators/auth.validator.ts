// rules for input validation

import { body } from 'express-validator';

export const registerValidator = [
  // email validation
  body('email')
    .isEmail().withMessage('Please provide a valid email address'),

  // username Validation
  body('username')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .not().matches(/[<>]/).withMessage('Username contains forbidden characters'),

  // password validation
  body('password')
    .isLength({ min: 8 , max: 128 }).withMessage('Password must be between 8 and 128 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

  body('role')
    .isIn(['CLIENT', 'FREELANCER'])
    .withMessage('Role must be either CLIENT or FREELANCER')
];

export const loginValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];