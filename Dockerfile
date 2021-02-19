FROM node:14

WORKDIR /worker

RUN npm i -g nodemon

COPY ./worker/package.json ./
COPY ./worker/package-lock.json ./

RUN npm i

COPY ./vanilla ./vanilla
COPY ./worker/main.js ./

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]
