import { logManager } from 'dotsdk';

export const appLogManager = logManager.configure({
  minLevels: {
    '': 'error',
    slimchickens: 'info',
  },
});
