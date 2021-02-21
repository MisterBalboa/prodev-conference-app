FROM node:current-alpine3.10
WORKDIR /usr/badges
COPY . .

RUN npm install
RUN apk update && apk add vim
RUN apk update && apk add curl
