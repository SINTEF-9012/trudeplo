"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const model_handler_1 = require("../model/model-handler");
commander_1.program
    .name('model');
commander_1.program
    .command('load')
    .description('load model from local yaml file')
    .argument('<string>')
    .action((str) => {
    let model = (0, model_handler_1.loadFromYaml)(str);
    console.log(model);
});
commander_1.program.parse(process.argv);
