FROM node:18.12.1-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD [ "node", "index.js" ]
EXPOSE 3000
