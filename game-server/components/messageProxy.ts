
/**
 * chat to connector proxy
 */
export class MessageProxy{

    public socketMap = {}   //connector's serverId -> socket.io-client  

    constructor(connectors){

        if(!!connectors){
            for(var i=0;i<connectors.length;i++){
                this.addServer(connectors[i]);
            }                        
        }
    }


    /**
     * 添加服务器
     */
    public addServer(connector){
        if(!connector.host || !connector.port || !connector.id){
            console.error("connector server config error : ",connector);
            return;
        }

        var host = connector.host;
        var port = connector.port;
        var socket = require('socket.io-client')('http://'+host+":"+port);

        socket.on('connect', function(){
            console.log("socket connect...");
        });

        socket.on('message', function(data){
            
        });

        socket.on('disconnect', function(){
            console.log("socket disconnect...");
        });

        this.socketMap[connector.id] = socket;
    }


    /**
     * 通过connector server id 获取chat服务器与之对应的socket
     */
    private getSocketByConnectorId(sid:string):any{
        return this.socketMap[sid];
    }

    /**
     * 推送消息给connector
     * 
     * @param  {string[]} sids   connector服务器 id 数组
     * @param  {string} rid      rid  channel id   
     */
    public pushMessage(sids:string[],rid:string,msg:any){
        for(var i=0;i<sids.length;i++){
            var socket = this.getSocketByConnectorId(sids[i]);
            if(!!socket){
                console.log("触发客户端onchat...");
                socket.emit("chat",msg);
            } 
        }        
    }
}