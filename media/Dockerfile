# use alpine for better memory management
# see https://sharp.pixelplumbing.com/install#linux-memory-allocator
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY --from=builder /app/dist ./dist/
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "dist/server.js" ]
