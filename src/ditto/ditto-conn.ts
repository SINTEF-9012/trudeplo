import { AbstractAdapter } from "../adapters/abstract-adapter"
import * as mqtt from "async-mqtt"
import { createAdapter } from "../adapters/adapter-factory";
import wait from 'wait'
import { watch } from "fs";

export interface MqttConnInfo {
    host: string;
    rootTopic: string;
}

export class DittoConnector{
    adapters: {[key:string]: AbstractAdapter} = {};
    adaptersByThingId: {[key:string]: AbstractAdapter} = {};
    client: mqtt.AsyncClient;
    connInfo: MqttConnInfo;
    constructor(connInfo: MqttConnInfo){
        this.client = mqtt.connect(connInfo.host)
        this.connInfo = connInfo
    }

    loadLocalModels(deviceModels: {[key:string]: any}){
        Object.keys(deviceModels).forEach(key =>{
            let device = deviceModels[key];
            let adapter = createAdapter(device); 
            this.adapters[key] =  adapter;
            if(device.thingId)
                this.adaptersByThingId[device.thingId] = adapter;
        })
        console.log(Object.keys(this.adapters))

    }

    async requestTwins(){
        return await this.client.publish(`${this.connInfo.rootTopic}/request`, 'FetchAll');
    }

    async startHeartBeatForAll(){
        Object.values(this.adapters).forEach(async (adapter)=>{
            this.heartbeat(adapter)
        })
        console.log('heart beat started')
    }

    async updateAllDeviceInfo(){
        let results = Object.values(this.adapters).map(async (adapter) => {
            let info = await adapter.launchOperation('info')
            await this.pubDevice(adapter)
            return info
        })
        let resolved = await Promise.all(results)
        console.log('All local devices')
        console.log(resolved)
        return;
    }

    async pubDevice(device: AbstractAdapter){
        let topic = `${this.connInfo.rootTopic}/upstream`
        return this.client.publish(topic, device.getTwinString(' '))
    }

    async heartbeat(adapter: AbstractAdapter){
        let device = adapter.getModel();
        let state = device.meta.latestState;
        if(state == 'created'){
            await(adapter.launchOperation('info'))
        }
        else{
            await(adapter.launchOperation('ping'))
        }
        await this.pubDevice(adapter)
        await wait(20 * 1000) //wait a minute (20 seconds for testing purpose)
        this.heartbeat(adapter)
    }

    async startSubDownstream(){
        await this.client.subscribe(`${this.connInfo.rootTopic}/downstream`)
        this.client.on('message', async (topic, payload, packet)=>{
            if(topic == `${this.connInfo.rootTopic}/downstream`){
                console.log(payload.toString())
                let model = JSON.parse(payload.toString());
                let adapter = this.locateAdapter(model)
                await adapter.receiveTwin(model)
            }
        })
    }

    private locateAdapter(model: any){
        const downId = model.thingId;
        if(downId in this.adaptersByThingId)
            return this.adaptersByThingId[downId]
        // Thinking about other ways to match existing adapters
        let adapter = createAdapter({
            thingId: downId,
            meta: {},
            attribute: {},
            execEnv: model.features.execEnv.properties
        })
        this.heartbeat(adapter)
        this.adapters[downId] = adapter;
        this.adaptersByThingId[downId] = adapter;
        return adapter
    }

}