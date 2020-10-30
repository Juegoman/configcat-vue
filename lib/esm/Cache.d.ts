import { ICache, ProjectConfig } from "configcat-common";
export declare class LocalStorageCache implements ICache {
    cache: {
        [key: string]: ProjectConfig;
    };
    private readonly onCacheUpdate;
    constructor(onCacheUpdate: (cache: ProjectConfig) => void);
    set(key: string, config: ProjectConfig): void;
    get(key: string): ProjectConfig;
}
//# sourceMappingURL=Cache.d.ts.map