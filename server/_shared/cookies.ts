/* Shared cookie helpers */

import { isProd } from './stack-config.js';

export function logoutSetCookieHeaders(): string[] {
  const domain = isProd() ? '.sselfie.ai' : undefined;
  const base = {
    Path: '/',
    HttpOnly: true,
    Secure: true,
    'SameSite': 'Lax',
    'Max-Age': 0,
  } as const;

  const names = [
    'stack-access',
    'stack-access-token',
    'stack_session',
    '__Secure-next-auth.session-token',
  ];

  return names.map((name) => {
    const parts = [
      `${name}=`,
      `Path=${base.Path}`,
      'HttpOnly',
      'Secure',
      `SameSite=${base['SameSite']}`,
      `Max-Age=${base['Max-Age']}`,
    ];
    if (domain) parts.push(`Domain=${domain}`);
    return parts.join('; ');
  });
}

