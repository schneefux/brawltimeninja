FROM node:14

WORKDIR /app
ENV PORT=80
EXPOSE 80

COPY package*.json ./
RUN npm ci && npm build

COPY . .

CMD [ "npm", "start" ]
