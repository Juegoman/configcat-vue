var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { DataGovernance, createClientWithManualPoll, createClientWithAutoPoll, createConsoleLogger, } from "configcat-common";
import { RolloutEvaluator } from "configcat-common/lib/RolloutEvaluator";
import { HttpConfigFetcher } from "./ConfigFetcher";
import { LocalStorageCache } from "./Cache";
/**
 * Create an instance of ConfigCatClient and setup Auto polling.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Auto polling
 */
function clientAutoPoll(sdkKey, cache, options) {
    return createClientWithAutoPoll(sdkKey, { configFetcher: new HttpConfigFetcher(), cache: cache }, options);
}
/**
 * Create an instance of ConfigCatClient and setup Manual polling.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Manual polling
 */
function clientManualPoll(sdkKey, cache, options) {
    return createClientWithManualPoll(sdkKey, {
        configFetcher: new HttpConfigFetcher(),
        cache: cache,
    }, options);
}
/**
 * Create an instance of ConfigCatClient and setup Lazy loading.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Lazy loading
 */
// function clientLazyLoad(sdkKey: string, cache: LocalStorageCache, options?: ILazyLoadingOptions): IConfigCatClient {
//     return createClientWithLazyLoad(sdkKey, { configFetcher: new HttpConfigFetcher(), cache }, options);
// }
/**
 * alias for createConsoleLogger configcat function
 * @param logLevel
 */
export function makeConsoleLogger(logLevel) {
    return createConsoleLogger(logLevel);
}
export var DataGovernanceValues = {
    /** Select this if your feature flags are published to all global CDN nodes. */
    Global: DataGovernance.Global,
    /** Select this if your feature flags are published to CDN nodes only in the EU. */
    EuOnly: DataGovernance.EuOnly,
};
var VueConfigcat = {
    install: function (Vue, vueOptions) {
        if (vueOptions === void 0) { vueOptions = { SDK_KEY: null }; }
        var SDK_KEY = vueOptions.SDK_KEY, POLLING_MODE = vueOptions.POLLING_MODE, options = vueOptions.options;
        var configcatVueData = Vue.observable({
            user: {
                identifier: "default",
                email: null,
                country: null,
                custom: null,
            },
            cache: null,
            refreshing: false,
        });
        var onCacheUpdate = function (cache) {
            configcatVueData.cache = cache;
            if (configcatVueData.refreshing)
                configcatVueData.refreshing = false;
        };
        // const cacheTTL =
        //     options && options.cacheTimeToLiveSeconds && options.cacheTimeToLiveSeconds > 0
        //         ? options.cacheTimeToLiveSeconds * 1000
        //         : 60;
        var evaluator = new RolloutEvaluator(options ? options.logger : createConsoleLogger(-1));
        var configcatCache = new LocalStorageCache(onCacheUpdate);
        var configcatClient;
        switch (POLLING_MODE) {
            // case "lazy":
            //     configcatClient = clientLazyLoad(SDK_KEY, configcatCache, options);
            //     break;
            case "manual":
                configcatClient = clientManualPoll(SDK_KEY, configcatCache, options);
                break;
            case "auto":
            default:
                configcatClient = clientAutoPoll(SDK_KEY, configcatCache, options);
                break;
        }
        Vue.prototype.$configcat = {
            get client() {
                return configcatClient;
            },
            get user() {
                return configcatVueData.user;
            },
            get cache() {
                return configcatVueData.cache;
            },
            get refreshing() {
                return configcatVueData.refreshing;
            },
            getCachedValue: function (key, defaultValue) {
                var configData = this.cache;
                // if (
                //     !this.refreshing &&
                //     POLLING_MODE === "lazy" &&
                //     (configData === null || configData.Timestamp + cacheTTL > new Date().getTime())
                // ) {
                //     configcatVueData.refreshing = true;
                //     this.client.forceRefreshAsync();
                // }
                if (configData !== null) {
                    return evaluator.Evaluate(configData, key, defaultValue, this.user).Value;
                }
                return null;
            },
            getValue: function (key, defaultValue) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.client.getValueAsync(key, defaultValue, this.user)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            },
            setUser: function (_a) {
                var identifier = _a.identifier, email = _a.email, country = _a.country, custom = _a.custom;
                this.user.identifier = identifier || this.user.identifier;
                this.user.email = email || this.user.email;
                this.user.country = country || this.user.country;
                this.user.custom = custom || this.user.custom;
            },
        };
        Vue.directive("feature-flag", {
            update: function (el, _a, vNode) {
                var value = _a.value;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                var result = vNode.context.$configcat.getCachedValue(value, false);
                el.style.display = !result ? "none" : null;
            },
        });
        Vue.mixin({
            watch: {
                "$configcat.cache": function () {
                    this.$forceUpdate();
                },
            },
        });
    },
};
export default VueConfigcat;
