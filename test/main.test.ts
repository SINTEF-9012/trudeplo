import { justToTest } from "../src/fortest/somefunctions"


describe("toy tests",  ()=>{
    it("Should return 1", async ()=>{
        const result = justToTest()
        expect(result).toEqual(1)
    })
})