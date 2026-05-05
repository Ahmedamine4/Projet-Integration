FROM node:24-alpine AS base
#changement du version node
FROM base AS development

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY prisma ./prisma
# POUR PROD ET DEV : npm ci est utilisé à la place de npm install pour assurer une installation rapide, propre et reproductible dans un environnement Docker
RUN npm ci
RUN npx prisma generate

COPY . .

EXPOSE 3000
#changement du port


CMD ["sh", "-c", "npx prisma migrate dev && npm run dev"] 

FROM base AS production

WORKDIR /app

COPY package.json .

RUN npm install --omit=dev 
# est la version moderne et recommandée pour PROD et CI/CD (better than --only=production)

COPY . .

EXPOSE 3000 

CMD ["npm","start"]