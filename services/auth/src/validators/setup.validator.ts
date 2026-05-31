import { body } from 'express-validator';
import { URL } from 'url';

const rejectIfSus = (field: string, max: number, label: string) =>
  body(field)
    .optional()
    .trim()
    .isLength({ max }).withMessage(`${label} must be ${max} characters or less`)
    .custom((val) => {
      const sanitized = val.replace(/<[^>]*>/g, '').trim();
      if (sanitized !== val.trim()) {
        throw new Error(`${label} contains invalid characters`);
      }
      return true;
});

export const setupProfileValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters')
    .custom((val) => {
      const sanitized = val.replace(/<[^>]*>/g, '').trim();
      if (sanitized !== val.trim()) {
        throw new Error('Title contains invalid characters');
      }
      return true;
    }),

  body('rate')
    .notEmpty().withMessage('Rate is required')
    .isFloat({ min: 5 }).withMessage('Rate must at least 5'),

  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('skills.*')
    .isString().withMessage('Each skill must be a string')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Skill must be 1–50 characters'),

  body('category')
    .optional()
    .isArray().withMessage('Category must be an array'),
  body('category.*')
    .optional()
    .isString().withMessage('Each category must be a string')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Category must be 1–50 characters'),

  rejectIfSus('bio', 300, 'Bio'),
];