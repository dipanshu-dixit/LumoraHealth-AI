import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  debug: false,
  transportOptions: {
    timeout: 5000,
  },
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "dark",
      isNameRequired: true,
      isEmailRequired: true,
      showBranding: false,
      autoInject: false,
    }),
  ],
});