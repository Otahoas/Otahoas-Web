# Local Migration Scripts

Database seeding and reset utilities for local development.

## Scripts

- **export-seed.ts** - Export database state to JSON seed file
- **import-seed.ts** - Import seed data and match images from source directories
- **clear_pages_media.ts** - Clear pages and media collections

## Usage

In local development environment:

```bash
# Load the current model from main
pnpm export:pages-and-media

# Upload it to your local environment
pnpm seed:pages-and-media
```

When going back to main:

```bash
# Load the current model from local environment
pnpm export:pages-and-media

# Upload it to main
pnpm db:reset pages media
pnpm seed:pages-and-media
```


Or directly in Docker:

```bash
docker compose exec dev pnpm export:pages-and-media
docker compose exec dev pnpm seed:pages-and-media
docker compose exec dev pnpm db:reset pages
```
