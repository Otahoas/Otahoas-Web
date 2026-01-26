FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# Mount PAYLOAD_SECRET as a build secret (NOT stored in image layers)
RUN --mount=type=secret,id=payload_secret \
  export PAYLOAD_SECRET="$(cat /run/secrets/payload_secret)" && \
  pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# ✅ add pnpm to runtime container so you can run "pnpm seed"
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
