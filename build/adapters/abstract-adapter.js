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
exports.AbstractAdapter = void 0;
class AbstractAdapter {
    constructor(model) {
        this.model = Object.assign(Object.assign({}, model), { meta: {}, attribute: {} });
        this.model.meta.latestState = 'created';
    }
    launchOperation(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`launch operation "${operation}"`);
            let model = this.getModel();
            model.meta.lastOperation = operation;
            model.meta.lastTried = new Date();
            try {
                let result = undefined;
                switch (operation) {
                    case 'info': {
                        result = yield this._info();
                        model.attribute.info = result;
                        break;
                    }
                    case 'ping': {
                        result = yield this._ping();
                        break;
                    }
                    case 'load_agent': {
                        result = yield this.loadAgent();
                        break;
                    }
                    case 'start_agent': {
                        result = yield this.runAgent();
                        break;
                    }
                    case 'stop_agent': {
                        result = yield this.stopAgent();
                        break;
                    }
                    case 'ping_agent': {
                        result = yield this.isAgentRunning();
                        break;
                    }
                }
                model.meta.lastSeen = new Date();
                model.meta.latestState = 'connected';
                model.meta.latestFailMessage = undefined;
                return result;
            }
            catch (e) {
                console.log(e);
                model.meta.latestFailMessage = e.toString();
                model.meta.latestState = 'disconnected';
                return 'not connected';
            }
        });
    }
    /**
     * assign an agent to the device
     * @param agent
     */
    setAgent(agent) {
        this.model['_agent'] = Object.assign(Object.assign({}, agent), { status: 'unloaded' });
    }
    getAgent() {
        return this.model['_agent'];
    }
    getModel() {
        return this.model;
    }
    getTwinModel() {
        let model = this.getModel();
        return {
            thingId: model.thingId,
            attributes: model.attribute,
            features: {
                execEnv: {
                    properties: model.execEnv
                },
                agent: {
                    properties: model._agent
                },
                meta: {
                    properties: model.meta
                }
            }
        };
    }
    getTwinString(space) {
        let model = this.getTwinModel();
        if (space) {
            return JSON.stringify(model, null, space);
        }
        else {
            return JSON.stringify(model);
        }
    }
    /**
     * Update local device based on the received digital twin
     * Only support "adding an agent" at the moment
     * @param twin
     */
    receiveTwin(twin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (twin.features.agent && twin.features.agent.desiredProperties)
                yield this.updateAgentFromTwin(twin.features.agent.desiredProperties);
        });
    }
    updateAgentFromTwin(desiredAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentAgent = this.getAgent();
            if (!currentAgent) {
                this.setAgent(desiredAgent); //status will be set to 'unloaded'
                currentAgent = this.getAgent();
            }
            else if ((currentAgent.url != desiredAgent.url) ||
                (currentAgent.signature != desiredAgent.signature)) { //when a different agent was required
                currentAgent.status = 'unloaded';
            }
            if (currentAgent.status == 'unloaded'
                && (desiredAgent.status == 'stopped'
                    || desiredAgent.status == 'running')) {
                yield this.launchOperation('load_agent');
                currentAgent = this.getAgent();
            }
            if (currentAgent.status == 'stopped' && desiredAgent.status == 'running') {
                yield this.launchOperation('start_agent');
                yield this.isAgentRunning();
                currentAgent = this.getAgent();
            }
            if (currentAgent.status == 'running' && desiredAgent.status == 'stopped') {
                yield this.launchOperation('stop_agent');
                yield this.isAgentRunning();
                currentAgent = this.getAgent();
            }
        });
    }
}
exports.AbstractAdapter = AbstractAdapter;
