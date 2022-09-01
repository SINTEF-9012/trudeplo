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
exports.DittoConnector = void 0;
const mqtt = __importStar(require("async-mqtt"));
const adapter_factory_1 = require("../adapters/adapter-factory");
const wait_1 = __importDefault(require("wait"));
class DittoConnector {
    constructor(connInfo) {
        this.adapters = {};
        this.adaptersByThingId = {};
        this.client = mqtt.connect(connInfo.host);
        this.connInfo = connInfo;
    }
    loadLocalModels(deviceModels) {
        Object.keys(deviceModels).forEach(key => {
            let device = deviceModels[key];
            let adapter = (0, adapter_factory_1.createAdapter)(device);
            this.adapters[key] = adapter;
            if (device.thingId)
                this.adaptersByThingId[device.thingId] = adapter;
        });
        console.log(Object.keys(this.adapters));
    }
    startHeartBeatForAll() {
        return __awaiter(this, void 0, void 0, function* () {
            Object.values(this.adapters).forEach((adapter) => __awaiter(this, void 0, void 0, function* () {
                this.heartbeat(adapter);
            }));
            console.log('heart beat started');
        });
    }
    updateAllDeviceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let results = Object.values(this.adapters).map((adapter) => __awaiter(this, void 0, void 0, function* () {
                let info = yield adapter.launchOperation('info');
                yield this.pubDevice(adapter);
                return info;
            }));
            let resolved = yield Promise.all(results);
            console.log('All local devices');
            console.log(resolved);
            return;
        });
    }
    pubDevice(device) {
        return __awaiter(this, void 0, void 0, function* () {
            let topic = `${this.connInfo.rootTopic}/device`;
            return this.client.publish(topic, device.getTwinString(' '));
        });
    }
    heartbeat(adapter) {
        return __awaiter(this, void 0, void 0, function* () {
            let device = adapter.getModel();
            let state = device.meta.latestState;
            if (state == 'created') {
                yield (adapter.launchOperation('info'));
            }
            else {
                yield (adapter.launchOperation('ping'));
            }
            yield this.pubDevice(adapter);
            yield (0, wait_1.default)(20 * 1000); //wait a minute (20 seconds for testing purpose)
            this.heartbeat(adapter);
        });
    }
    startSubDownstream() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.subscribe(`${this.connInfo.rootTopic}/downstream`);
            this.client.on('message', (topic, payload, packet) => __awaiter(this, void 0, void 0, function* () {
                if (topic == `${this.connInfo.rootTopic}/downstream`) {
                    console.log(payload.toString());
                    let model = JSON.parse(payload.toString());
                    let adapter = this.locateAdapter(model);
                    yield adapter.receiveTwin(model);
                }
            }));
        });
    }
    locateAdapter(model) {
        const downId = model.thingId;
        if (downId in this.adaptersByThingId)
            return this.adaptersByThingId[downId];
        // Thinking about other ways to match existing adapters
        let adapter = (0, adapter_factory_1.createAdapter)({
            thingId: downId,
            meta: {},
            attribute: {},
            execEnv: model.features.execEnv.properties
        });
        return adapter;
    }
}
exports.DittoConnector = DittoConnector;
