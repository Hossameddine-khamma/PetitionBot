FROM alpine:latest
RUN apk add curl 
RUN apk add --no-cache nodejs npm
WORKDIR /usr/src/api
COPY . .
RUN npm install
EXPOSE 3000 
CMD npm run serv-start