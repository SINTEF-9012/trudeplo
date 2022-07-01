import {program} from "commander";

//const program = new Command();

    
program.command('deploy')
    .action( () => {
        console.log('nothing to deploy')
    })
program.parse(process.argv)