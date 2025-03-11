import * as migration_20250310_133410 from './20250310_133410';
import * as migration_20250311_031012 from './20250311_031012';
import * as migration_20250311_031946 from './20250311_031946';
import * as migration_20250311_143525 from './20250311_143525';

export const migrations = [
  {
    up: migration_20250310_133410.up,
    down: migration_20250310_133410.down,
    name: '20250310_133410',
  },
  {
    up: migration_20250311_031012.up,
    down: migration_20250311_031012.down,
    name: '20250311_031012',
  },
  {
    up: migration_20250311_031946.up,
    down: migration_20250311_031946.down,
    name: '20250311_031946',
  },
  {
    up: migration_20250311_143525.up,
    down: migration_20250311_143525.down,
    name: '20250311_143525'
  },
];
