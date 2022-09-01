"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const mqtt = __importStar(require("async-mqtt"));
const prompts_1 = __importDefault(require("prompts"));
commander_1.program
    .name('mqtt');
commander_1.program
    .command('start')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const client = mqtt.connect('tcp://test.mosquitto.org:1883');
    let result = client.subscribe('trudeplo/device');
    client.on('message', (topic, payload, packet) => __awaiter(void 0, void 0, void 0, function* () {
        if (topic == 'trudeplo/device') {
            let model = JSON.parse(payload.toString());
            if (model.thingId == 'no.sintef.sct.giot:SINTEF9977') {
                console.log(JSON.stringify(model, null, ' '));
                let input = yield (0, prompts_1.default)({
                    type: 'text',
                    name: 'command',
                    message: 'What do you want?',
                    validate: value => value in ['start', 'stop'] ? 'invalid command' : true
                });
                if (input.command == 'start') {
                    console.log('create response...');
                    let desired = {
                        localFile: "ext/trust-agent-image.tar.gz",
                        image: "songhui/trust-agent:latest",
                        status: "running",
                        name: "trust_agent"
                    };
                    if (!model.features.agent) {
                        model.features.agent = {};
                    }
                    model.features.agent.desiredProperties = desired;
                    yield client.publish('trudeplo/downstream', JSON.stringify(model));
                    console.log('response sent');
                }
                else if (input.command == 'stop') {
                    console.log('create response to stop the trust agent');
                    let desired = Object.assign({}, model.features.agent.properties);
                    desired.status = 'stopped';
                    model.features.agent.desiredProperties = desired;
                    yield client.publish('trudeplo/downstream', JSON.stringify(model));
                    console.log('response sent');
                }
            }
        }
    }));
}));
commander_1.program.parse(process.argv);
