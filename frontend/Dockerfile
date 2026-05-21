# ── Aşama 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# API URL build anında gömülür (Vite env variable)
ARG VITE_API_BASE_URL=http://localhost:8000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# ── Aşama 2: Serve (nginx) ───────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
