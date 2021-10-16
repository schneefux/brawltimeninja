FROM node:16 AS builder
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM cubejs/cube:v0.28
COPY --from=builder /app .
EXPOSE 4000
