FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN npm install --no-fund --no-audit --legacy-peer-deps
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
