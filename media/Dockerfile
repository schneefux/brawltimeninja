# use npm because yarn v1 does not work well with sharp in prod, https://sharp.pixelplumbing.com/install#cross-platform
FROM node:22 AS builder
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:22
# use jemalloc to reduce memory consumption,
# see https://sharp.pixelplumbing.com/install#linux-memory-allocator
RUN apt-get update && apt-get install -y libjemalloc-dev && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so"
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY --from=builder /app/dist ./dist/
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "dist/server.js" ]
