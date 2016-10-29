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
                addMessage("欢迎 "+data.from+" 进入房间");
            }
            appendUsers(data.users);
        }
    })

    socket.on("exit",function(data){
        console.log("收到退出房间消息 : ",data);
        if(!!data.uname){
            addMessage(data.uname+" 退出房间")
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
    $('#name').html(uname);
    $('#room').html(rid);
}

/**
 *  添加玩家
 */
var appendUsers = function(users){
    if(!users){
        return;
    }
    $("#usersList").empty();
    var alluserElement = $(document.createElement("option"));
    alluserElement.attr("value","*");
    alluserElement.text("所有人");
    $("#usersList").append(alluserElement);
    for(var i = 0; i < users.length; i++) {
        var slElement = $(document.createElement("option"));
        slElement.attr("value", users[i]);
        slElement.text(users[i]);
        $("#usersList").append(slElement);
    }
}