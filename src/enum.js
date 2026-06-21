export const PowerStatus = [
    { label: "查看权限", value: 0 },
    { label: "经办权限", value: 1 },
    { label: "复核权限", value: 2 },
    { label: "审核权限", value: 3 },
]

export const MenuOptions = [
    { label: "人员管理", value: "/personnel" },
    { label: "公司管理", value: "/company" },
    { label: "供应商管理", value: "/supplier" },
    { label: "权限管理", value: "/power" },
]

export const Roles = [
    { label: "普通员工", value: 'user' },
    { label: "系统管理员", value: 'admin' },
]

export const UserStatus = [
    { label: "在职", value: '1' },
    { label: "离职", value: '2' },
]
export const PhaseNum = [
    { label: "一期", value: '1' },
    { label: "二期", value: '2' },
    { label: "三期", value: '3' },
    { label: "四期", value: '4' },
    { label: "五期", value: '5' },
]

export const StructureType = [
    { label: "框架", value: 'kj' },
    { label: "钢结构", value: 'gj' },
    { label: "砖混结构", value: 'zh' },
]

export const AuditStatus = [
    { label: "待审核", value: 0 },
    { label: "审核通过", value: 1 },
    { label: "审核驳回", value: 2 },
]

export const DocumentStatus = [
    { label: "草稿", value: 0 },
    { label: "经办部门审批", value: 1 },
    { label: "财务部审批", value: 2 },
    { label: "复核审核中", value: 3 },
    { label: "终审审核中", value: 4 },
    { label: "已归档", value: 10 },
]

export const DocumentStatusContract = [
    { label: "草稿", value: 0 },
    { label: "已提交", value: 1 },
    { label: "已验收", value: 2 },
    { label: "已归档", value: 3 },
]

export const WaitStatus = [
    { label: "草稿", value: 0 },
    { label: "经办部门审批", value: 1 },
    { label: "财务部审批", value: 2 },
    { label: "复核审核中", value: 3 },
    { label: "终审审核中", value: 4 },
    { label: "已归档", value: 10 },
]

export const ApplyDept = [
    { label: "销售部", value: '1' },
    { label: "综合办", value: '2' },
]

export const AllCheckerPowers = [
    { label: "材料确认单", value: '材料确认单' },
    { label: "人工确认单", value: '人工确认单' },
    { label: "机械确认单", value: '机械确认单' },
    { label: "分包工程确认单", value: '分包工程确认单' },
    { label: "销售费用单", value: '销售费用单' },
    { label: "办公费用报销单", value: '办公费用报销单' },
    { label: "结算付款审批单", value: '结算付款审批单' },
]

export const AllMenuRoutes = [
    { label: "欢迎页", value: "/welcome" },
    { label: "部门管理", value: "/dept" },
    { label: "数据看板", value: "/dashboard" },
    { label: "人员管理", value: "/personnel" },
    { label: "公司管理", value: "/company" },
    { label: "供应商管理", value: "/supplier" },
    { label: "权限管理", value: "/power" },
    { label: "项目管理", value: "/project" },
    { label: "合同管理", value: "/contract" },
    { label: "补充合同管理", value: "/sub-contract-list" },
    { label: "预算管理", value: "/comprehensive" },
    { label: "材料管理", value: "/materialManagement" },
    { label: "机械管理", value: "/mechanicalManagement" },
    { label: "人工管理", value: "/artificialManagement" },
    { label: "财务管理", value: "/financeManagement" },
    { label: "工作台", value: "/workbench" },
    { label: "办公费用报销单", value: "/workFeeApply" },
    { label: "办公报销单审核", value: "/workFeeApplyApproval" },
    { label: "销售费用报销单", value: "/saleFeeApply" },
    { label: "销售报销单审核", value: "/saleFeeApplyApproval" },
]