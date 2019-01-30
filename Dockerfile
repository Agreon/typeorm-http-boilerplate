FROM node:alpine

ADD . /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm i

CMD [ "npm start" ]