FROM node:current-alpine3.10
WORKDIR /usr/auth
COPY . .

RUN npm install
RUN apk update && apk add vim
RUN apk update && apk add curl
