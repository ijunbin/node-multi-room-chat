"use strict";
var playerMd = require("./model/player");
var Player = playerMd.Player;
var rServiceMd = require("./service/roomService");
var RoomServer = rServiceMd.RoomService;
var sServiceMd = require("./service/sessionService");
var SessionServer = sServiceMd.SessionService;
var moment = require("moment");
var App = (function () {
    function App() {
        this.socketport = 8888;
    }
    App.prototype.start = function () {
        try {
            this.io = require('socket.io')(this.socketport);
            this.initSocket();
            console.log("socket 服务器启动完毕 监听 %d 端口", this.socketport);
        }
        catch (ex) {
            console.log("启动服务器失败...");
            console.log(ex.stack);
        }
    };
    App.prototype.initSocket = function () {
        var io = this.io;
        io.on('connection', function (socket) {
            socket.on('list room', function () {
                socket.emit('list room', { rooms: RoomServer.getAllRoomInfo() });
            });
            socket.on('join room', function () {
                var session = SessionServer.get(socket.id);
                socket.join(session.roomId);
                var room = RoomServer.getRoom(session.roomId);
                if (!room) {
                    socket.emit('join roomed', { success: false, msg: "eror 505" });
                }
                else {
                    var ids = [];
                    var users = room.getAllUser();
                    for (var i = 0; i < users.length; i++) {
                        ids.push(users[i].uId);
                    }
                    socket.emit('join roomed', { success: true, name: session.uId, room: session.roomId, users: ids });
                    var data = {
                        user: session.uId,
                        msg: "欢迎用户 " + session.uId + " 加入房间"
                    };
                    socket.broadcast.in(session.roomId).emit('add user', JSON.stringify(data));
                    console.log("玩家 %s 进入了房间 %s ...", session.uId, session.roomId);
                }
            });
            socket.on('chat message', function (msg) {
                var info = JSON.parse(msg);
                console.log('chat message', info);
                var session = SessionServer.get(socket.id);
                var data = {
                    from: info.from,
                    to: info.to,
                    msg: info.msg,
                    timestamp: moment().unix()
                };
                if (info.to == "*") {
                    data.to = "所有人";
                    if (session.roomId) {
                        io.sockets.in(session.roomId).emit('chat message', data);
                    }
                    else {
                        io.emit('chat message', data);
                    }
                }
                else {
                    var room = RoomServer.getRoom(session.roomId);
                    if (room) {
                        var player = room.getUser(info.to);
                        if (player) {
                            io.to(player.socketId).emit("chat message", data);
                        }
                    }
                }
            });
            socket.on('enter room', function (msg) {
                var result = { success: true };
                var info = JSON.parse(msg);
                if (!(info.rid && info.userId)) {
                    result.success = false;
                    result.msg = "param invalid";
                }
                else {
                    var room = RoomServer.getOrAddRoom(info.rid);
                    if (room.checkUserIn(info.userId)) {
                        result.success = false;
                        result.msg = "该玩家已经在房间内，请使用其他用户名";
                    }
                    else {
                        var player = new Player(info.userId, info.rid, socket.id);
                        room.addUser(player);
                        SessionServer.set(socket.id, player);
                        var players = room.getAllUser();
                        var uids = [];
                        for (var i = 0; i < players.length; i++) {
                            uids.push(players[i].uId);
                        }
                        result.users = uids;
                        result.userId = info.userId;
                        result.rid = info.rid;
                    }
                }
                socket.emit('enter roomed', result);
            });
            socket.on('disconnect', function () {
                var player = SessionServer.get(socket.id);
                if (player) {
                    console.log("房间 %s 的玩家 %s 断开连接..", player.roomId, player.uId);
                    var room = RoomServer.getRoom(player.roomId);
                    if (room) {
                        room.deleteUser(player.uId);
                        RoomServer.updateRoom(player.roomId);
                        socket.broadcast.in(player.roomId).emit('chat message', "用户 " + player.uId + " 下线");
                        socket.leave(player.roomId);
                    }
                }
            });
        });
    };
    return App;
}());
var app = new App();
app.start();
process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});
