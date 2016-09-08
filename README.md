## Graph ryder dashboard

This project is base on Free Admin Bootstrap Theme [SB Admin v2.0](http://startbootstrap.com/template-overviews/sb-admin-2/).

## Local Installation
####1. Tools
- Install needed tools
```sh
$ sudo apt-get install npm
$ sudo npm install -g bower grunt-cli
```
####2. Install

- npm and bower install
```sh
$ npm install
```

```sh
$ bower install
```

####3. Sigma.js & Linkurious.js

- Linkurious lib do not provide bower repository yet
- Clone linkurious where you want
```sh
$ git clone https://github.com/norbertFeron/linkurious.js linkurious
```
- Link it
```sh
$ cd linkurious
$ bower link
```
- Link to the project
```sh
$ cd /your/app/path
$ bower link linkurious
```

####4. Api Url

- Change apiUrl in app/scripts/app.js
```
  .constant('config', {
        apiUrl: 'http://localhost:5000/'
    })
```

####5. On the command prompt run the following commands

- a shortcut for `grunt serve`
```sh
$ npm start
```

## Docker Installation
####1. Change api url in app/scripts/app.js
```
  .constant('config', {
        apiUrl: 'http://localhost:5000/'
    })
```
####2. build
```
docker build -t graph-ryder-dashboard .
```
####3. run
```
docker run -d -p 9000:9000 --name my-graph-ryder-dashboard graph-ryder-dashboard
```
