var cp = require('child_process');
var util = require('util');

export class Starter{


    /**
     * 创建所有服务
     */
    public static runServers = function(app){
        for(var key in app.serverTypeMaps){
            var servers = app.serverTypeMaps[key];
            if(Array.isArray(servers)){
                for(var i=0;i<servers.length;i++){
                    var server = servers[i];
                    Starter.run(server,key);
                }
            }
        }                              
    }



    public static run(serverInfo,serverType){
        var options:string[] = [];
        if (!!serverInfo.args) {
            if(typeof serverInfo.args === 'string' && serverInfo.port == 4050) {
                // options.push(serverInfo.args.trim());
            }
        }
        options.push(process.argv[1]);
        for(var key in serverInfo){
            options.push(util.format("%s=%s",key,serverInfo[key]));
        }
        options.push(util.format("serverType=%s",serverType));
        Starter.localrun(process.execPath,serverInfo["host"],options);
    }

    /**
     * 创建本地的服务
     */
    public static localrun(cmd,host,options){
        console.log('Executing ' + cmd + ' ' + options + ' locally');
        Starter.spawnProcess(cmd,host,options);
    }


    public static spawnProcess(command,host,options){

        var child = cp.spawn(command, options);

        child.stderr.on('data', function (chunk) {
            var msg = chunk.toString();
            process.stderr.write(msg);
        });

        var prefix = "["+ host +"] ";
        child.stdout.on('data', function (chunk) {
            var msg = prefix + chunk.toString();
            process.stdout.write(msg);
        });
    }
}