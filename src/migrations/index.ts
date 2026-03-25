import * as migration_20260122_142223 from './20260122_142223'
import * as migration_20260129_231731_add_google_calendar_fields from './20260129_231731_add_google_calendar_fields'
import * as migration_20260301_add_public_events_calendar_id from './20260301_add_public_events_calendar_id'
import * as migration_20260316_135646 from './20260316_135646'
import * as migration_20260316_222703 from './20260316_222703'
import * as migration_20260316_224341 from './20260316_224341'
import * as migration_20260323_190456 from './20260323_190456'
import * as migration_20260325_211449 from './20260325_211449'
import * as migration_20260325_201640 from './20260325_201640'

export const migrations = [
  {
    up: migration_20260122_142223.up,
    down: migration_20260122_142223.down,
    name: '20260122_142223',
  },
  {
    up: migration_20260129_231731_add_google_calendar_fields.up,
    down: migration_20260129_231731_add_google_calendar_fields.down,
    name: '20260129_231731_add_google_calendar_fields',
  },
  {
    up: migration_20260301_add_public_events_calendar_id.up,
    down: migration_20260301_add_public_events_calendar_id.down,
    name: '20260301_add_public_events_calendar_id',
  },
  {
    up: migration_20260316_135646.up,
    down: migration_20260316_135646.down,
    name: '20260316_135646',
  },
  {
    up: migration_20260316_222703.up,
    down: migration_20260316_222703.down,
    name: '20260316_222703',
  },
  {
    up: migration_20260316_224341.up,
    down: migration_20260316_224341.down,
    name: '20260316_224341',
  },
  {
    up: migration_20260323_190456.up,
    down: migration_20260323_190456.down,
    name: '20260323_190456',
  },
  {
    up: migration_20260325_211449.up,
    down: migration_20260325_211449.down,
    name: '20260325_211449',
  },
  {
    up: migration_20260325_201640.up,
    down: migration_20260325_201640.down,
    name: '20260325_201640',
  },
]
