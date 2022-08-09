import { AbstractAdapter } from "../src/adapters/abstract-adapter"
import { DockerAdapter } from "../src/adapters/docker/docker-adapter"
import { loadFromYaml } from "../src/model/model-handler"


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
        let info = await container._instance?.inspect()
        expect(info?.Name).toEqual('/trust_agent')
    })
    it("Load image from local file", async () =>{
        const docker = new DockerAdapter({host: 'localhost'})
        let image = await docker.loadImage({
            localFile: 'ext/trust-agent-image.tar.gz',
            image: 'songhui/trust-agent:latest'
        })
        expect(image).toEqual('songhui/trust-agent:latest')
    })
    it.only("get model from yaml, load image, and run container", async()=>{
        let model = loadFromYaml('sample/models/sample-model.yaml')
        let device = model['devices']['my_local_machine']
        const adapter: AbstractAdapter = new DockerAdapter(device)
        expect(adapter.ping()).toBeTruthy()
        adapter.setAgent(model['agents']['ta_docker_amd64'])
        let afterload = await adapter.loadAgent()
        expect(afterload.image).toEqual('songhui/trust-agent:latest')
        let afterrun = await adapter.runAgent()
        console.log(afterrun)
    })
})

