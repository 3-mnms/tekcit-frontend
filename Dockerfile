# ---- BUILD ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
RUN npm run build

# ---- RUNTIME (Nginx) ----
FROM nginx:1.27-alpine
# SPA 라우팅을 위한 Nginx 설정 복사
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
# 정적 파일 배포
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]