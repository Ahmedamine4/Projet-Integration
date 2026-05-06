FROM nginx:alpine

# Installation de openssl pour la génération des clés
RUN apk add --no-cache openssl

# Copie de la config
# COPY default.conf /etc/nginx/conf.d/default.conf    on gère la config via les volumes dans docker-compose pour pouvoir switch entre dev et prod facilement

# Copie et préparation du script d'entrée
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]