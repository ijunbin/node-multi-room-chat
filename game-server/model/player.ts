/**玩家类 */
export class Player{

  public uId:number;

  public uname:string;

  public roomId:number;

  constructor(userId:number,rid:number){
   this.uId = userId;
   this.roomId = rid;
   this.uname = "";
  }
}

