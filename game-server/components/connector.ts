import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;

/**
 * Connector 抽象类
 */
export class Connector{

    public app;

    public io;

    constructor(app){
        this.app = app;
    }

    /**
     * 服务器启动
     */
    public start(){
        
        this.initIo();
        // 如果是connector 服务 挂载rpc服务
        if(this.app.serverType == Constants.RESERVED.CONNECTOR){
            this.initRpcComponent();
        }
        
    }

    public initIo(){
        var app = this.app;

        var io = require('socket.io')(app.get(Constants.RESERVED.CLIENT_PORT));
        io.on('connection', function(socket){
            

            socket.on('message', function(msg){

            })

            socket.on('disconnect', function () {

            })
        })

        this.io = io;
    }

    /**
     * 
     * 挂载远程服务
     */
    public initRpcComponent(){

    } 
}
