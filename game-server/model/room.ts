import _ = require("underscore");
import playerMd = require("./player");
import Player = playerMd.Player;

/**房间类 */
export class Room{

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

   /**
    * 删除房间内用户
    */
   public deleteUser(userId:number){
      delete this.players[userId];   
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

   /**
    * 获取当前房间的人数
    */
   public getUserCount():number{
     return _.keys(this.players).length;
   }
}