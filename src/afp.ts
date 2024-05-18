export interface AfpOptions {
    method?: string;
    headers?: { [key: string]: string };
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
    doesFileExist?:  boolean;
    data?: any;
}

export class Afp {
    private defaultOptions: AfpOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
        timeout: 10000,
        before: () => { },
        after: () => { },
        complet: () => { },
        onerror: () => { },
        success: () => { },
        onProgress: () => { },
        onAbort: () => { },
        cache: 'default',
        appendTimestamp: false,
        timestampParam: '_',
        doesFileExist: false,
    };

    public async send(url: string, options: AfpOptions = {}): Promise<any> {
        if (!url) throw new Error('URL is required');

        const finalOptions: AfpOptions = { ...this.defaultOptions, ...options };

        // Optionally check if file exists with HEAD request
        if (finalOptions.doesFileExist) {
            try {
                const fileExists = await fetch(url, { method: 'HEAD' });
                if (!fileExists) throw new Error('File does not exist');
            } catch (error) {
                console.error('Request failed:', error);
                return false;
            }
        }

        // Append timestamp to URL to prevent caching
        if (finalOptions.appendTimestamp && finalOptions.timestampParam) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${finalOptions.timestampParam}=${new Date().getTime()}`;
        }

        // Handle response type
        const handleResponse = async (response: Response) => {
            if (!response.ok) throw new Error(`Network response error: ${response.statusText}`);
            let responseData;
            switch (finalOptions.responseType) {
                case 'json':
                    responseData = await response.json();
                    break;
                case 'text':
                    responseData = await response.text();
                    break;
                case 'blob':
                    responseData = await response.blob();
                    break;
                case 'arraybuffer':
                    responseData = await response.arrayBuffer();
                    break;
                case 'document':
                    responseData = await parseDocumentResponse(response);
                    break;
                case 'xml':
                    responseData = await parseXmlResponse(response);
                    break;
                default:
                    responseData = await response.text();
                    break;
            }
            return responseData;
        };

        const parseDocumentResponse = async (response: Response): Promise<Document> => {
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('text/html')) {
                throw new Error('Response content type is not HTML document');
            }
            return await response.text().then(str => new DOMParser().parseFromString(str, 'text/html'));
        };

        const parseXmlResponse = async (response: Response): Promise<Document> => {
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('text/xml')) {
                throw new Error('Response content type is not XML document');
            }
            return await response.text().then(str => new DOMParser().parseFromString(str, 'text/xml'));
        };

        // Configure request
        const fetchOptions: RequestInit = {
            method: finalOptions.method,
            headers: finalOptions.headers,
        };

        if (finalOptions.data instanceof FormData) {
            fetchOptions.body = finalOptions.data;
        } else if (finalOptions.data) {
            fetchOptions.body = JSON.stringify(finalOptions.data);
        }

        // Set timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), finalOptions.timeout)
        );

        try {
            if (finalOptions.before) finalOptions.before();
            const response = await Promise.race([
                fetch(url, fetchOptions),
                timeoutPromise
            ]);

            const responseData = await handleResponse(response);
            if (finalOptions.after) finalOptions.after();

            if (finalOptions.cache !== 'default') {
                localStorage.setItem(url, JSON.stringify({ timestamp: new Date().getTime(), data: responseData }));
            }

            if (finalOptions.success) finalOptions.success(responseData);
            return responseData;
        } catch (error) {
            if (finalOptions.onerror) finalOptions.onerror(error as Error);
            throw error;
        } finally {
            if (finalOptions.complet) finalOptions.complet();
        }
    }
}
