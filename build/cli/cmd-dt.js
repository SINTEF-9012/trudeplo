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
const ditto_conn_1 = require("../ditto/ditto-conn");
const model_handler_1 = require("../model/model-handler");
commander_1.program
    .name('dt');
commander_1.program
    .command('load')
    .description('load model from local yaml file, create adapters, and publish them to ditto')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    let model = (0, model_handler_1.loadFromYaml)(options.model);
    let dtConn = new ditto_conn_1.DittoConnector({
        host: 'tcp://test.mosquitto.org:1883',
        rootTopic: 'trudeplo'
    });
    dtConn.loadLocalModels(model.devices);
    yield dtConn.updateAllDeviceInfo();
}));
commander_1.program
    .command('heartbeat')
    .description('load model from local yaml file, create adapters, and publish them to ditto')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    let model = (0, model_handler_1.loadFromYaml)(options.model);
    let dtConn = new ditto_conn_1.DittoConnector({
        host: 'tcp://test.mosquitto.org:1883',
        rootTopic: 'trudeplo'
    });
    dtConn.loadLocalModels(model.devices);
    yield dtConn.startHeartBeatForAll();
}));
commander_1.program
    .command('sub')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    let dtConn = new ditto_conn_1.DittoConnector({
        host: 'tcp://test.mosquitto.org:1883',
        rootTopic: 'trudeplo'
    });
    yield dtConn.startSubDownstream();
}));
commander_1.program
    .command('all')
    .description('load model from local yaml file, start heart beat and listen to downstream')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    let model = (0, model_handler_1.loadFromYaml)(options.model);
    let dtConn = new ditto_conn_1.DittoConnector({
        host: 'tcp://test.mosquitto.org:1883',
        rootTopic: 'trudeplo'
    });
    dtConn.loadLocalModels(model.devices);
    dtConn.startSubDownstream();
    yield dtConn.startHeartBeatForAll();
}));
commander_1.program.parse(process.argv);
