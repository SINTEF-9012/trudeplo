

export interface BasicDeviceModel {
    _agent?: any;
    lastSeen?: Date;
    execEnv?: any;
    agent?: any;
    lastOperation?: 'ping' | 'info' | 'load_agent' | 'start_agent' | 'stop_agent';
    lastTried?: Date;
    latestFailMessage?: string;
    latestState?: 'running' | 'disconnected';
    info?: string
}



export interface BasicArtifactModel{
    _instance?: any;
}

export abstract class AbstractAdapter{
    model: BasicDeviceModel = {};
    constructor(model: {agent?: any}){
        this.model = model
    }

    abstract ping(): Promise<boolean>
    abstract _info(): Promise<string>

    async info(){
        let model = this.getModel()
        model.lastOperation = 'info';
        model.lastTried = new Date();
        console.log(`Try to get info from ${(this.getModel() as any)['id']}`)
        try{
            let result = await this._info();
            model.info = result;
            model.lastSeen = new Date();
            return result;
        }
        catch(e: any){
            console.log(e)
            model.latestFailMessage = e.toString()
            return 'not connected'
        }

    }

    /**
     * assign an agent to the device
     * @param agent 
     */
    setAgent(agent:{}){
        this.model['_agent'] = agent
    }

    getAgent(){
        return this.model['_agent'] 
    }

    /**
     * load the agent into device
     */
    abstract loadAgent(): Promise<any>;

    /**
     * start the agent
     */
    abstract runAgent(): Promise<any>;

    abstract stopAgent(): Promise<any>;

    /**
     * Check if the assigned agent is running or not
     */
    abstract isAgentRunning(): Promise<boolean>;

    getModel(){
        return this.model
    }

    getModelString(space?: string){
        let model = this.getModel()
        if(space){
            return JSON.stringify(model, null, space)
        }
        else{
            return JSON.stringify(model)
        }
    }

}

