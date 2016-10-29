import _ = require("underscore");
import msgProxyMd = require("../../components/messageProxy");
import MessageProxy = msgProxyMd.MessageProxy;

/**
 * 管理所有房间的服务
 */
export class ChannelService{

    public app;

    public channelMap = {};   // channel name(rid) -> channel

    public messageProxy:MessageProxy

    constructor(app){
        this.app = app;
        this.messageProxy = new MessageProxy(this.app);
    }

    /**
     * 获取房间数量
     */
    public getChannelAmount():number{
        return _.keys(this.channelMap).length;
    }

    /**
     *  通过rid 获取房间
     */
    public get(rid:string):Channel{
        return this.channelMap[rid];
    }   

    /**
     *  创建channel
     */
    public create(rid:string):Channel{
        if(!!this.channelMap[rid]){
            console.error("channel is already exist...");
            return this.channelMap[rid];
        }
        var channel = new Channel(rid,this);
        this.channelMap[rid] = channel;
        return channel;
    }

    /**
     * 移除房间
     */
    public remove(rid:string){
        delete this.channelMap[rid];
    }

    /**
     * 推送消息
     */
    public pushMessage(rid,msg){
        var channel = this.get(rid);
        if(!!channel){
            if(msg.rout === "enter room"){
                this.addUser2Msg(channel,msg);                
            }
            var sids = channel.getConnectorIds(msg);
            // console.log("sid:",sids);
            // console.log("routmap: ",msg.routmap);
            this.messageProxy.pushMessage(sids,rid,msg);
        }else{
            console.error("cannot find channel: [ %s ]",rid);
        }
    }    

    /**
     * 添加返回所有玩家字段
     */
    private addUser2Msg(channel,msg){
        var members = channel.getMember();
        var users = [];
        for(var i=0;i<members.length;i++){
            users.push(members[i].split("*")[0]);
        } 
        msg.users = users;
    }
}


/**
 *   一个channel代表一个房间
 */
export class Channel{

     public name:string;

     public groups = {};    // group map for uids. key: sid, value: [uid]

     public records = {};      // member records. key: uid value{sid:,uid:}

     public userAmount:number = 0;

     private __channelService__;

     constructor(name,service){
         this.name = name;
         this.__channelService__ = service;
         
     }
    
     /**
      * 将玩家添加进channel
      */
     public add(uid:string,sid:string){
        if(!this.groups[sid]){
            this.groups[sid] = [];    
        }
        this.groups[sid].push(uid);
        this.records[uid] = {
            uid:uid,
            sid:sid
        }
        this.userAmount++;
     }


     /**
      * 玩家离开 有待完善
      */
     public leave(){

     }

     /**
      * 根据 msg 的 to 字段来获取 sids []
      */
     public getConnectorIds(msg:any):string[]{
         var sids = [];
         if(msg.to === "*"){
            sids = _.keys(this.groups);
         }else{
             msg.routmap = {};
             var sidMap = {};
             //  from sid
             var fromUid = msg.from+"*"+msg.rid;
             var fromsid = this.records[fromUid].sid
             sidMap[fromsid] = [fromUid];
             
             //  to sid
             var toUid = msg.to+"*"+msg.rid;
             var tosid = this.records[toUid].sid
             if(!sidMap[tosid]){
                 sidMap[tosid] = [];
             }
             sidMap[tosid].push(toUid);
             for(var key in sidMap){
                 msg.routmap[key] = sidMap[key];
             }
             sids = _.keys(sidMap);
         }
         return sids;
     }



     /**
      * 获取房间内所有成员
      */
     public getMember():string[]{
        var member = [];
        for(var key in this.groups){
            var group = this.groups[key];
            for(var i=0;i<group.length;i++){
                member.push(group[i]);                
            }
        }
        return member;                             
     }

}