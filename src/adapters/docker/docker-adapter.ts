import Docker from 'dockerode'
import { streamToString } from '../../util/stream';
import { AbstractAdapter } from '../abstract-adapter';

export interface Container{
    name: string;
    image: string;
    created?: Date;
    running: boolean;
    _instance?: Docker.Container;
    id?: string
}

export interface ArtifactModel{
    name?: string;
    image: string;
    url?: string;
    localFile?: string;
}


export class DockerAdapter extends AbstractAdapter{

    docker: Docker
    containers: Container[] = []

    constructor(deviceModel:any){
        super(deviceModel)
        const host = deviceModel.host;
        this.docker = new Docker({protocol:'http', host:host, port:2375 });
    }

    async loadAgent() {
        let elem = this.getModel()
        if(!elem['_agent']){
            throw new Error ('agent not assigned')
        }
        let response = await this.loadImage(elem._agent)
        if(response){
            elem._agent['image'] = response          
            elem._agent['status'] = 'stopped'
            return true
        }
        return false
    }
    async runAgent() {
        let elem = this.getModel()
        if(!elem['_agent']){
            throw new Error ('agent not assigned')
        }
        let response = await this.createAndRunContainer(elem._agent)
        elem._agent = {
            ...elem._agent,
            id: response.id,
            name: response.name,
            status: 'running'
        }
        
        return elem._agent
    }

    // async updateContainers(){
    //     let remoteContainers = await this.docker.listContainers({all: true});
    //     this.containers = remoteContainers.map(i => { return {
    //         name: i.Names[0],
    //         image: i.Image,
    //         running: i.State.toLowerCase() == 'running',
    //         id: i.Id
    //      }})
    //     return this.containers;
    // }

    async listImages(){
        let images = await this.docker.listImages()
        return images;
    }

    /**
     * Check if the Docker Engine is online
     * @returns true (online) or false
     */
    async _ping(){
        return ((await this.docker.ping()) as Buffer).toString() == 'OK'
    }

    async _info(): Promise<string> {
        const version = await this.docker.version()
        this.getModel().attributes.arch = version.Arch
        return `Docker Engine ${version.Version} on ${version.Arch} with ${version.Os}, API ${version.ApiVersion}`
    }


    async deployArtefact(model: ArtifactModel){
        return this.createAndRunContainer(model)
    }

    /**
     * create a container and start it. If there is already a container 
     * with the same name, it will be removed first.
     * @param model 
     * @returns Internal record of the created container
     */
    async createAndRunContainer(model: ArtifactModel){
        const image = model.image
        const name = model.name ?? 'trust_agent'

        let containerStub:Container = {name: name, image: image, running: false}
        this.containers.push(containerStub)
        try{
            let remoteContainer = await this.getContainer(containerStub)
            let result = await remoteContainer.remove({force: true})
        }
        catch(e){
            //no container found, so it's ok
        }

        // console.log(`name: ${name}, image: ${image}`)
        let container = await this.docker.createContainer({
            name: name,
            Image: image
        })
        let response = await container.start()
        // console.log(streamToString(response))
        containerStub._instance = container
        containerStub.id = container.id
        return containerStub
    }

    async stopAgent(): Promise<any> {
        let agentModel = this.getModel()['_agent']
        let container = await this.getContainer(agentModel)
        return await container.remove({force: true})
    }

    /**
     * Load image into the remote docker engine, if there is a local file
     * Downloading the file from cloud repository should not be the task of
     * the adapter
     * @param model 
     */
    async loadImage(model: ArtifactModel){
        let localFile = model.localFile
        if(localFile){
            let image_tag = model.image
            let result = await this.docker.loadImage(localFile, {quiet:true})
            let resultString = await streamToString(result)
            try{
                let response = JSON.parse(resultString)['stream'] as string
                return response.substring(response.indexOf(':')+1).trim()
            }
            catch(e){
                throw Error(resultString)
            }
        }
    }

    async getContainerByName(name: string){
        if(! name.startsWith('/'))
            name = '/' + name;
        const ctnerInfos = await this.docker.listContainers({all: true});
        // console.log(ctnerInfos)
        let found =  ctnerInfos.find(i => i.Names.includes(name))
        if(found)
            return this.docker.getContainer(found.Id)
        else
            return undefined
    }

    async getContainer(agentModel:{id?: string, name?:string}){
        if(! agentModel){
            throw new Error ('agent not assigned')
        }
        let container:Docker.Container | undefined = undefined;
        if(agentModel['id']){
            container = this.docker.getContainer(agentModel['id'])
        }
        else{
            container = await this.getContainerByName(agentModel['name']!)
        }
        if(! container){
            let simpleAgent = (({name, id})=>({name, id}))(agentModel)
            throw new Error (`container not found: name: ${simpleAgent}`)
        }
        return container
    }

    async isAgentRunning(): Promise<boolean> {
        let agentModel = this.getModel()['_agent']
        if(! agentModel){
            throw new Error ('agent not assigned')
        }
        let isRunning = await this.isContainerRunning(agentModel);
        if(isRunning){
            this.getAgent().status = 'running'
            return true
        }
        else{
            this.getAgent().status = 'stopped'
            return false
        }

    }

    async isContainerRunning(model: {name?: string, id?: string}){
        try{
            let container = await this.getContainer(model)
            return (await container?.inspect())?.State.Running
        }
        catch(e){
            return false
        }
    }

}
