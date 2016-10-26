

/**
 * 
 * session服务
 */
export class SessionService {


    public uidMap:{[s:string]:Session} = {}  // uid -> session


    constructor(){

    }    

 
    /**
     * 根据Uid获取session
     */
    public getByUid(uid:string):Session{
        return this.uidMap[uid];
    }
}




export class Session {

    /**username */
    public uid:string;

    public rid:string;

    public socket:any;

    public fontendId:string;

    private __sessionService__:SessionService;

    constructor(uid:string,rid:string,socket:any,fontendId:string,service:any){

        this.uid = uid;
        this.rid = rid;
        this.socket = socket;
        this.fontendId = fontendId;
        
        this.setService(service);
    }

    public setService(service){

        this.__sessionService__ = service;

    }

    public bind(uid:string){
        if(!!this.__sessionService__){
            this.__sessionService__.uidMap[uid] = this;
        }
    }
}