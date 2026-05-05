FROM node:24-alpine AS base  
#modification de la version node de 20 --> 24
WORKDIR /app
COPY package*.json .

FROM base AS development
RUN npm ci 
# POUR PROD ET DEV : npm ci est utilisé à la place de npm install pour assurer une installation rapide, propre et reproductible dans un environnement Docker
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=production /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]