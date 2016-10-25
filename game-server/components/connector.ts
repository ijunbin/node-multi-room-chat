import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;
import gateMd = require("./gate");
var Gate = gateMd.Gate;

/**
 * Connector 抽象类
 */
export class Connector{

    public app;

    public io;

    public gate;


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
    }

    /**
     * 加载组件
     */
    public loadComponent(){
        //sessionServer
        
    }


    /**
     * 
     */
    public initFontendSocket(){
        var self = this;
        var io = require('socket.io')(app.get(Constants.RESERVED.CLIENT_PORT));

        io.on('connection', function(socket){
            
            socket.on('enter', function(msg){

                
            })



            socket.on('disconnect', function () {
                    
            })
        })

        console.log("%s 服务器 正在监听 %d 端口",app.serverId,app.get(Constants.RESERVED.CLIENT_PORT));

        this.io = io;
    }

}
