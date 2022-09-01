"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdapter = void 0;
const docker_adapter_1 = require("./docker/docker-adapter");
const ssh_adapter_1 = require("./ssh/ssh-adapter");
function createAdapter(device) {
    const env = device.execEnv;
    if (env.name == 'docker_engine') {
        return new docker_adapter_1.DockerAdapter(device);
    }
    if (env.name == 'ssh') {
        return new ssh_adapter_1.SshAdapter(device);
    }
    else {
        throw new Error('no adapter available');
    }
}
exports.createAdapter = createAdapter;
