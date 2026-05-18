import { body } from 'express-validator';
import { URL } from 'url';
import DOMPurify from 'isomorphic-dompurify'

const rejectIfSus = (field: string, max: number, label: string) =>
  body(field)
    .optional()
    .trim()
    .isLength({ max }).withMessage(`${label} must be ${max} characters or less`)
    .custom((val) => {
      const sanitized = DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });
      if (sanitized !== val) {
        throw new Error(`${label} contains invalid characters`);
      }
      return true;
});

export const setupProfileValidator = [
  // title
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters')
    .custom((val) => {
      const sanitized = DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });
      if (sanitized !== val) {
        throw new Error('Title contains invalid characters');
      }
      return true;
    }),

  // rate
  body('rate')
    .notEmpty().withMessage('Rate is required')
    .isFloat({ min: 5 }).withMessage('Rate must at least 5'),

  // skills: must be non-empty array of strings
  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('skills.*')
    .isString().withMessage('Each skill must be a string')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Skill must be 1–50 characters'),

  // category: array of strings (optional but constrained)
  body('category')
    .optional()
    .isArray().withMessage('Category must be an array'),
  body('category.*')
    .optional()
    .isString().withMessage('Each category must be a string')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Category must be 1–50 characters'),

  // bio: optional, max length
  rejectIfSus('bio', 300, 'Bio'),
];