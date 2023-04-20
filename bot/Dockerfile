FROM alpine:latest
RUN apk update && apk add curl 

RUN apk add --no-cache nodejs npm shadow

RUN adduser -D bot

WORKDIR /usr/src/bot
COPY . .
RUN npm install

USER bot

CMD npm run start