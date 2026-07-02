# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist --rootDir . --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck --target ES2020

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD sh -c "npx prisma db push --accept-data-loss && (node dist/prisma/seed.js || echo 'seed skipped') && npm run start:prod"
