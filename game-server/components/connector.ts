import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;
import gateMd = require("./gate");
var Gate = gateMd.Gate;
import ssMd = require("../common/service/sessionService");
import SessionService = ssMd.SessionService
import Session = ssMd.Session;
var socketRpc = require("../rpc-demo/socket-rpc");
var crc = require('crc');
import remoteMd = require("./remote")
import Remote = remoteMd.Remote;

/**
 * Connector 抽象类
 */
export class Connector{

    public app;

    public io;

    public gate;

    public remote;

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
     * 挂载组件
     */
    public hangComp(){
        if(this.app.serverType == Constants.RESERVED.GATE){
            this.initGate();                                            
        }else if(this.app.serverType == Constants.RESERVED.CONNECTOR){
            // 如果是connector 服务 挂载面向chat的socket服务
            this.init();
        }        
    }  

    /**
     * 创建Gate服务
     */
    public initGate(){
        this.gate = new Gate(this.app);
    }

    /**
     * 初始化connector服务器
     */
    public init(){
        this.loadComponent(); 
        this.initFontendSocket();
        this.initRemote();
    }

    /**
     * 加载组件
     */
    public loadComponent(){
        //sessionServer
        this.app.set("sessionService",new SessionService());
    }


    /**
     *  监听客户端的请求
     */
    public initFontendSocket(){
        var self = this;
        var io = require('socket.io')(self.app.get(Constants.RESERVED.CLIENT_PORT));

        io.on('connection', function(socket){
            
            socket.on('enter', function(msg){
                var username = msg.username;
                var rid = msg.rid;
                var fontendId = self.app.serverId;

                var sessionService = this.app.get("sessionService");
                var session = new Session(username,rid,socket,fontendId,sessionService);
                var code = self.entryHandler(msg,session);
                if(code == -1){

                }else{

                }

            })

            socket.on('disconnect', function () {
                    
            })
        })

        console.log("%s 服务器 正在监听 %d 端口",self.app.serverId,self.app.get(Constants.RESERVED.CLIENT_PORT));

        this.io = io;
    }

    /**
     * 
     * 入口handler
     */
    private entryHandler(msg:any,session:Session):number{

        var rid = msg.rid;  
        var uid = msg.username + '*' + rid;

        var sessionService = this.app.get("sessionService");
        if(!!sessionService.getByUid(uid)){
            //已经进入了房间 
            return -1
        }

        //第一次进入房间 
        session.bind(uid);

        //发送rpc调用,通知chat服务器将玩家加入房间
        var chatServr = this.dispatchChat(rid);
        var proxy = socketRpc.connect(chatServr.host,chatServr.port);
        proxy.add(uid, this.app.serverId, rid,function(){
            return 1;
        })
    }


    /**
     * 根据rid 分发聊天服务器
     */
    private dispatchChat(rid:string){
        var servers = this.app.getServerByType(Constants.RESERVED.CHAT);
        var index = Math.abs(crc.crc32(rid)) % servers.length;
	    return servers[index];
    }

    
    public initRemote(){
        this.remote = new Remote(this.app);
        this.remote.start();
    }

}
