///<reference path='./definitelyTyped/app.d.ts'/>
import _ = require("underscore");
var io = require('socket.io')(8888);

io.on('connection', function(socket){

  //获取当前所有房间
  socket.on('list room',function(){
    socket.emit('list room',{rooms:RoomService.getAllRoom().toString()});
  });

  //join room 
  socket.on('join room', function(msg) {
    console.log("收到 join room 协议...");
    var info = JSON.parse(msg);
    console.log("info",info);
    socket.join(info.room);
    socket.emit('join roomed',{success:true,room:info.room});
  });

  //发送消息
  socket.on('chat message', function(msg){
    var info = JSON.parse(msg);
    console.log('chat message',info);
    if(info.room){
      //发送到默认namespace下的特定room 
      io.sockets.in(info.room).emit('chat message',info.msg);
    }else{
      //发送到默认namespace下的默认room 
      io.emit('chat message', msg);  
    }
  });

  //进入房间
  socket.on('enter room', function(msg){
      var result = <enterRoomRes>{success:true};
      var info = <enterRoomMsg>JSON.parse(msg);
      console.log("收到玩家 %s 进入房间 %s 协议...",info.userId,info.rid);
      if(!(info.rid && info.userId)){
        result.success = false;
        result.msg = "param invalid";   
      }else{
        var room = RoomService.getRoom(info.rid);
        if(room.checkUserIn(info.userId)){
          result.success = false;
          result.msg = "user be in room";  
        }else{
          room.addUser(new Player(info.userId,info.rid));
          //返回房间所有人
          var players = room.getAllUser();
          var uids = [];
          for(var i=0;i<players.length;i++){
              uids.push(players[i].uId);
          }
          result.users = uids;
          result.userId = info.userId;
          result.rid = info.rid;
        }
      }
      socket.emit('enter roomed',result);
  });


  socket.on('disconnect', function () {
    //如何广播到该socket所在的房间 
    console.log("断开连接...");
    io.emit('user disconnected');
  });

});


/**进入房间协议 */
interface enterRoomMsg{
  userId:number;
  rid:number;  
}

interface enterRoomRes{
  /**进入房间结果 */
  success:boolean;
  msg:string;
  userId:number;
  rid:number;
  /**房间内所有玩家 */
  users:Array<string>;
}


/**玩家类 */
class Player{

  public uId:number;

  public uname:string;

  public roomId:number;

  constructor(userId:number,rid:number){
   this.uId = userId;
   this.roomId = rid;
   this.uname = "";
  }
}

/**房间类 */
class Room{

   /**房间ID */
   public rid:number;

   /**房间内玩家 */
   public players;


   constructor(id:number){
      this.rid = id;
      this.players = {};  
   }

   /**将玩家加入房间 */
   public addUser(user:Player){
     if(!user){
        throw "param invalid";  
     }
     if(!this.players[user.uId]){
        this.players[user.uId] = user;     
     }
   }

   /**检查玩家是否在房间内 */
   public checkUserIn(userId:number):boolean{
     var inRoom = false;
     if(userId && this.players[userId]){
        inRoom = true;  
     }
     return inRoom;
   }

   /**获取房间内所有玩家 */
   public getAllUser():Player[]{
     var players = [];
     for(var key in this.players){
       players.push(this.players[key]);  
     }
     return players;
   }

}

/**房间服务类 */
class RoomService{
  
  /**房间 */
  private static rooms:{[key:string]:Room} = {};


  /**获取某个房间 */
  public static getRoom(roomId:number):Room{
    if(roomId in RoomService.rooms){
        return RoomService.rooms[roomId];
    }else{
        var newRoom = RoomService.addRoom(roomId);
        return newRoom;
    }  
  } 

  /**添加房间 */
  private static addRoom(roomId:number):Room{
      if(!RoomService.rooms[roomId]){
          var room = new Room(roomId);
          RoomService.rooms[roomId] = room;
          return room;          
      }    
  }

  /**获取所有房间 */
  public static getAllRoom():string[]{
      return _.keys(RoomService.rooms);    
  }      
}





