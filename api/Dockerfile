FROM alpine:latest
RUN apk update && apk add curl 

RUN apk add --no-cache nodejs npm shadow

RUN adduser -D api

WORKDIR /usr/src/api
COPY . .
RUN npm install

EXPOSE 3000 

USER api

CMD npm run serv-start