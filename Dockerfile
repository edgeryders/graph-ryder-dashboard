
FROM node:4-onbuild
EXPOSE 9000
RUN npm install -g bower grunt-cli
RUN npm install
RUN bower install --allow-root
RUN git clone https://github.com/norbertFeron/linkurious.js linkurious && cd linkurious && bower link --allow-root && npm install && npm run build && cd .. && bower link linkurious --allow-root
CMD [ "npm", "start" ]
