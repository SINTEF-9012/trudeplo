const { exec } = require("child_process");

exec("cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository/blob.sig TestAgent2.txt", (error, stdout, stderr) => {
    if (error !== null) {
        console.log('error: ' + error);
    }
    console.log("Standard Output: " + stdout + " ");
    console.log("Error Output: " + stderr + " ");

    //#region if (stderr !== null) {
      //#region   console.log("Error Output: " + stderr + " ");
    //#endregion    }
});
