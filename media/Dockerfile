FROM node:16 AS builder
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM node:16
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./dist/
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "dist/server.js" ]
