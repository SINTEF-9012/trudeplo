import { DockerAdapter } from "../src/adapters/docker/docker-adapter"


describe("toy tests",  ()=>{
    // Not working under WSL
    it("Should always return some images", async ()=>{
        const docker = new DockerAdapter({host:'localhost'})
        let result = await docker.listImages()
        expect(result.length).toBeGreaterThan(0)
    })
})