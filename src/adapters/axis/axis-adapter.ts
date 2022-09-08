import { getPassword } from "../../fleet/local-credential";
import { AbstractAdapter } from "../abstract-adapter";
import { AxisClient } from "./axis-api-client";

export class AxisAdapter extends AbstractAdapter{
    axisClient: AxisClient

    constructor(deviceModel:any){
        super(deviceModel)
        let username = deviceModel.execEnv.username
        let password = getPassword(deviceModel)
        this.axisClient = new AxisClient(deviceModel.host, username, password)
    }

    async _ping(): Promise<boolean> {
        let res = await this.axisClient.ping()
        if (res.startsWith('got'))
            return true;
        else   
            return false;
    }

    async _info(): Promise<string> {
        const {data: {propertyList}} = await this.axisClient.getDeviceInfo()
        const {Architecture, Version, ProdFullName, SerialNumber} = propertyList
        const info = `${ProdFullName}, ${Version} on ${Architecture}. SerialNumber: ${SerialNumber}`
        this.getModel().attribute = {
            ...this.getModel().attribute,
            arch: Architecture,
            info: info
        }
        return info
    }
    
    async loadAgent(): Promise<any> {
        let file = this.getAgent().localFile
        let result = await this.axisClient.installApplication(file)
        console.log(result)
        return result
    }
    runAgent(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    stopAgent(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    isAgentRunning(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
}