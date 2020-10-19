import { ICache, ProjectConfig } from "configcat-common";

export class LocalStorageCache implements ICache {
    cache: { [key: string]: ProjectConfig } = {};
    private readonly onCacheUpdate: (cache: ProjectConfig) => void;
    constructor(onCacheUpdate: (cache: ProjectConfig) => void) {
        this.onCacheUpdate = onCacheUpdate;
    }

    set(key: string, config: ProjectConfig): void {
        this.cache[key] = config;

        try {
            localStorage.setItem(key, btoa(JSON.stringify(config)));
        } catch (ex) {
            // local storage is unavailable
        }
        this.onCacheUpdate(config);
    }

    get(key: string): ProjectConfig {
        const config: ProjectConfig = this.cache[key];
        if (config) {
            return config;
        }

        try {
            const configString: string = localStorage.getItem(key);
            if (configString) {
                const { timestamp, ConfigJSON, HttpETag } = JSON.parse(atob(configString));
                const config: ProjectConfig = new ProjectConfig(timestamp, ConfigJSON, HttpETag);
                if (config) {
                    this.cache[key] = config;
                    this.onCacheUpdate(config);
                    return config;
                }
            }
        } catch (ex) {
            // local storage is unavailable or invalid cache value in localstorage
        }

        return null;
    }
}
