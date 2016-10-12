"use strict";
var playerMd = require("./model/player");
var Player = playerMd.Player;
var rServerMd = require("./server/roomServer");
var RoomServer = rServerMd.RoomService;
var sServerMd = require("./server/sessionServer");
var SessionServer = sServerMd.SessionServer;
var App = (function () {
    function App() {
        this.socketport = 8888;
        this.io = require('socket.io')(this.socketport);
    }
    App.prototype.start = function () {
        try {
            this.initSocket();
        }
        catch (ex) {
            console.log("启动服务器失败...");
            console.log(ex.stack);
        }
    };
    App.prototype.initSocket = function () {
        console.log("正在启动 socket 服务器...监听 %d 端口", this.socketport);
        var io = this.io;
        io.on('connection', function (socket) {
            console.log(socket.id + " 连接了服务器...");
            socket.on('list room', function () {
                socket.emit('list room', { rooms: RoomServer.getAllRoomInfo() });
            });
            socket.on('join room', function () {
                console.log("收到 join room 协议...");
                var session = SessionServer.get(socket.id);
                socket.join(session.roomId);
                socket.emit('join roomed', { success: true });
                socket.broadcast.in(session.roomId).emit('chat message', "欢迎用户 " + session.uId + " 加入房间");
            });
            socket.on('chat message', function (msg) {
                var info = JSON.parse(msg);
                console.log('chat message', info);
                var session = SessionServer.get(socket.id);
                if (session.roomId) {
                    io.sockets.in(session.roomId).emit('chat message', info.msg);
                }
                else {
                    io.emit('chat message', info.msg);
                }
            });
            socket.on('enter room', function (msg) {
                var result = { success: true };
                var info = JSON.parse(msg);
                console.log("收到玩家 %s 进入房间 %s 协议...", info.userId, info.rid);
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
                        var player = new Player(info.userId, info.rid);
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
                console.log("socketId:" + socket.id);
                var player = SessionServer.get(socket.id);
                console.log("断开连接 ", JSON.stringify(player));
                if (player) {
                    console.log("房间 %s 的玩家 %s 断开连接...", player.roomId, player.uId);
                    var room = RoomServer.getRoom(player.roomId);
                    if (room) {
                        room.deleteUser(player.uId);
                        RoomServer.updateRoom(player.roomId);
                        socket.broadcast.in(player.roomId).emit('chat message', "用户 " + player.uId + " 下线");
                    }
                }
            });
        });
    };
    return App;
}());
var app = new App();
app.start();
