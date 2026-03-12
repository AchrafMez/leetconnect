FROM node:20-alpine
WORKDIR /app
COPY packages/shared/ ./shared/
COPY services/analytics/package.json ./
RUN npm install --production
COPY services/analytics/src/ ./src/
COPY services/analytics/tsconfig.json ./
RUN npm run build
EXPOSE 3004
CMD ["node", "dist/index.js"]