# Graph ryder dashboard

#### 1. Create a configuration file in app/config.js

with this content (custyomize the URL):

```
(function (window) {
  window.__config = window.__config || {};

  // API url
  window.__config.apiUrl = 'http://localhost:5000/';

}(this));
```

## Local Installation

#### 2. Tools

- Install needed tools
```sh
$ sudo apt-get install npm
$ sudo npm install -g bower grunt-cli
```

#### 3. Install

- npm and bower install
```sh
$ npm install
```

```sh
$ bower install
```

#### 4. Linkurious.js

- Linkurious lib do not provide bower repository yet
- Clone linkurious where you want

```sh
$ git clone https://github.com/norbertFeron/linkurious.js linkurious
```

- Link and build lib

```sh
$ cd linkurious
$ bower link
$ npm install
$ npm run build
```

- Link to the project

```sh
$ cd /your/app/path
$ bower link linkurious
```

#### 5. To serve the dashboard in development mode

- a shortcut for `grunt serve`

```sh
$ npm start
```

#### 6. To build static files for production without Docker

```sh
$ npm run build
```

This creates a static directory in /dist that is served by the web server.

## Docker Installation

#### 2. build

```
docker build -t graph-ryder-dashboard .
```

#### 3. run

```
docker run -d -p 9000:9000 --name my-graph-ryder-dashboard graph-ryder-dashboard
```

## Post install

- via web browser 

```
http://localhost:9000/
```
