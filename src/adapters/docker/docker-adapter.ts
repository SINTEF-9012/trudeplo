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

    getModel(){
        return this.model as {host: string, _agent: any}
    }

    async loadAgent() {
        let elem = this.getModel()
        if(!elem['_agent']){
            throw new Error ('agent not assigned')
        }
        let response = await this.loadImage(elem._agent)
        if(response){
            elem._agent['image'] = response
            elem._agent['loaded'] = true
        }
        return elem._agent
    }
    async runAgent() {
        let elem = this.getModel()
        if(!elem['_agent']){
            throw new Error ('agent not assigned')
        }
        if(!elem['_agent']['loaded']){
            throw new Error ('load the agent first')
        }
        let response = await this.createAndRunContainer(elem._agent)
        elem._agent = {
            ...elem._agent,
            ...response
        }
        
        return elem._agent
    }

    async updateContainers(){
        let remoteContainers = await this.docker.listContainers({all: true});
        this.containers = remoteContainers.map(i => { return {
            name: i.Names[0],
            image: i.Image,
            running: i.State.toLowerCase() == 'running',
            id: i.Id
         }})
        return this.containers;
    }

    async listImages(){
        let images = await this.docker.listImages()
        return images;
    }

    /**
     * Check if the Docker Engine is online
     * @returns true (online) or false
     */
    async ping(){
        return ((await this.docker.ping()) as Buffer).toString() == 'OK'
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
        await this.updateContainers()

        let containerStub = this.containers.find(item => item.name.endsWith(name))
            
        if(! containerStub){
            containerStub = {name: name, image: image, running: false}
            this.containers.push(containerStub)
        }
        else{
            let remoteContainer = this.docker.getContainer(containerStub.id!)
            let result = await remoteContainer.remove({force: true})
        }

        console.log(`name: ${name}, image: ${image}`)
        let container = await this.docker.createContainer({
            name: name,
            Image: image
        })
        await container.start()
        containerStub._instance = container
        return containerStub
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
                console.log(resultString)
                return //not successfuly load any image. return undefined
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

    async isAgentRunning(): Promise<boolean> {
        let agentModel = this.getModel()['_agent']
        if(! agentModel){
            throw new Error ('agent not assigned')
        }
        return (await this.isContainerRunning(agentModel) == true)
    }

    async isContainerRunning(model: {name?: string}){
        let container = await this.getContainerByName(model.name!)
        // console.log(container)
        return (await container?.inspect())?.State.Running
    }

}
