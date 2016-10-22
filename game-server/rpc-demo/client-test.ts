var socketRpc = require("./socket-rpc");


var proxy = socketRpc.connect("127.0.0.1",6550);
proxy.add(3,6,function(result){
    console.log("2 add result:",result);
})
proxy.sub(23,6,function(result){
    console.log("sub result:",result);
})