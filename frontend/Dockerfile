FROM node:24-alpine AS base

WORKDIR /app
COPY package*.json ./

FROM base AS development

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]


FROM base AS build

RUN npm install

COPY . .

RUN npm run build


FROM nginxinc/nginx-unprivileged:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]