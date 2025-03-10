import * as migration_20250310_133410 from './20250310_133410';

export const migrations = [
  {
    up: migration_20250310_133410.up,
    down: migration_20250310_133410.down,
    name: '20250310_133410'
  },
];
