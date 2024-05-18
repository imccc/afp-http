export interface AfpOptions {
    method?: string;
    headers?: {
        [key: string]: string;
    };
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'document' | 'xml';
    timeout?: number;
    before?: () => void;
    after?: () => void;
    complet?: () => void;
    onerror?: (error: Error) => void;
    success?: (response: any) => void;
    onProgress?: (event: ProgressEvent) => void;
    onAbort?: () => void;
    cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
    appendTimestamp?: boolean;
    timestampParam?: string;
    doesFileExist?: boolean;
    data?: any;
}
export declare class Afp {
    private defaultOptions;
    send(url: string, options?: AfpOptions): Promise<any>;
}
