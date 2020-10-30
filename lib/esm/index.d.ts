import { DataGovernance, IConfigCatLogger, LogLevel } from "configcat-common";
import { VueConstructor } from "vue";
/**
 * Create an instance of ConfigCatClient and setup Lazy loading.
 * @param {string} sdkKey - SDK Key to access your configuration.
 * @param cache - cache
 * @param options - Options for Lazy loading
 */
/**
 * alias for createConsoleLogger configcat function
 * @param logLevel
 */
export declare function makeConsoleLogger(logLevel: LogLevel): IConfigCatLogger;
export declare const DataGovernanceValues: {
    /** Select this if your feature flags are published to all global CDN nodes. */
    Global: DataGovernance;
    /** Select this if your feature flags are published to CDN nodes only in the EU. */
    EuOnly: DataGovernance;
};
export declare type ConfigcatOptionsCombined = {
    logger?: IConfigCatLogger;
    requestTimeoutMs?: number;
    baseUrl?: string;
    /** You can set a base_url if you want to use a proxy server between your application and ConfigCat */
    proxy?: string;
    /** Default: Global. Set this parameter to be in sync with the Data Governance preference on the Dashboard:
     * https://app.configcat.com/organization/data-governance (Only Organization Admins have access) */
    dataGovernance?: DataGovernance;
    pollIntervalSeconds?: number;
    maxInitWaitTimeSeconds?: number;
    configChanged?: () => void;
};
export declare type VueConfigcatOptions = {
    SDK_KEY: string;
    POLLING_MODE?: string;
    options?: ConfigcatOptionsCombined;
};
declare const VueConfigcat: {
    install(Vue: VueConstructor, vueOptions?: VueConfigcatOptions): void;
};
export default VueConfigcat;
//# sourceMappingURL=index.d.ts.map