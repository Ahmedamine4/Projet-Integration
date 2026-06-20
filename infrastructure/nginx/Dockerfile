FROM nginxinc/nginx-unprivileged:alpine

USER root

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl \
    && chown -R nginx:nginx /etc/nginx/ssl /etc/nginx/conf.d /var/cache/nginx /var/run

COPY entrypoint.sh /entrypoint.sh

RUN sed -i 's/\r$//' /entrypoint.sh \
    && chmod +x /entrypoint.sh \
    && chown nginx:nginx /entrypoint.sh

USER root
ENTRYPOINT ["/entrypoint.sh"]