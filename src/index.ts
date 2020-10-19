import * as configcatcommon from "configcat-common";
import { HttpConfigFetcher } from "./ConfigFetcher";
import { DataGovernance, IConfigCatClient, IConfigCatLogger, LogLevel, ProjectConfig } from "configcat-common";
import { LocalStorageCache } from "./Cache";
import { RolloutEvaluator } from "configcat-common/lib/RolloutEvaluator";
import { VueConstructor } from "vue";
import { IOptions } from "configcat-common/lib/ConfigCatClientOptions";

/**
 * Create an instance of ConfigCatClient and setup Auto polling with default options.
 * @param {string} sdkkey - SDK Key to access your configuration.
 * @param options - Options for Auto polling
 */
// export function createClient(sdkkey: string, options?: IJSAutoPollOptions): IConfigCatClient {
//     return createClientWithAutoPoll(sdkkey, options);
// }

/**
 * Create an instance of ConfigCatClient and setup Auto polling.
 * @param {string} sdkkey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Auto polling
 */
export function createClientWithAutoPoll(
    sdkKey: string,
    cache: LocalStorageCache,
    options?: IJSAutoPollOptions,
): IConfigCatClient {
    return configcatcommon.createClientWithAutoPoll(sdkKey, { configFetcher: new HttpConfigFetcher(), cache }, options);
}

/**
 * Create an instance of ConfigCatClient and setup Manual polling.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Manual polling
 */
export function createClientWithManualPoll(
    sdkKey: string,
    cache: LocalStorageCache,
    options?: IJSManualPollOptions,
): IConfigCatClient {
    return configcatcommon.createClientWithManualPoll(
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
export function createClientWithLazyLoad(
    sdkKey: string,
    cache: LocalStorageCache,
    options?: IJSLazyLoadingOptions,
): IConfigCatClient {
    return configcatcommon.createClientWithLazyLoad(sdkKey, { configFetcher: new HttpConfigFetcher(), cache }, options);
}

export function createConsoleLogger(logLevel: LogLevel): configcatcommon.IConfigCatLogger {
    return configcatcommon.createConsoleLogger(logLevel);
}

export type IJSAutoPollOptions = configcatcommon.IAutoPollOptions;

export type IJSLazyLoadingOptions = configcatcommon.ILazyLoadingOptions;

export type IJSManualPollOptions = configcatcommon.IManualPollOptions;

export const DataGovernanceValues = {
    /** Select this if your feature flags are published to all global CDN nodes. */
    Global: configcatcommon.DataGovernance.Global,
    /** Select this if your feature flags are published to CDN nodes only in the EU. */
    EuOnly: configcatcommon.DataGovernance.EuOnly,
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
            //     configcatClient = createClientWithLazyLoad(SDK_KEY, configcatCache, options);
            //     break;
            case "manual":
                configcatClient = createClientWithManualPoll(SDK_KEY, configcatCache, options);
                break;
            case "auto":
            default:
                configcatClient = createClientWithAutoPoll(SDK_KEY, configcatCache, options);
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
                    console.log("cache updated");
                    this.$forceUpdate();
                },
            },
        });
    },
};

export default VueConfigcat;
