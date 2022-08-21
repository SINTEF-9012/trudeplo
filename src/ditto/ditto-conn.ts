import { AbstractAdapter } from "../adapters/abstract-adapter"
import * as mqtt from "async-mqtt"
import { createAdapter } from "../adapters/adapter-factory";

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

    async updateAllDeviceInfo(){
        let results = Object.values(this.adapters).map(async (adapter) => {
            let info = await adapter.info()
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

}