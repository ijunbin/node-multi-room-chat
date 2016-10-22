import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;

/**
 * Gata服务
 */
class Gate{

    public app;

    private io;

    constructor(app){
        this.app = app;
    }

    public init(){

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