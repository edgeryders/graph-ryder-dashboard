#!/bin/sh

apt-get install npm

#sudo docker run -it --name dash -v "$HOME":/usr/src/app -w /usr/src/app -p 9000:9000 node:4 bash
npm install -g grunt-cli
npm install -g bower
npm install

cd ../sigma.js
bower link --allow-root
npm install
npm run build

cd ../linkurious.js
bower link --allow-root
npm install
npm run build

cd ../graph-ryder-dashboard
bower link linkurious --allow-root
bower link sigma --allow-root
#npm install
npm start
