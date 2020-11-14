var express = require("express")

var app = express();
var docs_handler = express.static(__dirname + '/docs/');
app.use(docs_handler);
//  start the server
app.listen(8002);
console.log('Swagger docs running on port 8002');
