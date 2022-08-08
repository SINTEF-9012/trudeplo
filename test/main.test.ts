import { createDockerEngine } from "../src/adapters/docker/docker-adapter"


describe("toy tests",  ()=>{
    it("Should always return some images", async ()=>{
        const result = await createDockerEngine({host:'SINTEFPC9977.local'})
        expect(result.length).toBeGreaterThan(0)
    })
})