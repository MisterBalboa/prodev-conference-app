FROM node:current-alpine3.10 AS frontend_image
WORKDIR /usr/frontend
COPY . .

RUN npm install
RUN apk update && apk add vim
RUN apk update && apk add curl

EXPOSE 80

CMD ["npm", "start"]
