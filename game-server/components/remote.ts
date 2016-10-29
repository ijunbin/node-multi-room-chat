import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;

/**
 * 
 * connector 用于监听推送消息 
 */
export class Remote{

    public app;

    private io;

    private router  = {};  //rout -> handler

    constructor(app){
        this.app = app;
        this.router["enter room"] = this.enterRoom;
        this.router["chat"] = this.chat;
        this.router["exit"] = this.exit;
    }
       


    public start(){

        var self = this;
        var io = require('socket.io')(self.app.get(Constants.RESERVED.PORT));

        io.on('connection', function(socket){

            console.log("someone connect to %s remote ",self.app.serverId);

            socket.on('message', function(msg){
                console.log(" %s 收到 message 消息",self.app.serverId);
                if(!!msg.rout){
                    if(typeof self.router[msg.rout] === "function"){
                        var rout = msg.rout;
                        delete msg.rout;
                        self.router[rout].call(self,rout,msg);
                    }else{
                        console.log("unexcept router:"+msg.rout);
                    }
                }else{
                    console.log("cannot find msg router: %s",JSON.stringify(msg));
                }
            })

            socket.on('disconnect', function () {
                console.log("someone disconnect to %s remote ",self.app.serverId);
            })
        })
        
        this.io = io;

        console.log("%s 服务器 正在监听 %d 端口",self.app.serverId,self.app.get(Constants.RESERVED.PORT));
    }

    /**
     * 房间内玩家聊天的handler
     */
    public chat(rout,msg){
        
        var sessionService = this.app.get("sessionService");
        var sessionArr = [];
        if(msg.to === "*"){
            sessionArr = sessionService.getByRid(msg.rid);
            msg.to = "所有人";
        }else{
            var uids = msg.routmap[this.app.serverId];
            console.log("单独推送：uids："+ uids);
            for(var i=0;i<uids.length;i++){
                sessionArr.push(sessionService.getByUid(uids[i]));
            }
        }
        for(var i=0;i<sessionArr.length;i++){
            var socket = sessionArr[i].getSocket();
            socket.emit(rout,msg);
        }    
    }

    /**
     * 广播退出房间
     */
    public exit(rout,msg){
        this.broadcast(rout,msg);            
    }

    /**
     * 广播进入房间
     */
    public enterRoom(rout,msg){
        this.broadcast(rout,msg);
    }

    private broadcast(rout,msg){
        //获取当前房间在当前connector 的所有玩家，并进行广播
        var sessionService = this.app.get("sessionService");
        var sessionArr = sessionService.getByRid(msg.rid);
        for(var i=0;i<sessionArr.length;i++){
            var socket = sessionArr[i].getSocket();
            socket.emit(rout,msg);
        }
    }
}