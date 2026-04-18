FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .
RUN npm install

FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
# A verifier si il faut exposer sur 0.0.0.0

FROM base AS production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=production /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]