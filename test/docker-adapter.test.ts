import { DockerAdapter } from "../src/adapters/docker/docker-adapter"


describe("toy tests",  ()=>{
    // Not working under WSL
    it("Create docker adapter, and ping it with success", async ()=>{
        const docker = new DockerAdapter({host:'localhost'})
        let result = await docker.ping()
        
        expect(result).toEqual(true)
    })
    it("Should create a hello-world", async ()=>{
        const docker = new DockerAdapter({host:'localhost'})
        let container = await docker.createContainer({image: 'hello-world'})
        let info = await container.remoteContainer?.inspect()
        expect(info?.Name).toEqual('/trust_agent')
    })
})

