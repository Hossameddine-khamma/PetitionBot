FROM alpine:latest
RUN apk update && apk add curl 

RUN apk add --no-cache nodejs npm shadow

RUN adduser -D web

WORKDIR /usr/src/web
COPY . .
RUN npm install
EXPOSE 3000 

USER web

CMD npm run serv-start