FROM node:20-slim AS base

# Install necessary tools
RUN apt-get update && apt-get install -y openssl
# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

# Install dependencies (including dev dependencies for nest start --watch)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter vetcare-api prisma:generate

EXPOSE 8000

# Start the NestJS API in dev mode
CMD ["pnpm", "--filter", "vetcare-api", "start:dev"]
