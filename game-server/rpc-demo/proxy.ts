
/**
 * RPC 客户端代理类
 */
class Proxy{

    public socket;

    public callbackGenerateId;

    public callbackMap = {};

    constructor(socket){

        this.socket = socket;

        this.init();
    }   


    private init(){

        var self = this;

        this.callbackGenerateId = 0;

        var socket = this.socket;
        socket.on('connect', function(){
            console.log("socket connect...");
        });

        socket.on('invoked', function(data){
            console.log("finish remote process call...");
            console.log("data:",data);
            if(data.success){
                if(data.cbId){
                    var cb = self.callbackMap[data.cbId];
                    if(!!cb && typeof cb === "function"){
                        eval("cb("+data.args+")");
                    }        
                }                
            }else{
                console.log("RPC ERROR:"+data.msg);
            }
        });

        socket.on('disconnect', function(){
            console.log("socket disconnect...");
        });
    }

    /**
     * 生成唯一回调ID
     */
    private generateCallbackId():number{
        this.callbackGenerateId++;
        return this.callbackGenerateId;
    }

    /**
     * 设置回调
     */
    private setCallbackMap(cb):number{
        if(typeof cb === "function"){
            var cbId = this.generateCallbackId();
            this.callbackMap[cbId] = cb;
            return cbId;    
        }
        return -1;
    }



    public add(uid,sid,rid,cb){
        var cbId = this.setCallbackMap(cb);
        var args = {
            // routs:"onAdd",
            uid:uid,
            sid:sid,
            rid:rid
        }
        this.removeInvoke("add",args,cbId);
    }

    /**
     * 远程调用
     */
    public removeInvoke(method,args,cbId){
        var socket = this.socket;
        var msg = {
            method:method,
            args:args,
            callbackId:cbId
        }
        socket.emit('rpc',msg);
    }                 
}

module.exports = Proxy;