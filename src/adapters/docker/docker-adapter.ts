import Docker from 'dockerode'

export async function createDockerEngine(engineModel:any){
    const host = engineModel.host
    const docker = new Docker({protocol:'http', host:host, port:2375 })
    let images = await docker.listImages()
    return images;
}