const { exec } = require("child_process");
const lineReader = require('line-reader');
const assert = require('assert');
let var11 = "";
let var22 = "";
var fs1 = require('fs');
var fs2 = require('fs');

exec("cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository/blob.sig TestAgent2.txt > out.txt 2> error.txt", (error, stdout, stderr) => {
    if (error) {
      console.error('error: ' + error);
        return;
    }

    if(fs1.readFileSync('error1.txt', 'utf-8') === fs2.readFileSync('error.txt', 'utf-8'))
      console.log('TA verified.');
    else
      console.log('TA cannot be verified.');   

      try{
        assert.deepEqual(fs1.readFileSync('error1.txt', 'utf-8'), fs2.readFileSync('error.txt', 'utf-8'), "TA cannot be verified.")
        console.log("TA verified.")
      }
      catch(error){
        console.log(error.message)
      }
});
