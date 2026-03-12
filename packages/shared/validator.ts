// validating a req body or query params
import { Request, Response, NextFunction } from 'express';

interface FieldRule {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean';
    minLength?: number;
    maxLength?: number;
    isEmail?: boolean;
}

type ValidationRules = Record<string, FieldRule>;

function validateBody(rules: ValidationRules) {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors : string[] = [];
        for(const [field, rule] of Object.entries(rules)){
            const value = req.body[field];
            if(rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            if(value !== undefined && value !== null){
                if(rule.type && typeof value !== rule.type){
                    errors.push(`${field} must be of type ${rule.type}`);
                }
                if(rule.minLength && typeof value === 'string' && value.length < rule.minLength){
                    errors.push(`${field} must be at least ${rule.minLength} characters`);
                }
                if(rule.maxLength && typeof value === 'string' && value.length > rule.maxLength){
                    errors.push(`${field} must be at most ${rule.maxLength} characters`);
                }
                if(rule.isEmail && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){
                    errors.push(`${field} must be a valid email`);
                }
            }
        }

        if(errors.length > 0){
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        next();
    };
}

function validateQuery(rules: ValidationRules) {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors = [];
        for(const [field, rule] of Object.entries(rules)){
            const value = req.query[field];
            if(rule.required && !value){
                errors.push(`Query param '${field}' is required`);
            }
        }
        if(errors.length > 0){
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        next();
    };
}

export { validateBody, validateQuery };
