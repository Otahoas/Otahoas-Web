import * as migration_20260122_142223 from './20260122_142223'
import * as migration_20260129_231731_add_google_calendar_fields from './20260129_231731_add_google_calendar_fields'
import * as migration_20260301_add_public_events_calendar_id from './20260301_add_public_events_calendar_id'
import * as migration_20260316_135646 from './20260316_135646'
import * as migration_20260316_222703 from './20260316_222703'
import * as migration_20260316_224341 from './20260316_224341'
import * as migration_20260323_190456 from './20260323_190456'
import * as migration_20260325_201640 from './20260325_201640'
import * as migration_20260325_211449 from './20260325_211449'
import * as migration_20260413_063211 from './20260413_063211'
import * as migration_20260413_081856 from './20260413_081856'
import * as migration_20260416_202708 from './20260416_202708'
import * as migration_20261011_165535_add_reservation_status from './20261011_165535_add_reservation_status'
import * as migration_20261011_191807_require_sheet_venue_key from './20261011_191807_require_sheet_venue_key'
import * as migration_20261011_192057_require_target_config from './20261011_192057_require_target_config'
import * as migration_20261011_221229_add_overlap_warning from './20261011_221229_add_overlap_warning'

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
    up: migration_20260325_201640.up,
    down: migration_20260325_201640.down,
    name: '20260325_201640',
  },
  {
    up: migration_20260325_211449.up,
    down: migration_20260325_211449.down,
    name: '20260325_211449',
  },
  {
    up: migration_20260413_063211.up,
    down: migration_20260413_063211.down,
    name: '20260413_063211',
  },
  {
    up: migration_20260413_081856.up,
    down: migration_20260413_081856.down,
    name: '20260413_081856',
  },
  {
    up: migration_20260416_202708.up,
    down: migration_20260416_202708.down,
    name: '20260416_202708',
  },
  {
    up: migration_20261011_165535_add_reservation_status.up,
    down: migration_20261011_165535_add_reservation_status.down,
    name: '20261011_165535_add_reservation_status',
  },
  {
    up: migration_20261011_191807_require_sheet_venue_key.up,
    down: migration_20261011_191807_require_sheet_venue_key.down,
    name: '20261011_191807_require_sheet_venue_key',
  },
  {
    up: migration_20261011_192057_require_target_config.up,
    down: migration_20261011_192057_require_target_config.down,
    name: '20261011_192057_require_target_config',
  },
  {
    up: migration_20261011_221229_add_overlap_warning.up,
    down: migration_20261011_221229_add_overlap_warning.down,
    name: '20261011_221229_add_overlap_warning',
  },
]
