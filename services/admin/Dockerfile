FROM node:20-alpine
WORKDIR /app
COPY packages/shared/ ./shared/
COPY services/admin/package.json ./
RUN npm install --production
COPY services/admin/src/ ./src/
COPY services/analytics/tsconfig.json ./
RUN npm run build
EXPOSE 3005
CMD ["node", "src/index.js"]