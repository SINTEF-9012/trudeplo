import fs from "fs";
import { AbstractAdapter } from "../abstract-adapter";

const LOCAL_PATH = './ext/forprocess'

export class ProcessAdapter extends AbstractAdapter{

    getWorkingPath(){
        return `${LOCAL_PATH}/${(this.getModel() as any)['host']}`
    }

    getFilePath(){
        let path = this.getWorkingPath()
        let fileName = this.getAgent()['remoteFile']
        let filePath = `${path}/${fileName}`
        return filePath
    }
    
    constructor(model: any){
        super(model)
        let host = model.host!
        try{
            fs.mkdirSync(`${LOCAL_PATH}/${host}`)
        }
        catch(e){
            console.log('folder exists')
        }
    }

    async ping(): Promise<boolean> {
        let path = this.getWorkingPath()
        return fs.existsSync(path)
    }

    async _info(): Promise<string> {
        return `${process.title} ${process.version} at ${process.platform} on ${process.arch}. Working path: ${this.getWorkingPath()}`
    }
    async loadAgent(): Promise<any> {
        let filePath = this.getFilePath()
        fs.writeFileSync(filePath, '')
        return this.getAgent()
    }
    async runAgent(): Promise<any> {
        let filePath = this.getFilePath()
        fs.writeFileSync(filePath, 'running')
        return this.getAgent()
    }
    async stopAgent(): Promise<any> {
        let filePath = this.getFilePath()
        fs.writeFileSync(filePath, 'stopped')
        return this.getAgent()
    }
    async isAgentRunning(): Promise<boolean> {
        let filePath = this.getFilePath()
        let content = fs.readFileSync(filePath, 'utf-8')
        return content == 'running';
    }
}