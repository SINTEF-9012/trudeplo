const { exec } = require("child_process");

exec("cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository/blob.sig TestAgent2.txt", (error, stdout, stderr) => {
    if (error) {
      console.error('error: ' + error);
        return;
    }

      console.log("stdout: " + stdout);
      console.log("Error Output: " + stderr);    
});
