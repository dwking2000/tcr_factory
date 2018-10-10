var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic("/dapp")).listen(8000);