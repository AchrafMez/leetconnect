#!/bin/bash

mkdir -p certs
cd certs

echo "gen root CA..."
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 \
  -keyout ca.key -out ca.crt \
  -subj "/C=MA/ST=State/L=City/O=LeetConnect/CN=RootCA"

SERVICES=("nginx" "postgres" "redis" "auth" "marketplace" "chat" "analytics" "admin" "frontend")

for SERVICE in "${SERVICES[@]}"; do
  echo "gen cert for $SERVICE..."
  
  openssl genrsa -out ${SERVICE}.key 2048
  
  openssl req -new -key ${SERVICE}.key -out ${SERVICE}.csr \
    -subj "/C=MA/ST=State/L=City/O=LeetConnect/CN=${SERVICE}"
  
  echo "subjectAltName=DNS:${SERVICE},DNS:localhost,IP:127.0.0.1" > ${SERVICE}.ext
  
  openssl x509 -req -in ${SERVICE}.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
    -out ${SERVICE}.crt -days 365 -sha256 -extfile ${SERVICE}.ext
  
  rm ${SERVICE}.csr ${SERVICE}.ext
done

chmod 600 *.key
chmod 644 ca.crt *.crt

echo "certs generated successfully!"