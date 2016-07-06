## Graph ryder dashboard

This project is base on Free Admin Bootstrap Theme [SB Admin v2.0](http://startbootstrap.com/template-overviews/sb-admin-2/).

## Installation
####1. Tools
- Install needed tools
```sh
$ sudo apt-get install npm
$ sudo npm install -g grunt-cli
$ sudo npm install -g bower
```
####2. Install

- Bower install is ran from the postinstall
```sh
$ npm install
```

####3. Sigma.js & Linkurious.js

- Sigma and linkurious lib do not provide bower repository yet
- You can link it with
```sh
$ bower link linkurious /YourPathTo/linkurious.js
```
Same way for sigma

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
