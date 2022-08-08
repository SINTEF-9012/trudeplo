import Docker from 'dockerode'

export interface Container{
    name: string;
    image: string;
    created: boolean;
    running: boolean;
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

    async listImages(){
        let images = await this.docker.listImages()
        return images;
    }

    async createContainer(model: ArtifactModel){
        const image = model.image
        const name = model.name ?? 'trust_agent'
        let containerStub = this.containers.find(item => item.name == name)
            
        if(! containerStub){
            containerStub = {name: name, image: image, created: false, running: false}
            this.containers.push(containerStub)
        }

        let container = await this.docker.createContainer({
            name: name,
            Image: image
        })



    }
}
