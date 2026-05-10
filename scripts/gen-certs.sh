#!/bin/bash

mkdir -p certs
cd certs

echo "gen nginx cert"

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout nginx.key \
  -out nginx.crt \
  -days 365 \
  -subj "/C=MA/ST=State/L=City/O=LeetConnect/CN=10.30.244.165"

#generating keys 
echo "gen JWT RS256 Keys..."
# Generate the private key
openssl genrsa -out jwt_private.key 2048
# Extract the public key in PEM format
openssl rsa -in jwt_private.key -pubout -out jwt_public.key

# Secure the private key
chmod 600 nginx.key jwt_private.key 
chmod 644 nginx.crt jwt_public.key

echo "JWT keys generated successfully!"
