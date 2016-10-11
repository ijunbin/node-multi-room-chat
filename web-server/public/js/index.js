var reg = /^[a-zA-Z0-9_]+$/;


var socket = io("http://localhost:8888",{'force new connection': true});
var roomId = -1;
$('form').submit(function(){
    var data = {
        room:roomId,
        msg:$('#m').val()
    }
    socket.emit('chat message', JSON.stringify(data));
    $('#m').val('');
    return false;
});

socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
});

socket.on('list room', function(data) {
    var rooms = [];
    if(data.rooms.indexOf(",") > 0){
        rooms = data.rooms.split(",");
    }
    showRoom(rooms);
});

socket.on('enter roomed',function(data){
    if(data.success){
        socket.emit('join room',JSON.stringify({room:data.rid}));
    }else{
       alert(data.msg); 
    }
});

socket.on('join roomed',function(data){
    if(data.success){
        roomId = data.room;
        showChat();    
    }               
});


socket.on('connect', function() { 
    console.log('连接成功...');
    //主动获取房间列表 
    socket.emit('list room');
});
socket.on("disconnect",function(){
    console.log("连接已断开...");
})

$("#enterRoom").click(function(event) {
    username = $("#uid").val();
    rid = $('#tid').val();

    if(username.length > 20 || username.length == 0 || rid.length > 20 || rid.length == 0) {
        alert("用户名或房间ID长度不符合要求")
        return false;
    }

    if(!reg.test(username) || !reg.test(rid)) {
        alert("用户名或房间ID格式错误");
        return false;
    }

    var param = {
        userId:username,
        rid:rid
    }

    socket.emit('enter room',JSON.stringify(param));
})


$("#createRoom").click(function(event) {
    showAuth();    
})

var showRoom = function(rooms){
    $('#dialog').show();
    $('#auth').hide(true);
    $('#chat').hide(true);    
    if(rooms && rooms.length > 0){
        //显示所有房间
        $('#roomtip').html("房间列表：");
        var wrap = null;
        for(var i=0;i<rooms.length;i++){
            if(i%3 == 0){
                wrap = $('<div></div>');
                wrap.appendTo($('#rooms'));  
            }
            var childdiv =$('<div></div>').html(rooms[i]);
            childdiv.addClass('mcel');
            childdiv.appendTo(wrap);                 
        }
    }else{
        $('#roomtip').html("房间列表为空");
    }
}

var showAuth = function(){
    $('#auth').show();
}

var showChat = function(){
    $('#dialog').hide(true);
    $('#auth').hide(true);
    $('#chat').show();     
}
