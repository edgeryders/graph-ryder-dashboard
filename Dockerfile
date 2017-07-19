
FROM digitallyseamless/nodejs-bower-grunt:4

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

ADD bower.json /tmp/bower.json
RUN cd /tmp && bower install --allow-root
RUN mkdir -p /opt/app && cp -a /tmp/bower_components /opt/app/

RUN cd /tmp && git clone https://github.com/norbertFeron/linkurious.js linkurious && cd linkurious && npm install && npm run build
RUN mkdir -p /opt/app && cp -a /tmp/linkurious /opt/app/

RUN cd /opt/app/linkurious && bower link --allow-root && cd /opt/app &&  bower link linkurious --allow-root

WORKDIR /opt/app
ADD . /opt/app

EXPOSE 9000
CMD [ "npm", "start" ]

