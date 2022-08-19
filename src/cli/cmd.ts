import {program} from "commander";

//const program = new Command();

    
program
    .name('cmd')
    .command('model', 'parsing and handling the user-provided models')
    .command('device', 'work with devices')
    .command('dt', 'digital twins')
    
program.parse(process.argv)
