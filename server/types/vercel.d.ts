declare module '@vercel/edge' {
  export interface VercelRequest extends Request {
    body: any;
    query: { [key: string]: string | string[] };
    cookies: { [key: string]: string };
    headers: Headers & {
      'x-replicate-webhook-signature'?: string;
      'x-replicate-webhook-timestamp'?: string;
    };
  }

  export interface VercelResponse extends Response {
    status(code: number): this;
    json(body: any): Response;
    send(body: any): Response;
    setHeader(name: string, value: string | number | string[]): this;
    getHeader(name: string): string | undefined;
    end(): Response;
  }
}

declare module '@vercel/node' {
  export interface VercelRequest {
    body: any;
    headers: {
      [key: string]: string | string[] | undefined;
    };
  }

  export interface VercelResponse {
    status(statusCode: number): this;
    send(body: any): void;
    json(body: any): void;
    setHeader(name: string, value: string | number | string[]): void;
    getHeader(name: string): string | undefined;
    end(): void;
  }
}

export {};