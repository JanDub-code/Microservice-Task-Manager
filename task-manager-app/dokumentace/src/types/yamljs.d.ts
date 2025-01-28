declare module 'yamljs' {
    const parse: (yamlString: string) => any;
    const stringify: (obj: any, inline?: number, spaces?: number) => string;
    const load: (filePath: string) => any;
    const loadAll: (filePath: string, iterator?: (doc: any) => void, ctx?: any) => any[];

    export { parse, stringify, load, loadAll };
}
