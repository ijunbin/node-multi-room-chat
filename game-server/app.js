"use strict";
var _ = require("underscore");
var io = require('socket.io')(8888);
io.on('connection', function (socket) {
    socket.on('list room', function () {
        socket.emit('list room', { rooms: RoomService.getAllRoom().toString() });
    });
    socket.on('join room', function (msg) {
        console.log("收到 join room 协议...");
        var info = JSON.parse(msg);
        console.log("info", info);
        socket.join(info.room);
        socket.emit('join roomed', { success: true, room: info.room });
    });
    socket.on('chat message', function (msg) {
        var info = JSON.parse(msg);
        console.log('chat message', info);
        if (info.room) {
            io.sockets.in(info.room).emit('chat message', info.msg);
        }
        else {
            io.emit('chat message', msg);
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
            var room = RoomService.getRoom(info.rid);
            if (room.checkUserIn(info.userId)) {
                result.success = false;
                result.msg = "user be in room";
            }
            else {
                room.addUser(new Player(info.userId, info.rid));
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
        console.log("断开连接...");
        io.emit('user disconnected');
    });
});
var Player = (function () {
    function Player(userId, rid) {
        this.uId = userId;
        this.roomId = rid;
        this.uname = "";
    }
    return Player;
}());
var Room = (function () {
    function Room(id) {
        this.rid = id;
        this.players = {};
    }
    Room.prototype.addUser = function (user) {
        if (!user) {
            throw "param invalid";
        }
        if (!this.players[user.uId]) {
            this.players[user.uId] = user;
        }
    };
    Room.prototype.checkUserIn = function (userId) {
        var inRoom = false;
        if (userId && this.players[userId]) {
            inRoom = true;
        }
        return inRoom;
    };
    Room.prototype.getAllUser = function () {
        var players = [];
        for (var key in this.players) {
            players.push(this.players[key]);
        }
        return players;
    };
    return Room;
}());
var RoomService = (function () {
    function RoomService() {
    }
    RoomService.getRoom = function (roomId) {
        if (roomId in RoomService.rooms) {
            return RoomService.rooms[roomId];
        }
        else {
            var newRoom = RoomService.addRoom(roomId);
            return newRoom;
        }
    };
    RoomService.addRoom = function (roomId) {
        if (!RoomService.rooms[roomId]) {
            var room = new Room(roomId);
            RoomService.rooms[roomId] = room;
            return room;
        }
    };
    RoomService.getAllRoom = function () {
        return _.keys(RoomService.rooms);
    };
    RoomService.rooms = {};
    return RoomService;
}());
