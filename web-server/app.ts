///<reference path='./definitelyTyped/app.d.ts'/>
var express = require("express");
var app = express();
var http = require("http").Server(app);
var port = 3700;

app.use(express.static('public'));
app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});


http.listen(port,function() {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log("Listening on port " + port);
    console.log(">>>>>>>>>>>>>>>>>>>>>");    
});