FROM node:lts-buster

# install system packages
RUN apt-get update && \
  apt-get install -y ffmpeg imagemagick webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /root/asura-md

# copy image file
COPY package.json .
RUN npm install
COPY . .

# bot start commands
CMD ["node", "index.js", "npm start", "start.js"]
