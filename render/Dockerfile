FROM node:22 AS builder
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM mcr.microsoft.com/playwright:v1.45.1-noble
RUN apt-get -y update && apt-get install -y fonts-noto fonts-noto-color-emoji
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY --from=builder /app/dist ./dist/
ENV PORT=80
EXPOSE 80
USER pwuser
CMD [ "node", "dist/server.js" ]
