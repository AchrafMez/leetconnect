FROM node:20-alpine

# build shared pkgs
WORKDIR /app/shared
COPY packages/shared/ ./
RUN npm install
RUN npm run build

# build srvc
WORKDIR /app/service
COPY services/marketplace/package.json ./
RUN npm pkg set dependencies.@leetconnect/shared=file:../shared
RUN npm install
COPY services/marketplace/ ./
RUN npx prisma generate
RUN npm run build

EXPOSE 3002
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
# CMD ["node", "dist/index.js"]
