FROM mcr.microsoft.com/playwright:focal
RUN apt-get install -y fonts-freefont-ttf

WORKDIR /app
ENV PORT=80
EXPOSE 80

COPY . .
RUN yarn install --frozen-lockfile --ignore-engines && yarn run build

CMD [ "yarn", "run", "start" ]
