FROM node:14

WORKDIR /app
ENV PORT=80
EXPOSE 80

COPY . .
RUN npm ci && npm run build

CMD [ "npm", "start" ]
