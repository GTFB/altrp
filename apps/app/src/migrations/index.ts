import * as migration_20251017_200015 from './20251017_200015';

export const migrations = [
  {
    up: migration_20251017_200015.up,
    down: migration_20251017_200015.down,
    name: '20251017_200015'
  },
];
