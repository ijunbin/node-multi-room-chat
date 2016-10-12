import playerMd = require("../model/player");
import Player = playerMd.Player;

export class SessionServer{

    private static sessionMap:{[key:string]:Player} = {};

    /**
     * 获取session
     */
    public static get(socketId:string):Player{
        if(socketId in SessionServer.sessionMap){
            return SessionServer.sessionMap[socketId];
        }else{
            return null;
        }
    }

    /**
     * 设置session
     */
    public static set(socketId:string,player:Player){
        if(!(socketId in SessionServer.sessionMap)){
            SessionServer.sessionMap[socketId] = player;             
        }
    }

    /**
     * 清除session
     */
    public static clear(socketId:string){
        delete SessionServer.sessionMap[socketId];
    }         
}