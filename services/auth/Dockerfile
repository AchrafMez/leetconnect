FROM node:20-alpine

# build shared pkgs
WORKDIR /app/shared
COPY packages/shared/ ./
RUN npm install
RUN npm run build

# build srvc
WORKDIR /app/service
COPY services/auth/package.json ./
RUN npm pkg set dependencies.@leetconnect/shared=file:../shared
RUN npm install
COPY services/auth/ ./
RUN npm run build

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
