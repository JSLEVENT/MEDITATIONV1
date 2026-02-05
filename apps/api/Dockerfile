FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY packages/db/package.json packages/db/tsconfig.json ./packages/db/

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
RUN pnpm install --filter @serenity/api...

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db

WORKDIR /app/apps/api
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]
