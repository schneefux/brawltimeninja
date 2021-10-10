FROM node:16 AS builder
ARG SENTRY_ORG=''
ENV SENTRY_ORG=$SENTRY_ORG
ARG SENTRY_PROJECT=''
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN=''
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ARG GIT_REV=''
ENV GIT_REV=$GIT_REV
ARG BRANCH=''
ENV BRANCH=$BRANCH
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM node:16
ENV NODE_ENV=production
ARG CLICKER_URL
ENV CLICKER_URL=$CLICKER_URL
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY --from=builder /app ./
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "./node_modules/.bin/nuxt", "start" ]
