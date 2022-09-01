"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
//const program = new Command();
commander_1.program
    .name('cmd')
    .command('model', 'parsing and handling the user-provided models')
    .command('device', 'work with devices')
    .command('dt', 'digital twins')
    .command('mqtt', 'sample mqtt client currently using for testing');
commander_1.program.parse(process.argv);
