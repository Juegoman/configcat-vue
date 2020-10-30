import { IConfigFetcher, ProjectConfig, OptionsBase } from "configcat-common";
export declare class HttpConfigFetcher implements IConfigFetcher {
    fetchLogic(options: OptionsBase, lastProjectConfig: ProjectConfig, callback: (newProjectConfig: ProjectConfig) => void): void;
}
export default IConfigFetcher;
//# sourceMappingURL=ConfigFetcher.d.ts.map