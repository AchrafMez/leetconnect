FROM node:20-alpine

# build shared pkgs
WORKDIR /app/shared
COPY packages/shared/ ./
RUN npm install
RUN npm run build

# build srvc
WORKDIR /app/service
COPY services/chat/package.json ./
RUN npm pkg set dependencies.@leetconnect/shared=file:../shared
RUN npm install
COPY services/chat/ ./
COPY ../../packages/shared/prisma ./prisma
COPY ../../packages/shared/prisma.config.ts ./prisma.config.ts
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" npx prisma generate --schema prisma/schema.prisma
RUN npm run build

EXPOSE 3003
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
