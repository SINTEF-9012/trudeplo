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
exports.SshAdapter = void 0;
const node_ssh_1 = require("node-ssh");
const abstract_adapter_1 = require("../abstract-adapter");
class SshAdapter extends abstract_adapter_1.AbstractAdapter {
    constructor(device) {
        super(device);
        this.ssh = new node_ssh_1.NodeSSH();
        // console.log(device)
        this.connPromise = this.ssh.connect({
            host: device.host,
            username: device['execEnv']['username'],
            password: device['execEnv']['password']
        });
    }
    getSshDevice() {
        return this.getModel();
    }
    getConn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.conn) {
                this.conn = yield this.connPromise;
            }
            return this.conn;
        });
    }
    _ping() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this._info();
            return result.length > 0;
        });
    }
    _info() {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConn();
            const result = yield conn.execCommand('uname -a');
            const info = result.stdout;
            const infoArray = info.split(' ');
            this.getModel().attribute.arch = infoArray[infoArray.length - 2];
            return info;
        });
    }
    loadAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConn();
            const agent = this.getAgent();
            const result = yield conn.putFile(agent.localFile, `${agent.cwd}/${agent.remoteFile}`);
            const chmod = yield conn.execCommand(`chmod a+x ./${agent.remoteFile}`, { cwd: agent.cwd });
            console.log(chmod.stdout);
        });
    }
    runAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConn();
            const agent = this.getAgent();
            let result = yield conn.execCommand(agent.cmd, { cwd: agent.cwd });
            return result.stdout;
        });
    }
    stopAgent() {
        throw new Error("Method not implemented.");
    }
    isAgentRunning() {
        throw new Error("Method not implemented.");
    }
}
exports.SshAdapter = SshAdapter;
