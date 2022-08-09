import { DateTime } from "neo4j-driver";

export interface BasicDeviceModel {
    _agent?: {};
    _lastSeen?: Date;
}

export interface BasicArtifactModel{
    _instance?: any;
}

export abstract class AbstractAdapter{
    model: BasicDeviceModel = {};
    constructor(model: {}){
        model = model
    }

    abstract ping(): Promise<boolean>

    /**
     * assign an agent to the device
     * @param agent 
     */
    setAgent(agent:{}){
        this.model['_agent'] = agent
    }

    /**
     * load the agent into device
     */
    abstract loadAgent(): Promise<any>;

    /**
     * start the agent
     */
    abstract runAgent(): Promise<any>;

    getModel(){
        return this.model
    }

}