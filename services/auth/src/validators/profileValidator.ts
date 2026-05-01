import { body } from 'express-validator';
import { URL } from 'url';
import DOMPurify from 'isomorphic-dompurify';

// helper function
const rejectIfSus= (field: string, max: number, label: string) =>
    body(field).optional().trim()
        .isLength({ max }).withMessage(`${label} must be ${max} characters or less`)
        .custom(val => {
            const sanitized = DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });
            if (sanitized !== val) throw new Error(`${label} contains invalid characters`);
            return true;
});

export const updateProfileValidator = [
    body('firstname').optional().trim()
        .isLength({ min: 3, max: 50 }).withMessage('First name must be 3-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),

    body('lastname').optional().trim()
        .isLength({ min: 3, max: 50 }).withMessage('Last name must be 3-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),
        
    body('username').optional().trim()
        .isLength({ min: 3, max: 20 })
        .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Username cannot contain spaces'),

    body('email').optional().isEmail(),

    rejectIfSus('bio',      300, 'Bio'),

    rejectIfSus('location', 100, 'Location'),

    rejectIfSus('title',    100, 'Title'),

    body('website').optional().trim()
        .custom(val => {
            const url = new URL(val); // throws if invalid
            if (!['http:', 'https:'].includes(url.protocol))
                throw new Error('Invalid protocol');
            return true;
        }).isLength({ max: 200 }),

    // check later
    body('avatar').optional().trim()
        .custom(val => {
            const url = new URL(val);
            if (!['http:', 'https:'].includes(url.protocol))
                throw new Error('Avatar must be http/https URL');
            return true;
        }),
];


export const changePasswordValidator = [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters long.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
];