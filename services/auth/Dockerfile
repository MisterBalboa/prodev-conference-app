FROM node:current-alpine3.10 AS auth_image
WORKDIR /usr/auth
COPY . .

RUN npm install
RUN apk update && apk add vim
RUN apk update && apk add curl

EXPOSE 80
