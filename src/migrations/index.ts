import * as migration_20260122_142223 from './20260122_142223';
import * as migration_20260129_231731_add_google_calendar_fields from './20260129_231731_add_google_calendar_fields';

export const migrations = [
  {
    up: migration_20260122_142223.up,
    down: migration_20260122_142223.down,
    name: '20260122_142223',
  },
  {
    up: migration_20260129_231731_add_google_calendar_fields.up,
    down: migration_20260129_231731_add_google_calendar_fields.down,
    name: '20260129_231731_add_google_calendar_fields'
  },
];
