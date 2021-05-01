FROM node:16

WORKDIR /app
ENV PORT=80
EXPOSE 80

COPY . .
RUN yarn install --frozen-lockfile && yarn run build

CMD [ "yarn", "run", "start" ]
