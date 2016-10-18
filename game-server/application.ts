var fs = require("fs");
import appUtilMd = require("./util/appUtil");
var appUtil = appUtilMd.appUtil;

/**
 * Application 类是server的抽象
 */
export class Application{

    public loaded = [];       // loaded component list
    public components = {};   // name -> component map

    // current server info
    public serverId = null;   // current server id
    public serverType = null; // current server type
    public startTime = null; // current server start time


    /**配置文件路径 */
    public FILEPATH = {
        SERVER:"/config/servers.json",
        MASTER:"/config/master.json"
    }
    
    // global server infos
    public master = null;         // master server info
    public servers = {};          // current global server info maps, id -> info
    public serverTypeMaps = {};   // current global type maps, type -> [info]


    constructor(){
                
    }   

    public defaultConfiguration(){

    }

}