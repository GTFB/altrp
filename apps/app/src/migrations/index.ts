import * as migration_20251024_171847 from './20251024_171847';
import * as migration_20251028_142433 from './20251028_142433';

export const migrations = [
  {
    up: migration_20251024_171847.up,
    down: migration_20251024_171847.down,
    name: '20251024_171847',
  },
  {
    up: migration_20251028_142433.up,
    down: migration_20251028_142433.down,
    name: '20251028_142433'
  },
];
