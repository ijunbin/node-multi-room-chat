/**
 * connector 服务
 * 
 */
export class connectorProcess{


    public id;

    public host;

    public port;

    public clientPort;

    public io;

    constructor(config:any){

        this.id = config.id;    
        this.host = config.host;
        this.port = config.port;
        this.clientPort = config.clientPort;

    }


}