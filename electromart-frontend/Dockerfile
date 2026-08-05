# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Optional: regenerate sitemap.xml against the live API before building.
# Uncomment once your backend is deployed and reachable at build time:
# RUN API_URL=https://api.electromart.com/api SITE_URL=https://www.electromart.com node scripts/generate-sitemap.mjs

RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

RUN addgroup -S angular && adduser -S angular -G angular
USER angular

# Angular SSR (--ssr) builds output to dist/<project-name>/server/server.mjs
COPY --from=build /app/dist/electromart-frontend ./dist/electromart-frontend

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/electromart-frontend/server/server.mjs"]
