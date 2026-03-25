import { request } from '@umijs/max';

export async function listContract(body, options) {
    return request('/api/contract/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
export async function getContractRelated(contract_id, options) {
    return request(`/api/contract/${contract_id}/related`, {
        method: 'GET',
        ...(options || {}),
    });
}

export async function addContract(body, options) {
    return request('/api/contract/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateContract(body, options) {
    return request('/api/contract/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function deleteContract(body, options) {
    return request('/api/contract/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 获取子合同相关
export async function subListContract(body, options) {
    return request('/api/sub/contract/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
export async function getSubContractRelated(body, options) {
    return request(`/api/sub/contract/getRelatedData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function subAddContract(body, options) {
    return request('/api/sub/contract/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function subUpdateContract(body, options) {
    return request('/api/sub/contract/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function subDeleteContract(body, options) {
    return request('/api/sub/contract/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
