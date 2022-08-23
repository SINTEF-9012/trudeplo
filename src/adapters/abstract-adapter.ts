

type OperationName = 'ping' | 'info' | 'load_agent' | 'start_agent' | 'stop_agent';

type DeviceState = 'created' | 'connected' | 'disconnected';

export interface BasicDeviceModel {
    _agent?: any;
    lastSeen?: Date;
    execEnv?: any;
    agent?: any;
    lastOperation?: OperationName;
    lastTried?: Date;
    latestFailMessage?: string;
    latestState?: DeviceState;
    info?: string;
    arch?: string;
}

export interface BasicArtifactModel{
    _instance?: any;
}

export abstract class AbstractAdapter{
    model: BasicDeviceModel = {};
    constructor(model: {agent?: any}){
        this.model = model
        this.model.latestState = 'created'
    }

    abstract _ping(): Promise<boolean>
    abstract _info(): Promise<string>

    async launchOperation(operation: OperationName){
        let model = this.getModel()
        model.lastOperation = operation;
        model.lastTried = new Date();
        try{
            let result: any = undefined
            switch(operation){
                case 'info': {
                    result = await this._info();
                    model.info = result;
                }
                case 'ping': {
                    result = await this._ping();
                }
            }
            
            model.lastSeen = new Date();
            model.latestState = 'connected'
            return result;
        }
        catch(e: any){
            console.log(e)
            model.latestFailMessage = e.toString()
            model.latestState = 'disconnected'
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

