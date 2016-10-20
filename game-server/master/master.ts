import startMd = require("./starter")
var starter = startMd.Starter;

/**
 * 
 * master 类
 */
export class Master{

    public app;

    constructor(app){
        this.app = app;
    }

    /**
     * 启动master
     */
    public start = function(){
        var app = this.app;
        starter.runServers(app);
    }

    
}