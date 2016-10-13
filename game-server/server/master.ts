var fs = require("fs");
var cp = require("child_process");
import connectorMd = require("./connector")
import connectorProcess = connectorMd.connectorProcess;

/**
 * master 服务
 * 
 * 由master 创建出 connector，chat 服务
 */
class master{

    public config;

    private serverMap:{[key:string]:serverInfo} = {};

    /**配置文件路径 */
    private configPath = "/config/servers.json";


    constructor(){
        
    }


    public start(){
        this.readConfig();
        this.initServers();
        this.generateServerPorcess();
    }


    /**
     * 初始化服务 
     */
    private initServers(){
        var self = this;
        var serverArr = ["gate","connectot","chat"];
        serverArr.forEach(function(element, index, array){
            if(Array.isArray(self.config[element])){
                self.serverMap[element].serverConfig = self.config[element];
            }
        })
    }

    /**
     * 生成服务进程
     */
    public generateServerPorcess(){
        var self = this;
        for(var key in this.serverMap){
            var servers  = this.serverMap[key].serverConfig;
            if(Array.isArray(servers)){
                servers.forEach(function(element,index,array){
                    self.serverMap[element].serverProcess = cp.fork("./"+key,servers[index]);
                })
            }
            cp.fork("./"+key);

        }    
    }


    private readConfig(){
        this.config = JSON.parse(
            fs.readFileSync(this.configPath)
        );    
    }
}


interface serverInfo{
    serverConfig:any[];
    serverProcess:any[];
}