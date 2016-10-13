var fs = require("fs");
import connectorMd = require("./connector")
import connectorProcess = connectorMd.connectorProcess;
/**
 * master 服务
 * 
 * 由master 创建出 connector，chat 服务
 */
class master{

    public config;

    public glo_gate;

    public glo_connectors;
    
    public glo_chats;

    /**配置文件路径 */
    private configPath = "/config/servers.json";


    constructor(){
        this.glo_connectors = [];
        this.glo_chats = [];
    }


    public start(){
        this.readConfig();
        this.initGate();
        this.initConnectors();
        this.initChats();    
    }


    private initGate(){

    }


    /**
     * 初始化connector
     */
    private initConnectors(){
        if(Array.isArray(this.config["connector"])){
            var servers = this.config["connector"];
            for(var i=0;i<servers.length;i++){
                servers[i]
            }
        }
    }

    private initChats(){
        if(Array.isArray(this.config["chat"])){
            var servers = this.config["chat"];
            for(var i=0;i<servers.length;i++){
                this.glo_chats.push(new connectorProcess(servers[i]));
            }
        }
    }

    private readConfig(){
        this.config = JSON.parse(
            fs.readFileSync(this.configPath)
        );    
    }
}

interface chatconfig{
    id:string;
    host:string;
    port:string;
}

interface gateconfig{
    id:string;
    host:string;
    clientPort:number;
}

interface connconfig extends gateconfig{
    port:number;
}