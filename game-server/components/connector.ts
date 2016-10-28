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

    public proxyMap = {};   // sid -> proxy

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
        this.initRpcClientProxy();
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
                console.log("%s 收到 进入房间 message: %s ",self.app.serverId,JSON.stringify(msg));
                var uname = msg.uname;
                var rid = msg.rid;
                var fontendId = self.app.serverId;

                var sessionService = self.app.get("sessionService");
                var session = new Session(uname,rid,socket,fontendId,sessionService);
                var code = self.entryHandler(msg,session);
                if(code == -1){
                    // 已经在房间的逻辑有待完善
                    socket.emit("error","玩家已经在房间内...");
                }
            })

            // 处理玩家聊天逻辑
            socket.on("chat",function(msg){
                msg = JSON.parse(msg);
                var uid = msg.from + '*' + msg.rid;
                var sessionService = self.app.get("sessionService");
                var session = sessionService.getByUid(uid);
                self.chatHandler(msg,session);
            })

            // 处理玩家退出房间逻辑
            socket.on('disconnect', function () {
                console.log("客户端 %s 断开了连接...退出房间",socket.id); 
            })
        })

        console.log("%s 服务器 正在监听 %d 端口",self.app.serverId,self.app.get(Constants.RESERVED.CLIENT_PORT));

        this.io = io;
    }

    /**
     * 初始化经常rpc调用的代理
     */
    private initRpcClientProxy(){
        var app = this.app;
        var chatServers = app.getServerByType(Constants.RESERVED.CHAT);
        for(var i=0; i<chatServers.length;i++){
            var host = chatServers[i].host;
            var port = chatServers[i].port;
            var proxy = socketRpc.connect(host,port);
            this.proxyMap[chatServers[i].id] = proxy;
        }
    }

    /**
     * 
     * 入口handler
     */
    private entryHandler(msg:any,session:Session):number{

        console.log("将玩家加入房间...");
        var rid = msg.rid;  
        var uid = msg.uname + '*' + rid;

        var sessionService = this.app.get("sessionService");
        if(!!sessionService.getByUid(uid)){
            //已经进入了房间 
            return -1
        }

        //第一次进入房间 
        session.bind(uid);

        //发送rpc调用,通知chat服务器将玩家加入房间
        var chatSid = this.dispatchChat(rid);
        var proxy = this.proxyMap[chatSid];
        proxy.add(msg.uname, this.app.serverId,rid,function(){
            return 1;
        })
    }

    /**
     * 处理客户端的chat消息
     */
    private chatHandler(msg:any,session:Session){
        console.log("收到玩家 [ %s ] 消息：%s",msg.from,msg);
        var proxy = this.proxyMap[this.dispatchChat(msg.rid)];
        proxy.chat(msg,this.app.serverId);
    }

    /**
     * 根据rid 分发聊天服务器
     */
    private dispatchChat(rid:string):string{
        var servers = this.app.getServerByType(Constants.RESERVED.CHAT);
        var index = Math.abs(crc.crc32(rid)) % servers.length;
	    return servers[index].id;
    }

    
    public initRemote(){
        this.remote = new Remote(this.app);
        this.remote.start();
    }

}
