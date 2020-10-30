"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageCache = void 0;
var configcat_common_1 = require("configcat-common");
var LocalStorageCache = /** @class */ (function () {
    function LocalStorageCache(onCacheUpdate) {
        this.cache = {};
        this.onCacheUpdate = onCacheUpdate;
    }
    LocalStorageCache.prototype.set = function (key, config) {
        this.cache[key] = config;
        try {
            localStorage.setItem(key, btoa(JSON.stringify(config)));
        }
        catch (ex) {
            // local storage is unavailable
        }
        this.onCacheUpdate(config);
    };
    LocalStorageCache.prototype.get = function (key) {
        var config = this.cache[key];
        if (config) {
            return config;
        }
        try {
            var configString = localStorage.getItem(key);
            if (configString) {
                var _a = JSON.parse(atob(configString)), timestamp = _a.timestamp, ConfigJSON = _a.ConfigJSON, HttpETag = _a.HttpETag;
                var config_1 = new configcat_common_1.ProjectConfig(timestamp, ConfigJSON, HttpETag);
                if (config_1) {
                    this.cache[key] = config_1;
                    this.onCacheUpdate(config_1);
                    return config_1;
                }
            }
        }
        catch (ex) {
            // local storage is unavailable or invalid cache value in localstorage
        }
        return null;
    };
    return LocalStorageCache;
}());
exports.LocalStorageCache = LocalStorageCache;
