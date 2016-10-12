import roomMd = require("../model/room");
import Room = roomMd.Room;


/**房间服务类 */
export class RoomService{
  
  /**房间 */
  private static roomMap:{[key:number]:Room} = {};


  /**
   * 获取或者添加房间
   */
  public static getOrAddRoom(rId:number):Room{
      var room  = RoomService.getRoom(rId);
      if(!room){
          room = RoomService.addRoom(rId);
      }
      return room;
  }

  /**获取某个房间 */
  public static getRoom(roomId:number):Room{
    if(roomId in RoomService.roomMap){
        return RoomService.roomMap[roomId];
    }else{
        return null;
    }  
  } 

  /**添加房间 */
  private static addRoom(roomId:number):Room{
      if(!RoomService.roomMap[roomId]){
          var room = new Room(roomId);
          RoomService.roomMap[roomId] = room;
          return room;          
      }    
  }

  /**获取房间信息 */
  public static getAllRoomInfo():{[key:string]:number}{
      var rInfo = <any>{};
      for(var key in RoomService.roomMap){
         rInfo[key] = RoomService.roomMap[key].getUserCount();  
      }
      return rInfo;    
  }

  /**
   * 当房间内的人数为0时，删除房间
   */
  public static updateRoom(rId:number){
     var room = RoomService.getRoom(rId);
     if(room && room.getUserCount() == 0){
        RoomService.deleteRoom(rId)    
     }    
  }

  /**
   * 删除房间
   */
  private static deleteRoom(rId:number){
    delete RoomService.roomMap[rId];  
  }
}