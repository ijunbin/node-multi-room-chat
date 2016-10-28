var reg = /^[a-zA-Z0-9_]+$/;


var callbackId = 0;
var callbacks = {};
var uid,rid;
//进入房间
$("#enterRoom").click(function() {
    
    uid = $("#uid").val();
    rid = $('#tid').val();

    if(uid.length > 20 || uid.length == 0 || rid.length > 20 || rid.length == 0) {
        alert("用户名或房间ID长度不符合要求")
        return false;
    }

    if(!reg.test(uid) || !reg.test(rid)) {
        alert("用户名或房间ID格式错误");
        return false;
    }

    queryEntry(uid,function(host,port){
        //断开与gate的连接 
        socket.disconnect();
        //连接connector
        console.log("connect host: %s ,port:%s",host,port);
        init({
            host:host,
            port:port
        },function(socket){
            console.log("与connector 建立连接");
            var params = {
                username:uid,
                rid:rid
            }
            socket.emit("enter",params);
        }) 
    })
})

function queryEntry(uid, callback) {
    init({
        host:window.location.hostname,
        port:3014
    },function(socket){
        console.log("连接gate 成功！！！");
        //获取connector信息
        callbackId++;
        callbacks[callbackId] = callback;
        var params = {
            cbId:callbackId,
            uid:uid
        }
        socket.emit("enter",params);
    })                    
}


var socket = null;

var init = function(params, cb){

    var host = params.host;
    var port = params.port;

    var url = 'http://' + host;
    if(port) {
      url +=  ':' + port;
    }

    socket = io(url,{'force new connection': true});

    socket.on('connect', function(){
        console.log('socket connected!');
        console.log("socketId:"+socket.id);
        if (cb) {
            cb(socket);
        }
    });

    socket.on('reconnect', function() {
        console.log('reconnect');
    });

    socket.on('message', function(data){
        if(data.cbId && data.host && data.port){
            callbacks[data.cbId](data.host,data.port)
        }else{
            console.log("error:",JSON.stringify(data));    
        }
    });

    //接收推送消息时用 
    socket.on("chat",function(data){
        console.log("收到推送消息");    
    })

    socket.on("enter room",function(data){
        console.log("收到消息 : ",data);
    })

    socket.on('error', function(err) {
        console.log(err);
    });

    socket.on('disconnect', function(reason) {
        console.log('disconnect', reason);
    });
}; 



//显示登陆窗口
var showLogin = function(){
    $('#auth').show();
    $('#chat').hide(true);
}();

