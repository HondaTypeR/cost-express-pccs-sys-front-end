import { request } from '@umijs/max';

export async function addProject(body, options) {
    return request('/api/business/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
export async function updateProject(body, options) {
    return request('/api/business/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function listProject(options) {
    return request('/api/business/list', {
        method: 'GET',
        ...(options || {}),
    });
}
export async function allListMaterials(params, options) {
    return request('/api/business/all-materials', {
        method: 'GET',
        params,
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

// Comprehensive Management APIs
export async function listComprehensive(options) {
    return request('/api/business/comprehensive/list', {
        method: 'GET',
        ...(options || {}),
    });
}

export async function addComprehensive(body, options) {
    return request('/api/business/comprehensive/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateComprehensive(body, options) {
    return request('/api/business/comprehensive/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function deleteComprehensive(body, options) {
    return request('/api/business/comprehensive/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 材料 APIs
export async function listMaterial(options) {
    return request('/api/business/material/list', {
        method: 'GET',
        ...(options || {}),
    });
}

export async function addMaterial(body, options) {
    return request('/api/business/material/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateMaterial(body, options) {
    return request('/api/business/material/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function deleteMaterial(body, options) {
    return request('/api/business/material/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}


export async function submitApproval(body, options) {
    return request('/api/business/material/submit_approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function approveMaterial(body, options) {
    return request('/api/business/material/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function rejectMaterial(body, options) {
    return request('/api/business/material/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}


// 机械 APIs
export async function listMechanical(options) {
    return request('/api/business/mechanical/list', {
        method: 'GET',
        ...(options || {}),
    });
}

export async function addMechanical(body, options) {
    return request('/api/business/mechanical/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateMechanical(body, options) {
    return request('/api/business/mechanical/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function deleteMechanical(body, options) {
    return request('/api/business/mechanical/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}


export async function submitMechanicalApproval(body, options) {
    return request('/api/business/mechanical/submit_approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function approveMechanical(body, options) {
    return request('/api/business/mechanical/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function rejectMechanical(body, options) {
    return request('/api/business/mechanical/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 人工 APIs
export async function listArtificial(options) {
    return request('/api/business/artificial/list', {
        method: 'GET',
        ...(options || {}),
    });
}

export async function addArtificial(body, options) {
    return request('/api/business/artificial/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function updateArtificial(body, options) {
    return request('/api/business/artificial/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function deleteArtificial(body, options) {
    return request('/api/business/artificial/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}


export async function submitArtificialApproval(body, options) {
    return request('/api/business/artificial/submit_approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function approveArtificial(body, options) {
    return request('/api/business/artificial/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function rejectArtificial(body, options) {
    return request('/api/business/artificial/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function addProcessRecord(body, options) {
    return request('/api/business/process_record/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
export async function invalidProcessRecord(body, options) {
    return request('/api/business/process_record/invalid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
export async function listProcessRecord(options) {
    return request('/api/business/process_record/list', {
        method: 'GET',
        ...(options || {}),
    });
}

// 财务审批
export async function approveProcessRecord(body, options) {
    return request('/api/business/process_record/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 财务审批
export async function rejectProcessRecord(body, options) {
    return request('/api/business/process_record/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 提交审批 草稿状态提交为待审批状态
export async function submitProcessRecord(body, options) {
    return request('/api/business/process_record/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 新增 审批日志
export async function addReviewLog(body, options) {
    return request('/api/review/log/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 查询 审批日志
export async function listReviewLog(body, options) {
    return request('/api/review/log/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 更新 审批日志
export async function updateReviewLog(body, options) {
    return request('/api/review/log/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 删除 审批日志
export async function deleteReviewLog(body, options) {
    return request('/api/review/log/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 导入预算接口
export async function importBudget(body, options) {
    return request('/api/business/budget/import', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

// 查询导入任务列表
export async function findImportTasks(options) {
    return request('/api/business/budget/import/find/tasks', {
        method: 'GET',
        ...(options || {}),
    });
}

// 查询项目成本饼图数据
export async function findProjectCostPie(options) {
    return request('/api/business/analytics/project-cost-pie', {
        method: 'GET',
        ...(options || {}),
    });
}
// 查询导入的预算列表
export async function findImportedBudgets(options) {
    return request('/api/business/budget/list', {
        method: 'GET',
        ...(options || {}),
    });
}
// 更新导入的预算
export async function updateImportedBudget(body, options) {
    return request('/api/business/budget/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 删除导入的预算
export async function deleteImportedBudget(body, options) {
    return request('/api/business/budget/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 新增导入的预算
export async function addImportedBudget(body, options) {
    return request('/api/business/budget/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 新增报销单
export async function addWorkFeeApply(body, options) {
    return request('/api/business/apply/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 发起报销单审批
export async function submitWorkFeeApproval(body, options) {
    return request('/api/business/apply/submit_approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 删除报销单
export async function deleteWorkFeeApply(body, options) {
    return request('/api/business/apply/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 按级别查询报销单（审核页用）
export async function findWorkFeeApplyListByLevel(body, options) {
    return request('/api/business/apply/list/by_level', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 发起审批（多级流转）
export async function submitWorkFeeApplyWithLevels(body, options) {
    return request('/api/business/apply/submit_with_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 审批通过（多级流转）
export async function approveWorkFeeApplyWithLevels(body, options) {
    return request('/api/business/apply/approve_with_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 审批驳回（多级流转）
export async function rejectWorkFeeApplyWithLevels(body, options) {
    return request('/api/business/apply/reject_with_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 审批通过报销单
export async function approveWorkFeeApply(body, options) {
    return request('/api/business/apply/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 审批驳回报销单
export async function rejectWorkFeeApply(body, options) {
    return request('/api/business/apply/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 编辑报销单
export async function updateWorkFeeApply(body, options) {
    return request('/api/business/apply/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}
// 报销单列表
export async function findWorkFeeApplyList(body, options) {
    return request('/api/business/apply/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}