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

EXPOSE 3005
# CMD ["node", "dist/index.js"]
CMD ["npm", "run", "dev"]