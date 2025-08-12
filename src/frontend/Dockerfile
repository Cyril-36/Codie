# syntax=docker/dockerfile:1.7

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_NODE_ENV

# Set environment variables for the build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}

RUN corepack enable
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . ./
RUN pnpm run build

# ---- runtime ----
FROM nginx:alpine AS runtime
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck endpoint at /healthz
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://localhost/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
