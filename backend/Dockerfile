FROM node:24-alpine AS base
#changement du version node

WORKDIR /app
#hérité par toutes les stages

FROM base AS development

COPY package*.json .
COPY prisma ./prisma

RUN npm install   
 #  npm install pour dev (flexibilité)

COPY . .

EXPOSE 3000
#changement du port

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate dev && npm run dev"]


FROM base AS production

COPY package.json .
COPY package-lock.json . 
# nécessaire pour npm ci
COPY prisma ./prisma
#le schema doit être dans l'image

RUN npm install --omit=dev 
# est la version moderne et recommandée pour PROD et CI/CD (better than --only=production)
RUN npx prisma generate
#crée le client JS depuis le schema
COPY . .

EXPOSE 3000 

#CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
CMD ["npm", "start"]
## "deploy" lit les fichiers dans prisma/migrations/ , npm start avec moins de dependences