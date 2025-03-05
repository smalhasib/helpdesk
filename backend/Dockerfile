FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install prisma @prisma/client
RUN npm install -D tsx typescript @types/node

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm run dev"] 