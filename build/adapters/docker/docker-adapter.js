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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerAdapter = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const stream_1 = require("../../util/stream");
const abstract_adapter_1 = require("../abstract-adapter");
class DockerAdapter extends abstract_adapter_1.AbstractAdapter {
    constructor(deviceModel) {
        super(deviceModel);
        this.containers = [];
        const host = deviceModel.host;
        this.docker = new dockerode_1.default({ protocol: 'http', host: host, port: 2375 });
    }
    loadAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            let elem = this.getModel();
            if (!elem['_agent']) {
                throw new Error('agent not assigned');
            }
            let response = yield this.loadImage(elem._agent);
            if (response) {
                elem._agent['image'] = response;
                elem._agent['status'] = 'stopped';
                return true;
            }
            return false;
        });
    }
    runAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            let elem = this.getModel();
            if (!elem['_agent']) {
                throw new Error('agent not assigned');
            }
            let response = yield this.createAndRunContainer(elem._agent);
            elem._agent = Object.assign(Object.assign({}, elem._agent), { id: response.id, name: response.name, status: 'running' });
            return elem._agent;
        });
    }
    // async updateContainers(){
    //     let remoteContainers = await this.docker.listContainers({all: true});
    //     this.containers = remoteContainers.map(i => { return {
    //         name: i.Names[0],
    //         image: i.Image,
    //         running: i.State.toLowerCase() == 'running',
    //         id: i.Id
    //      }})
    //     return this.containers;
    // }
    listImages() {
        return __awaiter(this, void 0, void 0, function* () {
            let images = yield this.docker.listImages();
            return images;
        });
    }
    /**
     * Check if the Docker Engine is online
     * @returns true (online) or false
     */
    _ping() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.docker.ping()).toString() == 'OK';
        });
    }
    _info() {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield this.docker.version();
            this.getModel().attribute.arch = version.Arch;
            return `Docker Engine ${version.Version} on ${version.Arch} with ${version.Os}, API ${version.ApiVersion}`;
        });
    }
    deployArtefact(model) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createAndRunContainer(model);
        });
    }
    /**
     * create a container and start it. If there is already a container
     * with the same name, it will be removed first.
     * @param model
     * @returns Internal record of the created container
     */
    createAndRunContainer(model) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const image = model.image;
            const name = (_a = model.name) !== null && _a !== void 0 ? _a : 'trust_agent';
            let containerStub = { name: name, image: image, running: false };
            this.containers.push(containerStub);
            try {
                let remoteContainer = yield this.getContainer(containerStub);
                let result = yield remoteContainer.remove({ force: true });
            }
            catch (e) {
                //no container found, so it's ok
            }
            // console.log(`name: ${name}, image: ${image}`)
            let container = yield this.docker.createContainer({
                name: name,
                Image: image
            });
            let response = yield container.start();
            // console.log(streamToString(response))
            containerStub._instance = container;
            containerStub.id = container.id;
            return containerStub;
        });
    }
    stopAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            let agentModel = this.getModel()['_agent'];
            let container = yield this.getContainer(agentModel);
            return yield container.remove({ force: true });
        });
    }
    /**
     * Load image into the remote docker engine, if there is a local file
     * Downloading the file from cloud repository should not be the task of
     * the adapter
     * @param model
     */
    loadImage(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let localFile = model.localFile;
            if (localFile) {
                let image_tag = model.image;
                let result = yield this.docker.loadImage(localFile, { quiet: true });
                let resultString = yield (0, stream_1.streamToString)(result);
                try {
                    let response = JSON.parse(resultString)['stream'];
                    return response.substring(response.indexOf(':') + 1).trim();
                }
                catch (e) {
                    throw Error(resultString);
                }
            }
        });
    }
    getContainerByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name.startsWith('/'))
                name = '/' + name;
            const ctnerInfos = yield this.docker.listContainers({ all: true });
            // console.log(ctnerInfos)
            let found = ctnerInfos.find(i => i.Names.includes(name));
            if (found)
                return this.docker.getContainer(found.Id);
            else
                return undefined;
        });
    }
    getContainer(agentModel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!agentModel) {
                throw new Error('agent not assigned');
            }
            let container = undefined;
            if (agentModel['id']) {
                container = this.docker.getContainer(agentModel['id']);
            }
            else {
                container = yield this.getContainerByName(agentModel['name']);
            }
            if (!container) {
                let simpleAgent = (({ name, id }) => ({ name, id }))(agentModel);
                throw new Error(`container not found: name: ${simpleAgent}`);
            }
            return container;
        });
    }
    isAgentRunning() {
        return __awaiter(this, void 0, void 0, function* () {
            let agentModel = this.getModel()['_agent'];
            if (!agentModel) {
                throw new Error('agent not assigned');
            }
            let isRunning = yield this.isContainerRunning(agentModel);
            if (isRunning) {
                this.getAgent().status = 'running';
                return true;
            }
            else {
                this.getAgent().status = 'stopped';
                return false;
            }
        });
    }
    isContainerRunning(model) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let container = yield this.getContainer(model);
                return (_a = (yield (container === null || container === void 0 ? void 0 : container.inspect()))) === null || _a === void 0 ? void 0 : _a.State.Running;
            }
            catch (e) {
                return false;
            }
        });
    }
}
exports.DockerAdapter = DockerAdapter;
