# Stage 1: build Angular app using Node (Debian-based tag)
FROM node:20-bullseye-slim AS builder
WORKDIR /app
# copy package files and install deps (cacheable)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps


# copy source and build
COPY . .
# Adjust the build command if your package.json uses a different script name
RUN npm run build --if-present


# Stage 2: runtime using Debian slim + nginx
FROM debian:12-slim
RUN apt-get update \
&& apt-get install -y --no-install-recommends nginx ca-certificates \
&& rm -rf /var/lib/apt/lists/*


# remove default site and copy optimized nginx conf
RUN rm -rf /var/www/html /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf


# copy built static site from builder
# adjust path to `dist/<project-name>` if different
COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]