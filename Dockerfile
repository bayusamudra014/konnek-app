FROM node:22-alpine AS base

# Firebase Default Environment Variables
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBQoHvA3-lkpflZz7UDhwKmyTgCyKdDlwo
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=konnek-app.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=konnek-app
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=konnek-app.appspot.com
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=190457990484
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:190457990484:web:835602e65bfc519a274cc1
ENV NEXT_PUBLIC_FCM_VAPID_KEY=BLdzpXa9PwAib_pSTMw8OxvL0axFU0jhbZmTeKUWeCPmuWWgINPbN66hClREfUNEqfgHmog7piaNvVe0I6XEPsM
ENV NEXT_PUBLIC_CACHE_TIME=30000

# Install dependencies only when needed
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT 8080

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD node server.js