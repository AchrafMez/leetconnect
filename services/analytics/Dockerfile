FROM node:20-alpine

# build shared pkgs
WORKDIR /app/shared
COPY packages/shared/ ./
RUN npm install
RUN npm run build

# build srvc
WORKDIR /app/service
COPY services/analytics/package.json ./
RUN npm pkg set dependencies.@leetconnect/shared=file:../shared
RUN npm install

COPY services/analytics/prisma ./prisma/
RUN npx --no-install prisma generate

COPY services/analytics/ ./
RUN npm run build

EXPOSE 3004
# CMD ["node", "dist/index.js"]
CMD ["npm", "run", "dev"]
