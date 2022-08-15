export interface BasicDeviceModel {
    _agent?: any;
    _lastSeen?: Date;
    execEnv?: any;
}

export interface BasicArtifactModel{
    _instance?: any;
}

export abstract class AbstractAdapter{
    model: BasicDeviceModel = {};
    constructor(model: {agent?: any}){
        model = model
    }

    abstract ping(): Promise<boolean>
    abstract info(): Promise<string>

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

}

