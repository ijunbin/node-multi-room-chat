import proxyMd = require("./Proxy");
var Proxy = proxyMd.Proxy;

/**
 * 简单版的socketRpc框架
 */
class SocketRpc{

    public rpcServer;

    public wrapper;

    public port;

    constructor(wrapper){
        if(wrapper instanceof Object){
            this.wrapper = wrapper;
        }                        
    }


    public listen(port:number){
        if(!port){
            return;
        }
        this.port = port;
        this.initServer(port);
    }


    private initServer(port:number){
        var self = this;
        var io = require('socket.io')(port);
        io.on('connection', function(socket){
            
            socket.on('message', function (msg) {

            })

            socket.on('rpc', function (msg) {
                if(msg && msg.method){
                    if(msg.method in self.wrapper){
                        var fun = self.wrapper[msg.method];
                        if(typeof fun  === "function"){
                            var arg = self.parseParam(msg.args);
                            var result = eval("fun("+arg+")");
                            var data = {
                                cbId:msg.cbId,
                                args:""+result+""
                            }
                            socket.emit("invoked",data);
                        }        
                    }    
                }    
            })
            
            socket.on('disconnect', function () {

            })            
        })
    }

    /**
     * 解析参数
     */
    private parseParam(args):string{
        var arg = []
        for(var key in args){
            arg.push(args[key]); 
        }
        return arg.toString();
    }


    private isRpcServer():boolean{
        return !!this.port;
    }


//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------


    public static connect(host:string,port:number,cb){
        if(!host || !port){
            throw("invaild param...");
        }
        this.initClient(host,port);        
    }

    private static initClient(host:string,port:number){

        var socket = require('socket.io-client')('http://'+host+":"+port);
        var proxy = new Proxy(socket);
        return proxy;
    }
}