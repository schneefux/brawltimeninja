FROM node:22 AS builder
ARG SENTRY_DSN=''
ENV SENTRY_DSN=$SENTRY_DSN
ARG SENTRY_ORG=''
ENV SENTRY_ORG=$SENTRY_ORG
ARG SENTRY_PROJECT=''
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN=''
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ARG GIT_REV=''
ENV VITE_GIT_REV=$GIT_REV
ARG BRANCH=''
ENV VITE_BRANCH=$BRANCH
WORKDIR /app
COPY ./.npmrc ./package.json ./yarn.lock .
RUN sed -i '/@schneefux\/klicker/d' package.json
RUN yarn install --frozen-lockfile
RUN npm install --force --save @schneefux/klicker
RUN cat package.json
COPY . .
RUN yarn run build

FROM node:22
# use jemalloc to reduce memory consumption
RUN apt-get update && apt-get install -y libjemalloc-dev && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so"
ENV NODE_ENV=production
ARG SENTRY_DSN=''
ENV SENTRY_DSN=$SENTRY_DSN
ARG SENTRY_ORG=''
ENV SENTRY_ORG=$SENTRY_ORG
ARG SENTRY_PROJECT=''
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN=''
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ARG GIT_REV=''
ENV VITE_GIT_REV=$GIT_REV
ARG BRANCH=''
ENV VITE_BRANCH=$BRANCH
ARG GIT_REV=''
ENV VITE_GIT_REV=$GIT_REV
WORKDIR /app
COPY --from=builder /app ./
RUN rm ./.npmrc
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "--heapsnapshot-signal=SIGUSR2",  "--diagnostic-dir=/tmp", "./dist/server/index.mjs" ]
