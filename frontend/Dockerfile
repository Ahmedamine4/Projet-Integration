FROM node:24-alpine AS base  
#modification de la version node de 20 --> 24
WORKDIR /app
COPY package*.json .

FROM base AS development   
RUN npm install 
 #  npm install pour dev (flexibilité)
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]     


FROM base AS build
RUN npm ci
# POUR PROD : npm ci est utilisé à la place de npm install pour assurer une installation rapide, propre et reproductible dans un environnement Docker , aussi pour CI (gitlab)
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]