FROM node:current-alpine3.10 as proxy_manager
WORKDIR /usr/proxy_manager
COPY . .
COPY ./.vimrc /root

RUN npm install
RUN apk update && apk add vim
RUN apk update && apk add curl

CMD ["npm", "start"]
