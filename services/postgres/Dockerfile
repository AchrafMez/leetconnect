FROM postgres:16-alpine

RUN mkdir -p /etc/ssl/internal
COPY certs/postgres.crt /etc/ssl/internal/postgres.crt
COPY certs/postgres.key /etc/ssl/internal/postgres.key
COPY certs/ca.crt /etc/ssl/internal/ca.crt

RUN chown -R postgres:postgres /etc/ssl/internal && chmod 600 /etc/ssl/internal/postgres.key
