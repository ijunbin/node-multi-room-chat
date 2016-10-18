import appUtilMd = require("./util/appUtil");
var appUtil = appUtilMd.appUtil;
import ctsMd = require("./common/constants");
var Constants = ctsMd.Constants;
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

    // global server infos
    public master = null;         // master server info
    public servers = {};          // current global server info maps, id -> info
    public serverTypeMaps = {};   // current global type maps, type -> [info]


    constructor(){
                
    }   

    /**
     * init Application
     */
    public init(){
        appUtil.defaultConfiguration(this);
        this.startTime = moment().unix();      
    }


    public getMaster():any{
        return this.master;
    }

    public set(key,value){
        this[key] = value;
    }


    /**
     * start Application
     */
    public start(){
        this.startTime = Date.now();
        
    }
}