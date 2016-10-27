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
        this.router["chat"] = this.enterRoom;
    }   


    public start(){

        var self = this;
        var io = require('socket.io')(self.app.get(Constants.RESERVED.PORT));

        io.on('connection', function(socket){

            console.log("someont connect to %s remote ",self.app.serverId);

            socket.on('message', function(msg){
                if(!!msg.rout){
                    if(typeof this.router[msg.rout] === "function"){
                        var sessionService = self.app.get("sessionService");
                        var session = sessionService.getByUid(msg.uid);
                        var rout = msg.rout;
                        delete msg.rout;
                        this.router[msg.rout](rout,msg,session);
                    }else{
                        console.log("unexcept router:"+msg.rout);
                    }
                }else{
                    console.log("cannot find msg router: %s",JSON.stringify(msg));
                }
            })

            socket.on('disconnect', function () {
                console.log("someont disconnect to %s remote ",self.app.serverId);
            })
        })
        
        this.io = io;

        console.log("%s 服务器 正在监听 %d 端口",self.app.serverId,self.app.get(Constants.RESERVED.PORT));
    }


    /**
     * 玩家第一次进入房间的handler
     */
    public enterRoom(rout,msg,session){
        //获取当前房间在当前connector 的所有玩家，并进行广播
        var sessionService = this.app.get("sessionService");
        var sessionArr = sessionService.getByRid(session.rid);
        for(var i=0;i<sessionArr.length;i++){
            var socket = sessionArr[i].getSocket();
            socket.emit(rout,msg);
        }
    }

    /**
     * 房间内玩家聊天的handler
     */
    public chat(rout,msg,session){

    }
}