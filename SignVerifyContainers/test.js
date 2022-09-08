const { exec } = require("child_process");
const verification_status = "false";

exec("go version", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}` + `verification status: ${verification_status}`);
    console.log(`stdout: ${stdout}`);
});