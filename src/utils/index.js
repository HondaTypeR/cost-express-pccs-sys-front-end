// 示例 URL：https://xxx.com?name=张三&age=20&id=123
export function getUrlParam(key) {
    // 创建 URLSearchParams 对象，解析当前页面的查询参数
    const params = new URLSearchParams(window.location.search);
    return params.get(key); // 返回对应值，没有则返回 null
}

export { checkPower } from './checkPower';