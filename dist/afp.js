"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Afp = void 0;
class Afp {
    constructor() {
        this.defaultOptions = {
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
    }
    send(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            if (!url)
                throw new Error('URL is required');
            const finalOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
            // Optionally check if file exists with HEAD request
            if (finalOptions.doesFileExist) {
                try {
                    const fileExists = yield fetch(url, { method: 'HEAD' });
                    if (!fileExists)
                        throw new Error('File does not exist');
                }
                catch (error) {
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
            const handleResponse = (response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok)
                    throw new Error(`Network response error: ${response.statusText}`);
                let responseData;
                switch (finalOptions.responseType) {
                    case 'json':
                        responseData = yield response.json();
                        break;
                    case 'text':
                        responseData = yield response.text();
                        break;
                    case 'blob':
                        responseData = yield response.blob();
                        break;
                    case 'arraybuffer':
                        responseData = yield response.arrayBuffer();
                        break;
                    case 'document':
                        responseData = yield parseDocumentResponse(response);
                        break;
                    case 'xml':
                        responseData = yield parseXmlResponse(response);
                        break;
                    default:
                        responseData = yield response.text();
                        break;
                }
                return responseData;
            });
            const parseDocumentResponse = (response) => __awaiter(this, void 0, void 0, function* () {
                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('text/html')) {
                    throw new Error('Response content type is not HTML document');
                }
                return yield response.text().then(str => new DOMParser().parseFromString(str, 'text/html'));
            });
            const parseXmlResponse = (response) => __awaiter(this, void 0, void 0, function* () {
                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('text/xml')) {
                    throw new Error('Response content type is not XML document');
                }
                return yield response.text().then(str => new DOMParser().parseFromString(str, 'text/xml'));
            });
            // Configure request
            const fetchOptions = {
                method: finalOptions.method,
                headers: finalOptions.headers,
            };
            if (finalOptions.data instanceof FormData) {
                fetchOptions.body = finalOptions.data;
            }
            else if (finalOptions.data) {
                fetchOptions.body = JSON.stringify(finalOptions.data);
            }
            // Set timeout
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), finalOptions.timeout));
            try {
                if (finalOptions.before)
                    finalOptions.before();
                const response = yield Promise.race([
                    fetch(url, fetchOptions),
                    timeoutPromise
                ]);
                const responseData = yield handleResponse(response);
                if (finalOptions.after)
                    finalOptions.after();
                if (finalOptions.cache !== 'default') {
                    localStorage.setItem(url, JSON.stringify({ timestamp: new Date().getTime(), data: responseData }));
                }
                if (finalOptions.success)
                    finalOptions.success(responseData);
                return responseData;
            }
            catch (error) {
                if (finalOptions.onerror)
                    finalOptions.onerror(error);
                throw error;
            }
            finally {
                if (finalOptions.complet)
                    finalOptions.complet();
            }
        });
    }
}
exports.Afp = Afp;
