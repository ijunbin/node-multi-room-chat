
/**玩家类 */
export class Player{

  /**
   * user id
   */
  public uId:number;

  /**
   * user name
   */
  public uname:string;

  /**
   * room id
   */
  public roomId:number;

  /**
   * socket id
   */
  public socketId:string;


  constructor(userId:number,rid:number,sId:string){
    this.uId = userId;
    this.roomId = rid;
    this.uname = "";
    this.socketId = sId;
  }
  
}

