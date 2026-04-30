FROM node:24-alpine AS base
#changement du version node
FROM base AS development

WORKDIR /app

COPY package.json .
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 4001

CMD ["sh", "-c", "npx prisma migrate dev && npm run dev"] 

FROM base AS production

WORKDIR /app

COPY package.json .

RUN npm install --only=production

COPY . .

EXPOSE 4001

CMD ["npm","start"]