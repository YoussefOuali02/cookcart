// Must be imported first, before any other module, in main.ts — Sentry's
// NestJS SDK instruments other modules as they're required, so anything
// that loads before this file won't be instrumented.
import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});
