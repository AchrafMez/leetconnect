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

COPY services/chat/prisma ./prisma/
RUN npx --no-install prisma generate

COPY services/chat/ ./
RUN npm run build

# pg_isready for the shared entrypoint
RUN apk add --no-cache postgresql-client

COPY scripts/entrypoint-with-prisma.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3003
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]
