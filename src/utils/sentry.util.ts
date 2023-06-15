import * as Sentry from "@sentry/browser";

export function setSentryEnabled(enabled: boolean) {
  const client = Sentry.getCurrentHub().getClient();
  // @ts-ignore
  client?.getOptions().enabled = enabled;
}
