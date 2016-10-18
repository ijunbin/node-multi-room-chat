

var PROCESS_PRRAM_ERROR = "gate server start error param invalid";


class Gate{

    public id:string;

    public host:string;

    public clientPort:number;

    constructor(id:string,host:string,clientPort:number){
        this.id = id;
        this.host = host;
        this.clientPort = clientPort;
    }

    public io; 

    public start(){
        this.io = require('socket.io')(this.clientPort);
        this.initSocket();
    }

    public initSocket(){
        var io = this.io;

        io.on('connection', function(socket){

        
            socket.on('disconnect', function () {
            })

            socket.on("message",function(msg){

            })
        })
    }
}


if(process.argv.length != 3){
    throw(PROCESS_PRRAM_ERROR);        
}
var config = JSON.parse(process.argv[2]);
var myGate = new Gate(config.id,config.host,config.clientPort);
myGate.start();
