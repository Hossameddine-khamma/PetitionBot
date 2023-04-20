FROM alpine:latest
RUN apk add curl 
RUN apk add --no-cache nodejs npm
WORKDIR /usr/src/bot
COPY . .
RUN npm install
CMD npm run start