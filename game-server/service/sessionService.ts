import playerMd = require("../model/player");
import Player = playerMd.Player;

export class SessionService{

    private static sessionMap:{[key:string]:Player} = {};

    /**
     * 获取session
     */
    public static get(socketId:string):Player{
        if(socketId in SessionService.sessionMap){
            return SessionService.sessionMap[socketId];
        }else{
            return null;
        }
    }

    /**
     * 设置session
     */
    public static set(socketId:string,player:Player){
        if(!(socketId in SessionService.sessionMap)){
            SessionService.sessionMap[socketId] = player;             
        }
    }

    /**
     * 清除session
     */
    public static clear(socketId:string){
        delete SessionService.sessionMap[socketId];
    }         
}