import { request } from '@umijs/max';


export async function getDeptList(options) {
    return request(`/api/dept/list`, {
        method: 'GET',
        ...(options || {}),
    });
}

export async function updateDept(body, options) {
    return request('/api/dept/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

