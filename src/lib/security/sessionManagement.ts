import { Session } from 'express-session';
import { v4 as uuidv4 } from 'uuid';

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || uuidv4(),
  name: '__sselfie_sid',
  rolling: true,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
};

export const validateSession = (session: Session): boolean => {
  return session && 
         session.userId && 
         session.created && 
         (Date.now() - session.created) < sessionConfig.cookie.maxAge;
};

export const regenerateSession = (session: Session): void => {
  session.id = uuidv4();
  session.created = Date.now();
};