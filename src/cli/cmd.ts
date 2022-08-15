import {program} from "commander";

//const program = new Command();

    
program
    .name('cmd')
    .command('model', 'parsing and handling the user-provided models')
    .command('device', 'work with devices')
    
program.parse(process.argv)
