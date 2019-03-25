# nginx-vue-index
Uber fancy directory listing/browsing for nginx using vue.js

## Features

把原版的的ui从新写了一遍....

## Installation

Nginx Config

```Nginx
server {
    listen       ........;

    ... #your config

    root /www/wwwroot/vueindex/;
    index .............;

    location /download/ {
    	root /www/wwwroot/data/;
    }

    location ~ /$ {
    	autoindex on;
        autoindex_format jsonp;
        autoindex_localtime on;
        if ($args = "path") {
        	root /www/wwwroot/data/download/; #drug your files here
        }
        if ($args != "path") {
        	rewrite / /index.html break;
        }
    }

}
```

Clone the repo to document root and run bower.

```Shell
cd /www/wwwroot/
git clone https://github.com/m-d-z-z/nginx-vue-index vueindex
```

## Requirements
* **nginx**: Though i'm using nginx to serve the app and `nginx autoindex` module's json listing to provide data, the app has no hard requirement to nginx. App will run as long it gets json data in same format.
