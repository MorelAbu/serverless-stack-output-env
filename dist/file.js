"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var StackOutputFile = /** @class */ (function () {
    function StackOutputFile(path) {
        this.path = path;
    }
    StackOutputFile.prototype.format = function (data) {
        var ext = this.path.split('.').pop() || '';
        switch (ext.toUpperCase()) {
            case 'JSON':
                return JSON.stringify(data, null, 2);
            case 'TOML':
                return require('tomlify-j0.4')(data, null, 0);
            case 'YAML':
            case 'YML':
                return require('yamljs').stringify(data);
            case 'ENV':
                return Object.keys(data).map(function (key) { return "REACT_APP_" + key + "=" + data[key]; }).join('\n');
            default:
                throw new Error('No formatter found for `' + ext + '` extension');
        }
    };
    StackOutputFile.prototype.save = function (data) {
        var content = this.format(data);
        try {
            fs.writeFileSync(this.path, content);
        }
        catch (e) {
            throw new Error('Cannot write to file: ' + this.path);
        }
        return Promise.resolve();
    };
    return StackOutputFile;
}());
exports.default = StackOutputFile;
