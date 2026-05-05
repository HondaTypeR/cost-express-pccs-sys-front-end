// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 登录接口 POST /api/login/account */
export async function login(body, options) {
    return request('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function loginOut(body, options) {
    localStorage.removeItem('token');
    return request('/api/auth/logout', {
        method: 'GET',
        ...(options || {}),
    });
}