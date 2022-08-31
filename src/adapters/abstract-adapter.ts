

type OperationName = 'ping' | 'info' | 'load_agent' | 'start_agent' | 'stop_agent' | 'ping_agent';
type DeviceState = 'created' | 'connected' | 'disconnected';
type AgentStatus = 'unloaded' | 'running' | 'stopped';

export interface BasicDeviceModel {
    thingId?: string;
    _agent?: any;
    execEnv?: any;
    agent?: any;
    meta:{
        lastOperation?: OperationName;
        lastTried?: Date;
        latestFailMessage?: string;
        latestState?: DeviceState;
        lastSeen?: Date;
    };
    attribute:{
        info?: string;
        arch?: string;
    };
}

export interface BasicArtifactModel{
    _instance?: any;
    status?: AgentStatus;
}

export abstract class AbstractAdapter{
    model: BasicDeviceModel
    constructor(model: {agent?: any}){
        this.model = {...model, meta:{}, attribute:{}}
        this.model.meta.latestState = 'created'
    }

    abstract _ping(): Promise<boolean>
    abstract _info(): Promise<string>

    async launchOperation(operation: OperationName){
        let model = this.getModel()
        model.meta.lastOperation = operation;
        model.meta.lastTried = new Date();
        try{
            let result: any = undefined
            switch(operation){
                case 'info': {
                    result = await this._info();
                    model.attribute.info = result;
                    break;
                }
                case 'ping': {
                    result = await this._ping();
                    break;
                }
                case 'load_agent': {
                    result = await this.loadAgent();
                    break;
                }
                case 'start_agent': {
                    result = await this.runAgent();
                    break;
                }
                case 'stop_agent':{
                    result = await this.stopAgent();
                    break;
                }
                case 'ping_agent':{
                    result = await this.isAgentRunning();
                    break;
                }
            }
            
            model.meta.lastSeen = new Date();
            model.meta.latestState = 'connected'
            model.meta.latestFailMessage = undefined
            return result;
        }
        catch(e: any){
            console.log(e)
            model.meta.latestFailMessage = e.toString()
            model.meta.latestState = 'disconnected'
            return 'not connected'
        }

    }

    

    /**
     * assign an agent to the device
     * @param agent 
     */
    setAgent(agent:{}){
        this.model['_agent'] = {...agent, status:'unloaded'}

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

    getTwinModel(){
        let model = this.getModel()
        return {
            thingId: model.thingId,
            attributes: model.attribute,
            features:{
                execEnv:{
                    properties: model.execEnv
                },
                agent:{
                    properties: model._agent
                },
                meta:{
                    properties: model.meta
                }
            }
        }
    }

    getTwinString(space?: string){
        let model = this.getTwinModel()
        if(space){
            return JSON.stringify(model, null, space)
        }
        else{
            return JSON.stringify(model)
        }
    }

    /**
     * Update local device based on the received digital twin
     * Only support "adding an agent" at the moment
     * @param twin 
     */
    async receiveTwin(twin: any){
        if(twin.features.agent && twin.features.agent.desiredProperties)
            await this.updateAgentFromTwin(
                twin.features.agent.desiredProperties
            );
    }

    private async updateAgentFromTwin(desiredAgent: any) {
        let currentAgent = this.getAgent();
        if (!currentAgent) {
            this.setAgent(desiredAgent); //status will be set to 'unloaded'
            currentAgent = this.getAgent();
        }
        else if (
            (currentAgent.url != desiredAgent.url) ||
            (currentAgent.signature != desiredAgent.signature)
        ) { //when a different agent was required
            currentAgent.status = 'unloaded';
        }

        if (currentAgent.status == 'unloaded'
            && (desiredAgent.status == 'stopped'
                || desiredAgent.status == 'running')) {
            await this.launchOperation('load_agent');
            currentAgent = this.getAgent();
        }
        if (currentAgent.status == 'stopped' && desiredAgent.status == 'running') {
            await this.launchOperation('start_agent');
            await this.isAgentRunning();
            currentAgent = this.getAgent();
        }
        if (currentAgent.status == 'running' && desiredAgent.status == 'stopped') {
            await this.launchOperation('stop_agent');
            await this.isAgentRunning();
            currentAgent = this.getAgent();
        }
    }
}

