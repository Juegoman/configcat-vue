import {
    DataGovernance,
    IConfigCatClient,
    IConfigCatLogger,
    LogLevel,
    ProjectConfig,
    createClientWithManualPoll,
    createClientWithLazyLoad,
    createClientWithAutoPoll,
    createConsoleLogger,
    IAutoPollOptions,
    ILazyLoadingOptions,
    IManualPollOptions,
} from "configcat-common";
import { RolloutEvaluator } from "configcat-common/lib/RolloutEvaluator";
import { HttpConfigFetcher } from "./ConfigFetcher";
import { LocalStorageCache } from "./Cache";
import { VueConstructor } from "vue";

/**
 * Create an instance of ConfigCatClient and setup Auto polling.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Auto polling
 */
function clientAutoPoll(sdkKey: string, cache: LocalStorageCache, options?: IAutoPollOptions): IConfigCatClient {
    return createClientWithAutoPoll(sdkKey, { configFetcher: new HttpConfigFetcher(), cache }, options);
}

/**
 * Create an instance of ConfigCatClient and setup Manual polling.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Manual polling
 */
function clientManualPoll(sdkKey: string, cache: LocalStorageCache, options?: IManualPollOptions): IConfigCatClient {
    return createClientWithManualPoll(
        sdkKey,
        {
            configFetcher: new HttpConfigFetcher(),
            cache,
        },
        options,
    );
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
export function makeConsoleLogger(logLevel: LogLevel): IConfigCatLogger {
    return createConsoleLogger(logLevel);
}

export const DataGovernanceValues = {
    /** Select this if your feature flags are published to all global CDN nodes. */
    Global: DataGovernance.Global,
    /** Select this if your feature flags are published to CDN nodes only in the EU. */
    EuOnly: DataGovernance.EuOnly,
};
export type ConfigcatOptionsCombined = {
    // common
    logger?: IConfigCatLogger;
    requestTimeoutMs?: number;
    baseUrl?: string;
    /** You can set a base_url if you want to use a proxy server between your application and ConfigCat */
    proxy?: string;
    /** Default: Global. Set this parameter to be in sync with the Data Governance preference on the Dashboard:
     * https://app.configcat.com/organization/data-governance (Only Organization Admins have access) */
    dataGovernance?: DataGovernance;
    // auto
    pollIntervalSeconds?: number;
    maxInitWaitTimeSeconds?: number;
    configChanged?: () => void;
    // lazy
    // cacheTimeToLiveSeconds?: number;
};
export type VueConfigcatOptions = {
    SDK_KEY: string;
    POLLING_MODE?: string;
    options?: ConfigcatOptionsCombined;
};
const VueConfigcat = {
    install(Vue: VueConstructor, vueOptions: VueConfigcatOptions = { SDK_KEY: null }): void {
        const { SDK_KEY, POLLING_MODE, options } = vueOptions;
        const configcatVueData = Vue.observable({
            user: {
                identifier: "default",
                email: null,
                country: null,
                custom: null,
            },
            cache: null,
            refreshing: false,
        });
        const onCacheUpdate = (cache) => {
            configcatVueData.cache = cache;
            if (configcatVueData.refreshing) configcatVueData.refreshing = false;
        };
        // const cacheTTL =
        //     options && options.cacheTimeToLiveSeconds && options.cacheTimeToLiveSeconds > 0
        //         ? options.cacheTimeToLiveSeconds * 1000
        //         : 60;
        const evaluator = new RolloutEvaluator(options ? options.logger : createConsoleLogger(-1));
        const configcatCache = new LocalStorageCache(onCacheUpdate);
        let configcatClient;
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
            getCachedValue(key, defaultValue) {
                const configData: ProjectConfig = this.cache;
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
            async getValue(key, defaultValue) {
                await this.client.getValueAsync(key, defaultValue, this.user);
            },
            setUser({ identifier, email, country, custom }) {
                this.user.identifier = identifier || this.user.identifier;
                this.user.email = email || this.user.email;
                this.user.country = country || this.user.country;
                this.user.custom = custom || this.user.custom;
            },
        };
        Vue.directive("feature-flag", {
            update(el, { value }, vNode) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const result = vNode.context.$configcat.getCachedValue(value, false);
                el.style.display = !result ? "none" : null;
            },
        });
        Vue.mixin({
            watch: {
                "$configcat.cache"() {
                    this.$forceUpdate();
                },
            },
        });
    },
};

export default VueConfigcat;
