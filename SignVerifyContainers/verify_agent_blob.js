const { exec } = require("child_process");
const verification_status = "Verified OK";

exec("cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository/blob.sig TestAgent2.txt", (error, stdout, stderr) => {
    if (error) {
      console.error('error: ' + error);
        return;
    }
    console.log("stdout: " + stdout);
    console.log(verification_status === stdout);
    if(verification_status === stdout)
      console.log("TA verified.");
    else
      console.log("TA cannot be verified.");

      console.log("stdout: " + stdout);
      console.log("verification status:" + verification_status);
      console.log("Error Output: " + stderr);    
});
