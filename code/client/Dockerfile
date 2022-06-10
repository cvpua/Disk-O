FROM node:16.15.0
RUN mkdir -p /mnt/diskO-client
ADD . /mnt/diskO-client
WORKDIR /mnt/diskO-client
COPY package.json ./
RUN npm install
EXPOSE 8080
RUN npm install -g pm2
CMD pm2-runtime start npm -- start