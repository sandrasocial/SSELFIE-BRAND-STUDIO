import { NextApiRequest, NextApiResponse } from 'next';
import sqlstring from 'sqlstring';

export const sqlSanitizer = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return sqlstring.escape(value);
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).reduce((acc, key) => {
        acc[key] = sanitizeValue(value[key]);
        return acc;
      }, {} as any);
    }
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  
  next();
};