FROM node:20-alpine

# build shared pkgs
WORKDIR /app/shared
COPY packages/shared/ ./
RUN npm install
RUN npm run build

# build srvc
WORKDIR /app/service
COPY services/admin/package.json ./
RUN npm pkg set dependencies.@leetconnect/shared=file:../shared
RUN npm install

COPY services/admin/prisma ./prisma/
RUN npx --no-install prisma generate

COPY services/admin/ ./
RUN npm run build

# Add postgres client for pg_isready
RUN apk add --no-cache postgresql-client

# Add entrypoint script
COPY scripts/entrypoint-with-prisma.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3005
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start"]