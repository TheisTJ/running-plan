# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json* ./
RUN npm ci

# Build the app.
COPY . .
RUN npm run build

# ---- Stage 2: serve with nginx ----
FROM nginx:1.27-alpine AS runtime

# Custom config: SPA fallback + gzip + asset caching.
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Static build output.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine ships a sensible default CMD; keep it explicit for clarity.
CMD ["nginx", "-g", "daemon off;"]
