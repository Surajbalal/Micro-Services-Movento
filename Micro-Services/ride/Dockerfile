FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN npm install -g pnpm@10.30.0

RUN pnpm install

COPY . .

EXPOSE 3003

CMD ["pnpm", "dev"]
