import { PageContainer, ProTable } from "@ant-design/pro-components";
import { Button, message, Popconfirm } from "antd";
import { useRef, useState, useEffect } from "react";
import { listContract, deleteContract, listProject } from "@/services/business";
import { supplierList } from "@/services/supplier";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import ViewForm from "./components/ViewForm";
import RelatedContentModal from "./components/RelatedContentModal";

const Contract = () => {
    const actionRef = useRef(null);
    const [suppliers, setSuppliers] = useState([]);
    const [projects, setProjects] = useState([]);

    const fetchSuppliers = async () => {
        const res = await supplierList();
        if (res.code === 200) {
            setSuppliers(
                res.data.map((item) => ({
                    value: item.supplier_id,
                    label: item.supplier_name,
                }))
            );
        }
    };

    const fetchProjects = async () => {
        const res = await listProject();
        if (res.code === 200) {
            setProjects(
                res.data.map((item) => ({
                    value: item.project_id,
                    label: item.project_name,
                }))
            );
        }
    };

    useEffect(() => {
        fetchSuppliers();
        fetchProjects();
    }, []);

    const columns = [
        {
            title: "合同ID",
            dataIndex: "contract_id",
            width: 100,
        },
        {
            title: "合同类型",
            dataIndex: "contract_type",
            width: 100,
            valueEnum: {
                '1': { text: "工程合同" },
                '2': { text: "采购合同" },
                '3': { text: "劳务合同" },
                '4': { text: "其他合同" },
            },
        },
        {
            title: "归属项目",
            dataIndex: "project_id",
            width: 200,
            valueType: "select",
            hideInSearch: true,
            fieldProps: {
                options: projects,
            },
            render: (text, record) => {
                const project = projects.find(p => p.value == record.project_id);
                return project ? project.label : record.project_id;
            },
        },
        {
            title: "合同名称",
            dataIndex: "project_name",
            width: 200,
        },
        {
            title: "甲方",
            dataIndex: "party_a",
            width: 200,
            hideInSearch: true,
        },
        {
            title: "乙方",
            dataIndex: "party_b",
            width: 200,
            valueType: "select",
            fieldProps: {
                options: suppliers,
            },
        },
        {
            title: "合同金额",
            dataIndex: "contract_amount",
            valueType: "money",
            width: 150,
            hideInSearch: true,
        },
        {
            title: "已付款金额",
            dataIndex: "account_paid",
            valueType: "money",
            width: 150,
            hideInSearch: true,
        },
        {
            title: "未付款金额",
            dataIndex: "wait_account_paid",
            valueType: "money",
            width: 150,
            hideInSearch: true,
        },
        {
            title: "期限",
            dataIndex: "term",
            valueType: "select",
            valueEnum: {
                "1": { text: "一期" },
                "2": { text: "二期" },
                "3": { text: "三期" },
                "4": { text: "四期" },
                "5": { text: "五期" },
            },
            width: 100,
        },
        {
            title: "项目内容",
            dataIndex: "project_content",
            width: 200,
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: "类型",
            dataIndex: "type",
            valueType: "select",
            valueEnum: {
                labor: { text: "人工" },
                material: { text: "材料" },
                machinery: { text: "机械" },
                package: { text: "包工包料" },
                other: { text: "其他" },
            },
            width: 120,
        },
        {
            title: "材料名称",
            dataIndex: "material_name",
            width: 150,
            hideInSearch: true,
        },
        {
            title: "机械名称",
            dataIndex: "machinery_name",
            width: 150,
            hideInSearch: true,
        },
        {
            title: "创建时间",
            dataIndex: "create_time",
            valueType: "dateTime",
            width: 180,
            hideInSearch: true,
        },
        {
            title: "操作",
            valueType: "option",
            width: 300,
            fixed: "right",
            render: (text, record) => [
                <ViewForm
                    key="view"
                    values={record}
                    trigger={<a>查看</a>}
                    suppliers={suppliers}
                    projects={projects}
                />,
                <UpdateForm
                    key="edit"
                    values={record}
                    onOk={() => actionRef.current?.reload()}
                    trigger={<a>编辑</a>}
                    suppliers={suppliers}
                    projects={projects}
                />,
                <RelatedContentModal
                    key="related"
                    contractId={record.contract_id}
                    trigger={<a>关联内容</a>}
                />,
                <a
                    key="sub-contract"
                    href={`/sub-contract-list?own_contract_id=${record.contract_id}&name=${record?.project_name}`}
                    target="_blank"
                    rel="noreferrer">
                    补充合同({record.sub_contract_count || 0})
                </a>,
                <Popconfirm
                    title="确认删除"
                    description="确定要删除这条合同记录吗？删除后无法恢复。"
                    onConfirm={async () => {
                        const res = await deleteContract({ contract_id: record.contract_id, party_b_id: record.party_b_id });
                        if (res.code === 200) {
                            message.success("删除成功");
                            actionRef.current?.reload();
                        } else {
                            message.error(res.msg || "删除失败");
                        }
                    }
                    }
                    okText="确认"
                    cancelText="取消"
                    okType="danger"
                >
                    <a
                        key="delete"
                        style={{ color: "red" }}
                    >
                        删除
                    </a>
                </Popconfirm>
            ],
        },
    ];

    return (
        <PageContainer>
            <ProTable
                headerTitle="合同列表"
                actionRef={actionRef}
                rowKey="contract_id"
                search={{
                    labelWidth: 120,
                }}
                toolBarRender={() => [
                    <CreateForm
                        key="create"
                        onOk={() => actionRef.current?.reload()}
                        trigger={
                            <Button type="primary" key="primary">
                                新建合同
                            </Button>
                        }
                        suppliers={suppliers}
                        projects={projects}
                    />,
                ]}
                request={async (params, sort, filter) => {
                    const { current, pageSize, ...searchParams } = params;
                    const requestParams = {
                        ...searchParams,
                    };
                    const res = await listContract(requestParams);
                    return {
                        data: res.data || [],
                        success: res.code === 200,
                        total: res.total || 0,
                    };
                }}
                columns={columns}
                scroll={{ x: 1800 }}
            />
        </PageContainer>
    );
};

export default Contract;
