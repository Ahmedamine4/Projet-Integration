#!/bin/sh

# Créer le dossier pour les certs s'il n'existe pas
mkdir -p /etc/nginx/ssl

# Générer le certificat uniquement s'il n'existe pas déjà
if [ ! -f /etc/nginx/ssl/server.crt ]; then
    echo "Certificats manquants. Génération automatique..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/server.key \
        -out /etc/nginx/ssl/server.crt \
        -subj "/C=MA/ST=Tanger/L=Tanger/O=Projet/CN=localhost"
fi

# Lancer Nginx
exec nginx -g 'daemon off;'