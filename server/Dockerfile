# --- deps: install once, reused by build and runtime stages ---
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# better-sqlite3 ships prebuilt binaries for linux/musl and has no install
# script of its own, but npm's legacy "binding.gyp present -> run node-gyp
# rebuild" default still fires unless scripts are disabled. Skipping scripts
# avoids that unnecessary (and toolchain-requiring) source compile entirely.
RUN npm ci --ignore-scripts

# --- build: compile TypeScript to dist/ ---
FROM deps AS build
COPY . .
RUN npm run build

# --- runtime: production deps only + compiled output ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3001/api/items >/dev/null || exit 1

CMD ["node", "dist/index.js"]
