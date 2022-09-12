const { exec } = require("child_process");
const assert = require('assert');
var fs1 = require('fs');
var fs2 = require('fs');
let expected_verification_status = "";
let current_verification_status = "";

exec("cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository/blob.sig TestAgent2.txt > out.txt 2> error.txt", (error, stdout, stderr) => {
    if (error) {
      console.error('error: ' + error);
        return;
    }

    expected_verification_status = fs1.readFileSync('expected_status.txt', 'utf-8');
    current_verification_status = fs2.readFileSync('error.txt', 'utf-8');
    
    console.log('Expected status:' + expected_verification_status);
    console.log('Actual status:' +  current_verification_status);
  
    if(fs1.readFileSync('expected_status.txt', 'utf-8') === fs2.readFileSync('error.txt', 'utf-8'))
      console.log('TA verified.');
    else
      console.log('TA cannot be verified.');   


      //try{
    //    assert.deepEqual(fs1.readFileSync('expected_status.txt', 'utf-8'), fs2.readFileSync('error.txt', 'utf-8'), "TA cannot be verified.")
    //    console.log("TA verified.")
    //}
    //catch(error){
    //    console.log(error.message)
    //}
   
});
