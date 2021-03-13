FROM node:current-alpine3.10 AS badges_image
WORKDIR /usr/badges
COPY . .

RUN npm install
RUN apk update && apk add vim
RUN apk update && apk add curl

EXPOSE 80
