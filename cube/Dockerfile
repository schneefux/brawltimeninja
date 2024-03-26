FROM node:21 AS builder
WORKDIR /app
COPY ./package.json ./yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .

FROM cubejs/cube:v0.35
RUN apt-get update \
    && apt-get install -y patch \
    && rm -rf /var/lib/apt/lists/*
# https://github.com/cube-js/cube/issues/2368
COPY ./add-cache-control.patch /cube
# https://github.com/cube-js/cube/pull/7959
COPY ./fix-redis.patch /cube
RUN cd /cube && \
  patch -p0 < add-cache-control.patch && \
  patch -p0 < fix-redis.patch
COPY --from=builder /app .
EXPOSE 4000
