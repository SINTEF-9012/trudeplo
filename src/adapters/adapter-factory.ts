import { BasicDeviceModel, AbstractAdapter } from "./abstract-adapter"
import { DockerAdapter } from "./docker/docker-adapter"
import { SshAdapter } from "./ssh/ssh-adapter"

export function createAdapter(device: BasicDeviceModel): AbstractAdapter{
    
    const env = device.execEnv
    if(env.name == 'docker_engine'){
        return new DockerAdapter(device)
    }
    if(env.name == 'ssh'){
        return new SshAdapter(device)
    }
    else{
        throw new Error ('no adapter available')
    }
}