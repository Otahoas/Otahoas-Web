/**
 * Database Reset Script
 *
 * Use this after making schema changes (adding fields, localization, etc.)
 * to avoid the interactive migration prompts that cause slow page loads.
 *
 * Run with:
 *   pnpm db:reset           - Reset database and re-seed
 *
 * In Docker:
 *   docker compose exec dev pnpm db:reset
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function main() {
  console.log('🗑️  Resetting database...')

  const dbUrl = process.env.DATABASE_URL || 'postgresql://payload:payload@localhost:5432/payload'

  // Parse the connection string
  const url = new URL(dbUrl)
  const host = url.hostname
  const port = url.port || '5432'
  const user = url.username
  const password = url.password
  const database = url.pathname.slice(1)

  // Set PGPASSWORD for psql
  process.env.PGPASSWORD = password

  try {
    // Drop and recreate schema
    console.log('   Dropping schema...')
    await execAsync(
      `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`
    )
    console.log('   Schema dropped and recreated')

    // Run seed
    console.log('🌱 Running seed...')
    const { spawn } = await import('child_process')

    const seed = spawn('pnpm', ['seed'], {
      stdio: 'inherit',
      env: process.env,
    })

    seed.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Database reset complete!')
        console.log('   Restart your dev server to apply changes.')
      } else {
        console.error('\n❌ Seed failed')
        process.exit(1)
      }
    })
  } catch (error) {
    console.error('❌ Failed to reset database:', error)
    process.exit(1)
  }
}

main()
