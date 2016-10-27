import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;
var crc = require('crc');

/**
 * Gata服务
 */
export class Gate{

    public app;

    private io;

    constructor(app){
        this.app = app;
        this.initFrontend();
    }


    public initFrontend(){

        var self = this;
        var io = require('socket.io')(self.app.get(Constants.RESERVED.CLIENT_PORT));

        io.on('connection', function(socket){
            
            socket.on('enter', function(msg){
                console.log("%s 收到 enter message: %s ",self.app.serverId,JSON.stringify(msg));
                //选择一个connector 返回host 和 post
                var oneConnector = self.dispatchConnector(msg.uid);
                var param = {
                    cbId:msg.cbId,
                    host:oneConnector.host,
                    port:oneConnector.clientPort
                }
                socket.send(param);
            })

            socket.on('disconnect', function () {
                    
            })
        })

        console.log("%s 服务器 正在监听 %d 端口",self.app.serverId,self.app.get(Constants.RESERVED.CLIENT_PORT));

        this.io = io;
    }


    private dispatchConnector(uid){
        var connectors = this.app.getServerByType(Constants.RESERVED.CONNECTOR);
        var index = Math.abs(crc.crc32(uid)) % connectors.length;
	    return connectors[index];
    }
}
