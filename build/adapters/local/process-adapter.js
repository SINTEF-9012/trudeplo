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
exports.ProcessAdapter = void 0;
const fs_1 = __importDefault(require("fs"));
const abstract_adapter_1 = require("../abstract-adapter");
const LOCAL_PATH = './ext/forprocess';
class ProcessAdapter extends abstract_adapter_1.AbstractAdapter {
    getWorkingPath() {
        return `${LOCAL_PATH}/${this.getModel()['host']}`;
    }
    getFilePath() {
        let path = this.getWorkingPath();
        let fileName = this.getAgent()['remoteFile'];
        let filePath = `${path}/${fileName}`;
        return filePath;
    }
    constructor(model) {
        super(model);
        let host = model.host;
        try {
            fs_1.default.mkdirSync(`${LOCAL_PATH}/${host}`);
        }
        catch (e) {
            console.log('folder exists');
        }
    }
    _ping() {
        return __awaiter(this, void 0, void 0, function* () {
            let path = this.getWorkingPath();
            return fs_1.default.existsSync(path);
        });
    }
    _info() {
        return __awaiter(this, void 0, void 0, function* () {
            return `${process.title} ${process.version} at ${process.platform} on ${process.arch}. Working path: ${this.getWorkingPath()}`;
        });
    }
    loadAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.getFilePath();
            fs_1.default.writeFileSync(filePath, '');
            return this.getAgent();
        });
    }
    runAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.getFilePath();
            fs_1.default.writeFileSync(filePath, 'running');
            return this.getAgent();
        });
    }
    stopAgent() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.getFilePath();
            fs_1.default.writeFileSync(filePath, 'stopped');
            return this.getAgent();
        });
    }
    isAgentRunning() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.getFilePath();
            let content = fs_1.default.readFileSync(filePath, 'utf-8');
            return content == 'running';
        });
    }
}
exports.ProcessAdapter = ProcessAdapter;
