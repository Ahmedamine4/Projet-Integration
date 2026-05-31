FROM node:24-alpine AS base
#changement du version node

WORKDIR /app
#hérité par toutes les stages

FROM base AS development

COPY package*.json ./
COPY prisma ./prisma

RUN npm install   
 #  npm install pour dev (flexibilité)

COPY . .

EXPOSE 3000
#changement du port

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]


FROM base AS production

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

COPY --chown=node:node . .

#CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
CMD ["npm", "start"]
## "deploy" lit les fichiers dans prisma/migrations/ , npm start avec moins de dependences
