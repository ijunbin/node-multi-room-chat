var socketRpc = require("./socket-rpc");


var server = new socketRpc({
    add:function(x,y){
        return x+y;
    },
    sub:function(x,y){
        return x-y;
    }
}).listen(6550);
