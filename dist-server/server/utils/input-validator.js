import { Logger } from './logger.js';
export class InputValidator {
    logger;
    constructor() {
        this.logger = new Logger('InputValidator');
    }
    validate(value, rules, fieldName = 'field') {
        const errors = [];
        let sanitizedValue = value;
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${fieldName} is required`);
            return { isValid: false, errors, sanitizedValue };
        }
        if (!rules.required && (value === undefined || value === null || value === '')) {
            return { isValid: true, errors: [], sanitizedValue };
        }
        if (rules.type) {
            const typeError = this.validateType(value, rules.type, fieldName);
            if (typeError) {
                errors.push(typeError);
            }
        }
        if (typeof value === 'string') {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${fieldName} format is invalid`);
            }
            if (rules.type === 'email' && !this.isValidEmail(value)) {
                errors.push(`${fieldName} must be a valid email address`);
            }
            if (rules.type === 'url' && !this.isValidUrl(value)) {
                errors.push(`${fieldName} must be a valid URL`);
            }
            if (rules.type === 'uuid' && !this.isValidUuid(value)) {
                errors.push(`${fieldName} must be a valid UUID`);
            }
            if (rules.sanitize) {
                sanitizedValue = this.sanitizeString(value);
            }
        }
        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${fieldName} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${fieldName} must be no more than ${rules.max}`);
            }
        }
        if (Array.isArray(value)) {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`${fieldName} must have at least ${rules.minLength} items`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`${fieldName} must have no more than ${rules.maxLength} items`);
            }
        }
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`);
        }
        if (rules.custom) {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                errors.push(typeof customResult === 'string' ? customResult : `${fieldName} is invalid`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue
        };
    }
    validateObject(obj, schema) {
        const errors = [];
        const sanitizedObj = {};
        for (const [fieldName, rules] of Object.entries(schema)) {
            const result = this.validate(obj[fieldName], rules, fieldName);
            if (!result.isValid) {
                errors.push(...result.errors);
            }
            sanitizedObj[fieldName] = result.sanitizedValue;
        }
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue: sanitizedObj
        };
    }
    sanitizeHtml(html) {
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    }
    sanitizeSql(input) {
        return input
            .replace(/['"\\]/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '')
            .replace(/;/g, '');
    }
    validateUserInput(input, schema) {
        const result = this.validateObject(input, schema);
        if (result.isValid && result.sanitizedValue) {
            for (const [key, value] of Object.entries(result.sanitizedValue)) {
                if (typeof value === 'string') {
                    result.sanitizedValue[key] = this.sanitizeString(value);
                }
            }
        }
        return result;
    }
    validateRequestBody(body, schema) {
        if (!body || typeof body !== 'object') {
            return {
                isValid: false,
                errors: ['Request body must be a valid JSON object']
            };
        }
        return this.validateUserInput(body, schema);
    }
    validateQueryParams(params, schema) {
        return this.validateUserInput(params, schema);
    }
    validateFileUpload(file, options = {}) {
        const errors = [];
        if (!file) {
            errors.push('File is required');
            return { isValid: false, errors };
        }
        if (options.maxSize && file.size > options.maxSize) {
            errors.push(`File size must be less than ${options.maxSize} bytes`);
        }
        if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
            errors.push(`File type must be one of: ${options.allowedTypes.join(', ')}`);
        }
        if (options.allowedExtensions) {
            const extension = file.originalname.split('.').pop()?.toLowerCase();
            if (!extension || !options.allowedExtensions.includes(extension)) {
                errors.push(`File extension must be one of: ${options.allowedExtensions.join(', ')}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateType(value, type, fieldName) {
        switch (type) {
            case 'string':
                return typeof value === 'string' ? null : `${fieldName} must be a string`;
            case 'number':
                return typeof value === 'number' && !isNaN(value) ? null : `${fieldName} must be a number`;
            case 'boolean':
                return typeof value === 'boolean' ? null : `${fieldName} must be a boolean`;
            case 'array':
                return Array.isArray(value) ? null : `${fieldName} must be an array`;
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value) ? null : `${fieldName} must be an object`;
            default:
                return null;
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    isValidUuid(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    sanitizeString(str) {
        return str
            .trim()
            .replace(/[<>]/g, '')
            .replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match];
        });
    }
}
export const inputValidator = new InputValidator();
//# sourceMappingURL=input-validator.js.map