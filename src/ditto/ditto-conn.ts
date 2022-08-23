import { AbstractAdapter } from "../adapters/abstract-adapter"
import * as mqtt from "async-mqtt"
import { createAdapter } from "../adapters/adapter-factory";
import { TIMEOUT } from "dns";
import wait from 'wait'
import { watch } from "fs";

export interface MqttConnInfo {
    host: string;
    rootTopic: string;
}

export class DittoConnector{
    adapters: {[key:string]: AbstractAdapter} = {};
    client: mqtt.AsyncClient;
    connInfo: MqttConnInfo;
    constructor(connInfo: MqttConnInfo){
        this.client = mqtt.connect(connInfo.host)
        this.connInfo = connInfo
    }

    loadLocalModels(deviceModels: {[key:string]: any}){
        Object.keys(deviceModels).forEach(key =>{
            this.adapters[key] = createAdapter(deviceModels[key])   
        })
        console.log(Object.keys(this.adapters))

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
        let topic = `${this.connInfo.rootTopic}/device`
        return this.client.publish(topic, device.getModelString(' '))
    }

    async heartbeat(adapter: AbstractAdapter){
        let device = adapter.getModel();
        let state = device.latestState;
        if(state == 'created'){
            await(adapter.launchOperation('info'))
        }
        else{
            await(adapter.launchOperation('ping'))
        }
        await this.pubDevice(adapter)
        await wait(60 * 1000) //wait a minute
        this.heartbeat(adapter)
    }

}