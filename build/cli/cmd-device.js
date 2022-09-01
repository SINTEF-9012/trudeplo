"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const adapter_factory_1 = require("../adapters/adapter-factory");
const model_handler_1 = require("../model/model-handler");
commander_1.program
    .name('device');
commander_1.program
    .command('list')
    .alias('ls')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .option('-l, --long', 'show full model')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const model = (0, model_handler_1.loadFromYaml)(options.model);
    if (options.long) {
        console.log(model['devices']);
    }
    else {
        console.log(Object.keys(model['devices']));
    }
}));
commander_1.program
    .command('info')
    .description('show the core information of the remote device')
    .argument('<string>', 'device name')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action((str, options) => __awaiter(void 0, void 0, void 0, function* () {
    const model = (0, model_handler_1.loadFromYaml)(options.model);
    const device = model['devices'][str];
    if (!device) {
        console.log(`device ${str} not found in the model`);
    }
    const adapter = (0, adapter_factory_1.createAdapter)(device);
    let info = yield adapter._info();
    console.log(info);
}));
commander_1.program
    .command('deploy')
    .description('load and run the agent into the device')
    .argument('<string>', 'device name')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action((str, options) => __awaiter(void 0, void 0, void 0, function* () {
    const model = (0, model_handler_1.loadFromYaml)(options.model);
    const device = model['devices'][str];
    const adapter = (0, adapter_factory_1.createAdapter)(device);
    if (device.agent) {
        adapter.setAgent(model['agents'][device.agent]);
    }
    else {
        console.log('no agent specified');
    }
    let loaded = yield adapter.loadAgent();
    console.log(loaded);
    let started = yield adapter.runAgent();
    console.log(started);
}));
commander_1.program.parse(process.argv);
