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
        
        this.hangComp();
    }

    /**
     * 挂载组件
     */
    public hangComp(){
        if(this.app.serverType == Constants.RESERVED.GATE){
            this.initGate()                                            
        }else if(this.app.serverType == Constants.RESERVED.CONNECTOR){
            // 如果是connector 服务 挂载面向chat的socket服务
            
        }        
    }  

    /**
     * 创建Gata服务
     */
    public initGate(){

    }

}
