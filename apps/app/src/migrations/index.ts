import * as migration_20251017_210453 from './20251017_210453';
import * as migration_20251023_141355 from './20251023_141355';

export const migrations = [
  {
    up: migration_20251017_210453.up,
    down: migration_20251017_210453.down,
    name: '20251017_210453',
  },
  {
    up: migration_20251023_141355.up,
    down: migration_20251023_141355.down,
    name: '20251023_141355'
  },
];
