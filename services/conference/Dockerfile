FROM node:15.7.0-buster
WORKDIR /usr/src/conference

COPY . .

RUN apt-get install gcc
RUN npm install -g node-gyp
RUN apt-get update && apt-get install vim -y

RUN CXX=g++-6 npm install

EXPOSE 80
CMD [ "npm", "run", "dev" ]

