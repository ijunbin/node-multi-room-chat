import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;

/**
 * 
 * 监听推送消息
 */
class Remote{

    public app;

    private io;

    constructor(app){
        
        this.app = app;
    }   


    public start(){

        var self = this;
        var io = require('socket.io')(app.get(Constants.RESERVED.PORT));

        io.on('connection', function(socket){

            socket.on('message', function(msg){


            })

            socket.on('disconnect', function () {


            })
        })
        
        this.io = io;

        console.log("%s 服务器 正在监听 %d 端口",app.serverId,app.get(Constants.RESERVED.PORT));
    }             
}