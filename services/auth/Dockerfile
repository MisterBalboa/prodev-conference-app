FROM node:15.7.0-buster

RUN apt-get install -y git-core curl build-essential openssl libssl-dev \
 && git clone https://github.com/nodejs/node.git \
 && cd node \
 && ./configure \
 && make \
 && sudo make install

WORKDIR /usr/src/auth

COPY . .

RUN apt-get install gcc
RUN npm install -g node-gyp
RUN apt-get update && apt-get install vim -y

RUN CXX=g++-6 npm install

EXPOSE 80
CMD [ "npm", "run", "dev" ]

