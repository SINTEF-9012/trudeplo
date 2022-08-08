import Docker from 'dockerode'

export interface Container{
    name: string;
    image: string;
    created: boolean;
    running: boolean;
    remoteContainer?: Docker.Container
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
        let remoteContainers = await this.docker.listContainers();
        console.log(remoteContainers)
        this.containers = remoteContainers.map(i => { return {
            name: i.Names[0],
            image: i.Image,
            created: true,
            running: false
         }})
        return this.containers;
    }

    async listImages(){
        let images = await this.docker.listImages()
        return images;
    }

    async deployArtefact(model: ArtifactModel){
        return this.createContainer(model)
    }

    async createContainer(model: ArtifactModel){
        const image = model.image
        const name = model.name ?? 'trust_agent'
        await this.updateContainers()
        console.log(this.containers)

        let containerStub = this.containers.find(item => item.name == name)
            
        if(! containerStub){
            containerStub = {name: name, image: image, created: false, running: false}
            this.containers.push(containerStub)
        }
        else{
            await containerStub.remoteContainer?.remove()
        }

        let container = await this.docker.createContainer({
            name: name,
            Image: image
        })

        containerStub.remoteContainer = container
        return containerStub
    }


}
