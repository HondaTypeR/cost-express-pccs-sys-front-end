import { request } from '@umijs/max';


export async function getDeptList(options) {
    return request(`/api/dept/list`, {
        method: 'GET',
        ...(options || {}),
    });
}

export async function fetchDeptOptions() {
    const res = await getDeptList();
    const list = Array.isArray(res?.data) ? res.data : [];
    const nameMap = new Map();
    const idMap = new Map();

    list.forEach((item) => {
        const name = item?.dept_name;
        const id = item?.dept_id;
        if (id == null || !name) return;
        const value = String(id);
        idMap.set(value, { label: name, value });
        if (!nameMap.has(name)) {
            nameMap.set(name, { label: name, value });
        }
    });

    return {
        deptList: Array.from(nameMap.values()),
        allDeptOptions: Array.from(idMap.values()),
    };
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
export async function addDept(body, options) {
    return request('/api/dept/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
export async function deleteDept(body, options) {
    return request('/api/dept/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

