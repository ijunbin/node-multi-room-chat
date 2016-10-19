var fs = require("fs");
import ctsMd = require("../common/constants");
var Constants = ctsMd.Constants;

/**
 * 
 * Application 的工具类
 */
export class appUtil{


    public static parseArgs(argv):any{
        var args = {};
        if(argv.length == 2){
            //mastar 
        }else{
            //other servers
            
        }
        return args;   
    }     

    

    public static defaultConfiguration(app){
        var args = appUtil.parseArgs(process.argv);
        appUtil.loadMaster(app);
        appUtil.loadServers(app);
        appUtil.processArg(app,args);        
    }

    public static loadMaster(app){
        app.master = JSON.parse(
            fs.readFileSync(Constants.FILEPATH.MASTER)
        );    
    }           

    public static loadServers(app){
        var servers = JSON.parse(
            fs.readFileSync(Constants.FILEPATH.SERVER)
        );
        for(var key in servers){
            app.serverTypeMaps[key] = servers[key];                                        
        }
        app.servers = servers;
    }

    public static processArg(app,args){
        var serverType = args.serverType || Constants.RESERVED.MASTER;
        var serverId = args.id || app.getMaster().id;
        var type = args.type || Constants.RESERVED.ALL;

        app.set(Constants.RESERVED.SERVER_TYPE,serverType);
        app.set(Constants.RESERVED.SERVER_ID,serverId);
    }


    /**
     * 安装组件
     */
    public static startUpComponents(app){
        for(var key in app.components){
            var cmp = app.components[key];
            if(typeof cmp["start"] === "function"){
                eval("cmp.start()");
            }
        }                                    
    }

    /**
     * 加载server的组件
     */
    public static loadComponents(app){
        if(app.serverType === Constants.RESERVED.MASTER){
            //加载master组件
            app.load("master"); 
        }else{

        }
    }
}