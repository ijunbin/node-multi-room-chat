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
     * 玩家第一次进入房间的handler
     */
    public enterRoom(rout,msg){
        //获取当前房间在当前connector 的所有玩家，并进行广播
        var sessionService = this.app.get("sessionService");
        var sessionArr = sessionService.getByRid(msg.rid);
        for(var i=0;i<sessionArr.length;i++){
            var socket = sessionArr[i].getSocket();
            socket.emit(rout,msg);
        }
    }

    /**
     * 房间内玩家聊天的handler
     */
    public chat(rout,msg){
        //获取当前房间在当前connector 的所有玩家，并进行广播
        var sessionService = this.app.get("sessionService");
        var sessionArr = sessionService.getByRid(msg.rid);
        for(var i=0;i<sessionArr.length;i++){
            var socket = sessionArr[i].getSocket();
            socket.emit(rout,msg);
        }    
    }

    /**
     * 广播退出房间消息
     */
    public exit(rout,msg){
        //获取当前房间在当前connector 的所有玩家，并进行广播
        console.log("xxxxxxxxxxxxxxx");
        console.log("msg:",JSON.stringify(msg));
        var sessionService = this.app.get("sessionService");
        var sessionArr = sessionService.getByRid(msg.rid);
        for(var i=0;i<sessionArr.length;i++){
            var socket = sessionArr[i].getSocket();
            socket.emit(rout,msg);
        }    
    }
}