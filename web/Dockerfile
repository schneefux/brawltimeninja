FROM node:16 AS builder
ARG SENTRY_DSN=''
ENV SENTRY_DSN=$SENTRY_DSN
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
ARG GITHUB_TOKEN=''
WORKDIR /app
COPY .npmrc package.json yarn.lock .
RUN sed -i -E 's_"@schneefux/klicker": ".*"_"@schneefux/klicker": "*"_g' ./package.json
RUN echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN" >> .npmrc
RUN yarn add @schneefux/klicker
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM node:16
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY --from=builder /app ./
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "./node_modules/.bin/nuxt", "start" ]
