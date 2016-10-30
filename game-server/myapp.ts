import appMd = require("./application");
import Application = appMd.Application;

class MyApp{
    
    public app:Application;


    constructor(){                
    }


    public createApp(){
        var app = new Application();
        app.init();
        this.app = app;
    }
    
}


var myapp = new MyApp()
myapp.createApp();
myapp.app.start();


process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});

