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
        this.messageProxy = new MessageProxy(this.app.getServerByType("connector"));
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
        if(! this.channelMap[rid]){
            throw("channel is already exist...");
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
        var sids = channel.getChannelConnectorIds();
        this.messageProxy.pushMessage(sids,rid,msg);                                
    }    

}


/**
 *   一个channel代表一个房间
 */
export class Channel{

     public name:string;

     public groups = {};    // group map for uids. key: sid, value: [uid]

     public userAmount:number = 0;

     private __channelService__;

     constructor(name,service){
         this.name = name;
         this.__channelService__ = service;
         
     }

     /**
      * 获取房间内所有玩家所在的connector id
      */
     public getChannelConnectorIds(){
         return _.keys(this.groups);
     }

     /**
      * 将玩家添加进channel
      */
     public add(uid:string,sid:string){
        if(!this.groups[sid]){
            this.groups[sid] = [];    
        }
        this.groups[sid].push(uid);
        this.userAmount++;
     }

}