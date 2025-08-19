# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
# 타입 오류와 무관하게 번들 생성 (vite)
RUN npx vite build

# --- Runtime stage ---
FROM nginx:1.27-alpine
# 기본 SPA 라우팅 설정 적용 (필요 시 deploy/nginx.conf로 대체 가능)
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico)$ {\n\
    try_files $uri =404;\n\
    expires 7d;\n\
    add_header Cache-Control "public, max-age=604800, immutable";\n\
  }\n\
\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
\n\
  location = /healthz {\n\
    add_header Content-Type text/plain;\n\
    return 200 \"ok\";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]