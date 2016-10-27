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
            // 将玩家添加进房间
            var args = arg.split(",");
            var uid = args[0];
            var sid = args[1]; 
            var rid = args[2];
            console.log("uid %s sid: %s,rid %s ",uid.sid,rid);
            console.log("%s 收到玩家进入房间信息...",self.app.serverId);
            var channelService = <ChannelService>self.app.get("channelService");
            var channel = <Channel>channelService.get(rid);
            if(!channel){
                channel = channelService.create(rid);
            }
            channel.add(uid,sid);
            //广播信息给同一房间的玩家
            var msg = {
                rout:"enter room",
                from:uid.split("*")[0],
                to:"*"                    
            };
            console.log("广播消息："+JSON.stringify(msg));
            channelService.pushMessage(rid,msg);
        })


    }
}