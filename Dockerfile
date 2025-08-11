# -------- build stage --------
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# -------- run stage --------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# 빌드 산출물 복사
COPY --from=build /app/dist ./
# Nginx 설정 복사 (필요 시)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]