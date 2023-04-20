FROM node
WORKDIR /usr/api
COPY package*.json .
RUN npm install --quiet
COPY . .
RUN npm run build

CMD npm run migrate:up && npm run sql:insert-user && npm run start:prod
