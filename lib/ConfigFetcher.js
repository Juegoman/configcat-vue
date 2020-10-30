"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpConfigFetcher = void 0;
var configcat_common_1 = require("configcat-common");
var HttpConfigFetcher = /** @class */ (function () {
    function HttpConfigFetcher() {
    }
    HttpConfigFetcher.prototype.fetchLogic = function (options, lastProjectConfig, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                var etag = httpRequest.getResponseHeader("ETag");
                if (httpRequest.status === 200) {
                    callback(new configcat_common_1.ProjectConfig(new Date().getTime(), httpRequest.responseText, etag));
                }
                else if (httpRequest.status === 304) {
                    callback(new configcat_common_1.ProjectConfig(new Date().getTime(), JSON.stringify(lastProjectConfig.ConfigJSON), etag));
                }
                else {
                    options.logger.error("Failed to download feature flags & settings from ConfigCat. " + httpRequest.status + " - " + httpRequest.statusText);
                    callback(lastProjectConfig);
                }
            }
        };
        httpRequest.open("GET", options.getUrl(), true);
        httpRequest.timeout = options.requestTimeoutMs;
        httpRequest.setRequestHeader("X-ConfigCat-UserAgent", "ConfigCat-JS/" + options.clientVersion);
        httpRequest.setRequestHeader("Cache-Control", "no-cache"); // any locally cached version isn't trusted without the server's say-so
        if (lastProjectConfig && lastProjectConfig.HttpETag) {
            httpRequest.setRequestHeader("If-None-Match", lastProjectConfig.HttpETag);
        }
        httpRequest.send(null);
    };
    return HttpConfigFetcher;
}());
exports.HttpConfigFetcher = HttpConfigFetcher;
