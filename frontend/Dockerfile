# build
FROM node:20-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . .
RUN npm run build

# serve static assets
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

# dev
FROM node:20-alpine AS dev
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN npm install --no-fund --no-audit --legacy-peer-deps
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]