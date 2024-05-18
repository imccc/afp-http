# AFP - Async Fetch Promise

`version 1.0.5`

## 介绍

`afp` 是一个提供高级选项的异步 HTTP 请求模块，它包含一个主要方法 `send`。`send` 方法允许用户执行 HTTP 请求并提供各种配置选项，以便更灵活地处理请求和响应。以下是 `afp` 的详细功能解释：

### `afp` 对象

`afp` 对象包含一个方法 `send`，用于发送 HTTP 请求。

### `send` 方法

#### 参数

- `url` (string): 请求的 URL 地址。这个参数是必需的。
- `options` (object): 请求的配置选项。这个参数是可选的，默认值为一个空对象 `{}`。

#### 返回值

返回一个解析响应数据的 Promise。

#### 配置选项 (`options`)

- `method` (string): 请求的方法，如 `GET`、`POST`、`PUT` 等。默认值是 `GET`。
- `headers` (object): 请求头的键值对对象。默认值是 `{ 'Content-Type': 'application/json' }`。
- `responseType` (string): 响应的数据类型。支持 `json`、`text`、`blob`、`arraybuffer`、`document`、`xml`。默认值是 `json`。
- `timeout` (number): 请求的超时时间（毫秒）。默认值是 `10000`（10秒）。
- `before` (function): 请求前执行的回调函数。
- `after` (function): 请求后执行的回调函数。
- `complet` (function): 请求完成后（无论成功或失败）执行的回调函数。
- `onerror` (function): 请求失败时的回调函数。
- `success` (function): 请求成功时的回调函数。
- `onProgress` (function): 进度事件处理函数。
- `onAbort` (function): 请求取消时的回调函数。
- `cache` (string): 缓存策略。默认值是 `default`。
- `appendTimestamp` (boolean): 是否在 URL 中附加时间戳以防止缓存。默认值是 `false`。
- `timestampParam` (string): 时间戳参数名称。默认值是 `_`。
- `doesFileExist` (function): 检查文件是否存在的函数。如果设置为 `true`，将会使用 `HEAD` 请求检查文件是否存在。

#### 实现细节

1. **URL 必须性检查**:
   如果未提供 URL 参数，会抛出错误。

2. **合并选项**:
   将默认选项与用户提供的选项合并，以形成最终的配置选项。

3. **可选的文件存在性检查**:
   如果提供了 `doesFileExist` 函数，首先执行 `HEAD` 请求检查文件是否存在。

4. **附加时间戳**:
   如果 `appendTimestamp` 为 `true`，将在 URL 中附加时间戳参数，以防止缓存。

5. **处理响应类型**:
   根据 `responseType` 配置项处理响应数据。支持 `json`、`text`、`blob`、`arraybuffer`、`document`、`xml`。

6. **配置请求**:
   根据选项配置请求，如 `headers`、`method`、`body` 等。

7. **设置超时**:
   创建一个超时 Promise，当请求超过指定时间时会自动拒绝。

8. **执行请求**:
   使用 `fetch` 发送请求，并与超时 Promise 竞赛。

9. **处理响应数据**:
   根据响应类型解析响应数据，并在成功时调用 `success` 回调函数。

10. **错误处理**:
    如果请求失败，调用 `onerror` 回调函数。

11. **完成处理**:
    无论请求成功还是失败，都会调用 `complet` 回调函数。


### 总结

`afp` 模块提供了一个强大且灵活的 `send` 方法，允许用户在发送 HTTP 请求时配置各种选项，包括请求头、响应类型、超时、回调函数等。这使得 `afp` 模块适用于各种复杂的请求场景，满足不同的需求。


## Github
```
https://github.com/imccc/afp-http.git
```

## Installation
```bash
npm install afp-http
```

## Usage
```js
import afp from 'afp-http';
```

## Script
```html
<script src="afp.js"></script>
```

## AMD
```js
require(['path/to/afp'], function (afp) {
  const options = {
    method: 'GET',
    success: (data) => console.log('请求成功:', data),
    onerror: (error) => console.error('请求失败:', error),
  };

  afp.send('https://jsonplaceholder.typicode.com/posts', options);
});
```

## CommonJS
```js
const afp = require('path/to/afp');
const options = {
  method: 'GET',
  success: (data) => console.log('请求成功:', data),
  onerror: (error) => console.error('请求失败:', error),
};

afp.send('https://jsonplaceholder.typicode.com/posts', options);
```