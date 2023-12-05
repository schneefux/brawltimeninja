FROM node:21 AS builder
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM node:21
# use jemalloc to reduce memory consumption,
# see https://sharp.pixelplumbing.com/install#linux-memory-allocator
RUN apt-get update && apt-get install -y libjemalloc-dev && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so"
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY --from=builder /app/dist ./dist/
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "dist/server.js" ]
