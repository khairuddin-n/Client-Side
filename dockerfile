FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --fetch-timeout=30000 --fetch-retries=1
COPY . .
RUN npm run build

FROM nginx:stable-alpine
ENV API_UPSTREAM=http://127.0.0.1:8081
COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY deployment/security-headers.conf /etc/nginx/security-headers.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
