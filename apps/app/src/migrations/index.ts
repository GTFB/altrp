import * as migration_20251024_171847 from './20251024_171847';
import * as migration_20251028_142433 from './20251028_142433';
import * as migration_20251029_135641 from './20251029_135641';
import * as migration_20251031_011651 from './20251031_011651';
import * as migration_20251103_195309 from './20251103_195309';

export const migrations = [
  {
    up: migration_20251024_171847.up,
    down: migration_20251024_171847.down,
    name: '20251024_171847',
  },
  {
    up: migration_20251028_142433.up,
    down: migration_20251028_142433.down,
    name: '20251028_142433',
  },
  {
    up: migration_20251029_135641.up,
    down: migration_20251029_135641.down,
    name: '20251029_135641',
  },
  {
    up: migration_20251031_011651.up,
    down: migration_20251031_011651.down,
    name: '20251031_011651',
  },
  {
    up: migration_20251103_195309.up,
    down: migration_20251103_195309.down,
    name: '20251103_195309'
  },
];
