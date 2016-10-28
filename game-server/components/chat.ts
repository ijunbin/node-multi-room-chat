import cnService = require("../common/service/channelService")
import ChannelService = cnService.ChannelService;
import Channel = cnService.Channel;
var socketRpc = require("../rpc-demo/socket-rpc");

export class Chat{

    public app;
    
    constructor(app){
        this.app = app;
    }


    /**
     * 服务器启动
     */
    public start(){

        this.hangComp();
    }

    /**
     * 挂载必要的组件
     */
    public hangComp(){

        // channelService 
        this.initChannelService();
        // rpc service
        this.initRpcService();
    }

    public initChannelService(){
        this.app.set("channelService",new ChannelService(this.app));
    }

    public initRpcService(){
        var self =  this;
        var port = self.app.getServerById(self.app.serverId).port;
        var server = new socketRpc().listen(port);

        server.handler("add",function(arg){
            self.onAdd.apply(self,arg);
        });

        server.handler("chat",function(arg){
            self.onChat.apply(self,arg);
        })

        server.handler("exit",function(arg){
            self.onExit.apply(self,arg);
        })
    }

    // 将玩家添加进房间
    public onAdd = function(uname,sid,rid){
        console.log("%s 收到玩家 %s 进入房间信息...",this.app.serverId,uname);
        var channelService = <ChannelService>this.app.get("channelService");
        var channel = <Channel>channelService.get(rid);
        if(!channel){
            channel = channelService.create(rid);
        }
        channel.add(uname+"*"+rid,sid);
        //广播信息给同一房间的玩家
        var msg = {
            rout:"enter room",
            from:uname,
            rid:rid,
            to:"*"                    
        };
        console.log("广播消息："+JSON.stringify(msg));
        channelService.pushMessage(rid,msg);
    }


    //  推送玩家消息 
    public onChat = function(msg,sid){
        msg = JSON.parse(msg);
        console.log("%s 收到玩家 %s 聊天信息...",this.app.serverId,msg.from);
        msg.rout = "chat";
        var channelService = <ChannelService>this.app.get("channelService");
        channelService.pushMessage(msg.rid,msg);
    }

    /**
     * 玩家退出房间
     */
    public onExit(uname,sid,rid){
        var msg = {
            rout:"exit",
            uname:uname,
            sid:sid,
            rid:rid
        }
        var channelService = <ChannelService>this.app.get("channelService");
        channelService.pushMessage(rid,msg);
    }
}