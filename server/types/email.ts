export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

export interface EmailUser {
  email: string | null | undefined;
  firstName?: string | null;
  lastName?: string | null;
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  plan?: string;
}

export interface EmailOptions {
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailCaptureData {
  email: string;
  firstName?: string;
  source?: string;
}