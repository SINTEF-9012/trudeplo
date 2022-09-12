const { exec } = require("child_process");
const fs = require('fs');
let var11 = "Verified OK";
let var22 = "";
let var1="";
let var2="";

exec("cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository/blob.sig TestAgent2.txt > out.txt 2> error.txt", (error, stdout, stderr) => {
    if (error) {
      console.error('error: ' + error);
        return;
    }
    console.log('var22 old: ' + var22);
    var22 = fs.readFileSync('error.txt', 'utf-8');
    console.log('var11: ' + var11);
    console.log('var22: ' + var22);

    var1 = var11.toString(); 
    var2 = var22.toString();
    
    console.log(var11 === "Verified OK");
    console.log(var1 === var2);

    if(var11 === var22)
      console.log("TA verified.");
    else
      console.log("TA cannot be verified.");   
});
