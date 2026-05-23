FROM node:20-alpine

RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4000

CMD ["/entrypoint.sh"]
