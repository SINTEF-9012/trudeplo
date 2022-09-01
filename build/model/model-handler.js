"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFromYaml = exports.resolveInheritSingle = exports.clean = void 0;
const yaml_1 = require("yaml");
const fs_1 = require("fs");
const PARENT_KEYWORD = '_from';
function clean(element) {
    delete element[PARENT_KEYWORD];
    Object.keys(element).forEach(key => {
        if (element[key].toString().startsWith('__')) {
            element[key] = undefined;
        }
    });
    return element;
}
exports.clean = clean;
function getParent(child, raw) {
    let parentId = child[PARENT_KEYWORD];
    if (parentId) {
        let id = parentId;
        if (id in raw['devices']) {
            return raw['devices'][id];
        }
        else if (id in raw['agents'])
            return raw['agents'][id];
        else
            return raw['types'][id];
    }
}
function resolveInheritSingle(child, raw) {
    if (child) {
        let childstr = child;
        Object.keys(childstr).forEach(key => {
            let value = childstr[key];
            if (typeof (value) == 'object' && '_from' in value) {
                childstr[key] = clean(resolveInheritSingle(value, raw));
            }
        });
        return Object.assign(Object.assign({}, resolveInheritSingle(getParent(child, raw), raw)), child);
    }
    else
        return {};
}
exports.resolveInheritSingle = resolveInheritSingle;
function loadFromYaml(filePath) {
    const text = (0, fs_1.readFileSync)(filePath, 'utf-8');
    const raw = (0, yaml_1.parse)(text);
    let result = { devices: {}, agents: {} };
    ['devices', 'agents'].forEach(key => {
        Object.keys(raw[key]).forEach(elemKey => {
            result[key][elemKey] = clean(resolveInheritSingle(raw[key][elemKey], raw));
        });
    });
    return result;
}
exports.loadFromYaml = loadFromYaml;
