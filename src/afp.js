(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
        factory();
})((function () {
    'use strict';

    /**
     * 执行一个带高级选项的异步HTTP请求。
     * @param {string} url - 请求的URL地址。
     * @param {object} options - 请求配置选项。
     * @returns {Promise} 返回一个解析响应数据的promise。
     */
    const send = async (url, options = {}) => {
        if (!url) throw new Error('URL是必须的');

        const defaultOptions = {
            method: 'GET', // 默认方法是GET
            headers: { 'Content-Type': 'application/json' },
            responseType: 'json',
            timeout: 10000, // 默认超时时间是10秒
            before: null, // 请求前执行的函数
            after: null, // 请求后执行的函数
            complet: null, // 请求完成后执行的函数
            onerror: null, // 错误处理函数
            success: null, // 成功响应处理函数
            onProgress: null, // 进度事件处理函数
            onAbort: null, // 取消请求后处理函数
            cache: 'default', // 缓存策略
            appendTimestamp: false, // 是否在URL中附加时间戳以防缓存
            timestampParam: '_', // 时间戳参数名称
            doesFileExist: null, // 检查文件是否存在的函数
        };

        const finalOptions = { ...defaultOptions, ...options };

        // 可选地通过HEAD请求检查文件是否存在
        if (finalOptions.doesFileExist) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                return response.ok; // 如果状态码是200-299，则返回true
            } catch (error) {
                console.error('请求失败:', error);
                return false;
            }
        }

        // 为防止缓存在URL中附加时间戳
        if (finalOptions.appendTimestamp && finalOptions.timestampParam) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${finalOptions.timestampParam}=${new Date().getTime()}`;
        }

        // 处理响应类型
        const handleResponse = async (response) => {
            if (!response.ok) throw new Error(`网络响应错误: ${response.statusText}`);
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

        const parseDocumentResponse = async (response) => {
            if (!response.headers.get('Content-Type').includes('text/html')) {
                throw new Error('响应的内容类型不是HTML文档');
            }
            return await response.text().then(str => new DOMParser().parseFromString(str, "text/html"));
        };

        const parseXmlResponse = async (response) => {
            if (!response.headers.get('Content-Type').includes('text/xml')) {
                throw new Error('响应的内容类型不是XML文档');
            }
            return await response.text().then(str => new DOMParser().parseFromString(str, "text/xml"));
        };

        // 配置请求
        if (finalOptions.data instanceof FormData) {
            finalOptions.headers['Content-Type'] = 'multipart/form-data';
            finalOptions.body = finalOptions.data;
        } else if (finalOptions.data) {
            finalOptions.body = JSON.stringify(finalOptions.data);
        }

        // 设置超时
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('请求超时')), finalOptions.timeout));

        try {
            if (finalOptions.before) finalOptions.before();
            const response = await Promise.race([
                fetch(url, finalOptions),
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
            if (finalOptions.onerror) finalOptions.onerror(error);
            throw error;
        } finally {
            if (finalOptions.complet) finalOptions.complet();
        }
    }

    /**
     * ------------------------------------------------------------------------
     * WandJS Class
     * ------------------------------------------------------------------------
     */

    const afp = {
        send: send, 
    };
    return afp;
}));
