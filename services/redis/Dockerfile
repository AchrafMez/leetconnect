FROM redis:7-alpine

RUN mkdir -p /etc/ssl/internal
COPY certs/redis.crt /etc/ssl/internal/redis.crt
COPY certs/redis.key /etc/ssl/internal/redis.key
COPY certs/ca.crt /etc/ssl/internal/ca.crt

RUN chown -R redis:redis /etc/ssl/internal && chmod 600 /etc/ssl/internal/redis.key
