var reg = /^[a-zA-Z0-9_]+$/;


var callbackId = 0;
var callbacks = {};
var uname,rid;

$('form').submit(function(){
    var data = {
        from:uname,
        rid:rid,
        to:$("#usersList").val(),
        content:$('#m').val()
    }
    socket.emit('chat', JSON.stringify(data));
    $('#m').val('');
    return false;
});

var addMessage = function(msg){
    // var senddate = new Date();
    // senddate.setTime(data.timestamp * 1000);
    // var time = senddate.format('yyyy-MM-dd h:m:s');
    // $('#messages').append($('<li>').text("("+time+")  "+msg));
    $('#messages').append($('<li>').text(msg));        
}


//进入房间
$("#enterRoom").click(function() {
    
    uname = $("#uname").val();
    rid = $('#tid').val();

    if(uname.length > 20 || uname.length == 0 || rid.length > 20 || rid.length == 0) {
        alert("用户名或房间ID长度不符合要求")
        return false;
    }

    if(!reg.test(uname) || !reg.test(rid)) {
        alert("用户名或房间ID格式错误");
        return false;
    }

    queryEntry(uname,function(host,port){
        //断开与gate的连接 
        socket.disconnect();
        //连接connector
        init({
            host:host,
            port:port
        },function(socket){
            var params = {
                uname:uname,
                rid:rid
            }
            socket.emit("enter",params);
        }) 
    })
})

function queryEntry(uname, callback) {
    init({
        host:window.location.hostname,
        port:3014
    },function(socket){
        //获取connector信息
        callbackId++;
        callbacks[callbackId] = callback;
        var params = {
            cbId:callbackId,
            uname:uname
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
        if (cb) {
            cb(socket);
        }
    });

    socket.on('reconnect', function() {
        console.log('reconnect');
    });

    // 返回connector的host与port
    socket.on('message', function(data){
        if(data.cbId && data.host && data.port){
            callbacks[data.cbId](data.host,data.port)
        }else{
            console.log("error:",JSON.stringify(data));    
        }
    });

    //  接收推送消息时用
    socket.on("chat",function(data){
        console.log("收到聊天消息:",data);
        var msg = data.from+" 对 "+data.to+" : "+data.content;
        addMessage(msg);
    })

    // 玩家进入房间
    socket.on("enter room",function(data){
        showChat();
        console.log("收到进入房间消息 : ",data);
        if(!!data.from){
            var username = data.from; 
            if(username == uname){
                addMessage("欢迎您进入房间: "+data.rid);
            }else{
                addMessage("欢迎"+data.from+"进入房间");
            }
        }
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
    $('#dialog').show();
    $('#chat').hide(true);
}();

//显示聊天室
var showChat = function(){
    $('#chat').show();
    $('#dialog').hide(true);
}

Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}