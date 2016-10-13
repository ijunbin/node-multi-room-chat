var reg = /^[a-zA-Z0-9_]+$/;

var socket = io("http://127.0.0.1:8888",{'force new connection': true});
//当前我的Id
var myId = 0;
$('form').submit(function(){
    var data = {
        from:myId,
        to:$("#usersList").val(),
        msg:$('#m').val()
    }
    socket.emit('chat message', JSON.stringify(data));
    $('#m').val('');
    return false;
});


socket.on('chat message', function(data){
    // data = JSON.parse(data);

    var senddate = new Date();
    senddate.setTime(data.timestamp * 1000);
    var time = senddate.format('yyyy-MM-dd h:m:s');
    $('#messages').append($('<li>').text("("+time+")  "+data.from+" 对 "+data.to+" : "+data.msg));
});

/**新玩家进入房间 */
socket.on('add user', function(data){
    data = JSON.parse(data);
    $('#messages').append($('<li>').text(data.msg));
    var slElement = $(document.createElement("option"));
    slElement.attr("value",data.user);
    slElement.text(data.user);
    $("#usersList").append(slElement);
});

socket.on('list room', function(data) {
    console.log(data);
    showRoom(data.rooms);
});

socket.on('enter roomed',function(data){
    if(data.success){
        socket.emit('join room');
    }else{
       alert(data.msg); 
    }
});

socket.on('join roomed',function(data){
    if(data.success){
        showChat(data);    
    }else{
       alert(data.msg); 
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

var showRoom = function(rInfo){
    $('#dialog').show();
    $('#auth').hide(true);
    $('#chat').hide(true);    
    if(rInfo && Object.getOwnPropertyNames(rInfo).length > 0){
        //显示所有房间
        $('#roomtip').html("房间列表：");
        var wrap = null;
        var i = 0;
        for(var key in rInfo){
            if(i%3 == 0){
                wrap = $('<div></div>');
                wrap.appendTo($('#rooms'));  
            }
            var childdiv =$('<div></div>').html(key+" (人数："+rInfo[key]+")");
            childdiv.addClass('mcel');
            childdiv.appendTo(wrap);
            i++;                 
        }
    }else{
        $('#roomtip').html("房间列表为空");
    }
}

var showAuth = function(){
    $('#auth').show();
}

var showChat = function(data){
    $('#dialog').hide(true);
    $('#auth').hide(true);
    if(data){
        //缓存myId 
        myId = data.name;    
        $('#name').html(data.name);
        $('#curroom').html(data.room);
        var users = data.users;
        for(var i = 0; i < users.length; i++) {
            var slElement = $(document.createElement("option"));
            slElement.attr("value", users[i]);
            slElement.text(users[i]);
            $("#usersList").append(slElement);
        }
    }
    $('#chat').show();
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