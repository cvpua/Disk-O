FROM node:16.15.0
RUN mkdir -p /mnt/diskO-server
ADD . /mnt/diskO-server
WORKDIR /mnt/diskO-server
COPY package.json ./
RUN npm install
EXPOSE 8085
RUN npm install -g pm2
CMD pm2-runtime start npm -- run dev2