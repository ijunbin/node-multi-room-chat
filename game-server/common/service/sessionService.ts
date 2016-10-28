

/**
 * 
 * session服务
 */
export class SessionService {


    public uidMap:{[s:string]:Session} = {}  // uid -> session

    public ridMap:{[s:string]:string[]} = {};  //rid -> uids

    constructor(){

    }    

    
    /**
     * 根据 rid 获取sessions 
     */
    public getByRid(rid:string):Session[]{
        var sessionArr = [];
        var uidArr = this.ridMap[rid];
        for(var i=0;i<uidArr.length;i++){
            var session = this.getByUid(uidArr[i]);
            if(!!session){
                sessionArr.push(session);
            }
        }
        return sessionArr;
    }

    /**
     * 根据uid (uname*rid)获取session
     */
    public getByUid(uid:string):Session{
        return this.uidMap[uid];
    }
}




export class Session {

    /**username */
    public uname:string;

    public rid:string;

    private socket:any;

    public fontendId:string;

    private __sessionService__:SessionService;

    constructor(uname:string,rid:string,socket:any,fontendId:string,service:any){

        this.uname = uname;
        this.rid = rid;
        this.socket = socket;
        this.fontendId = fontendId;
        
        this.setService(service);
    }

    public setService(service){

        this.__sessionService__ = service;

    }

    public getSocket():any{
        return this.socket;
    }

    public bind(uid:string){
        if(!!this.__sessionService__){
            this.__sessionService__.uidMap[uid] = this;
            var rid = this.rid;  
            if(!this.__sessionService__.ridMap[rid]){
                this.__sessionService__.ridMap[rid] = [];
            }
            this.__sessionService__.ridMap[rid].push(uid); 
        }
    }
}