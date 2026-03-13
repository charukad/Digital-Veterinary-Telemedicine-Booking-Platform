FROM node:20-slim AS base

# Install necessary dependencies
# RUN apk update && apk add --no-cache libc6-compat
# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "--filter", "web", "dev"]
