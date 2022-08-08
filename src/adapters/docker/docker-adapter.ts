import Docker from 'dockerode'
import { DateTime } from 'neo4j-driver';

export interface Container{
    name: string;
    image: string;
    created?: DateTime;
    running: boolean;
    remoteContainer?: Docker.Container;
    id?: string
}

export interface ArtifactModel{
    name?: string;
    image: string;
}


export class DockerAdapter{
    docker: Docker
    containers: Container[] = []

    constructor(engineModel:any){
        const host = engineModel.host
        this.docker = new Docker({protocol:'http', host:host, port:2375 })
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

    async ping(){
        return ((await this.docker.ping()) as Buffer).toString() == 'OK'
    }

    async deployArtefact(model: ArtifactModel){
        return this.createContainer(model)
    }

    async createContainer(model: ArtifactModel){
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

        let container = await this.docker.createContainer({
            name: name,
            Image: image
        })

        containerStub.remoteContainer = container
        return containerStub
    }


}
