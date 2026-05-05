import { fetchCompany } from "@/services/company";
import {
    PageContainer,
    ProDescriptions,
    ProTable,
} from "@ant-design/pro-components";

import { Drawer, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { listProject } from '@/services/business'
import CreateForm from "./components/CreateForm.jsx";
import UpdateForm from "./components/UpdateForm.jsx";
import ViewForm from "./components/ViewForm.jsx";
import { PhaseNum } from "@/enum";

const Project = () => {
    const actionRef = useRef(null);
    const [showDetail, setShowDetail] = useState(false);
    const [currentRow, setCurrentRow] = useState();
    const [companyList, setCompanyList] = useState([]);

    const fetchCompanyList = async () => {
        const res = await fetchCompany();
        const companyList = res.data.map((item) => ({
            value: item.id,
            label: item.company_name,
            department: item.department,
        }));
        setCompanyList(companyList);
    };
    useEffect(() => {
        fetchCompanyList();
    }, []);

    const columns = [
        {
            title: "项目名称",
            dataIndex: "project_name",
        },
        {
            title: "项目期数",
            dataIndex: "phase_num",
            valueType: "select",
            fieldProps: {
                options: PhaseNum,
            },
            render: (text, record) => {
                if (!record.phase_num) return '-';
                const phases = record.phase_num.split(',').map(p => p.trim());
                const phaseLabels = phases.map(phase => {
                    const found = PhaseNum.find(item => item.value === phase);
                    return found ? found.label : phase;
                });
                return phaseLabels.join('、');
            },
        },
        {
            title: "项目地址",
            dataIndex: "project_address",
        },
        {
            title: "创建时间",
            dataIndex: "create_time",
            valueType: "dateTime",
        },
        {
            title: "操作",
            dataIndex: "option",
            valueType: "option",
            render: (_, record) => [
                <UpdateForm
                    trigger={<a>编辑</a>}
                    key="edit"
                    onOk={actionRef.current?.reload}
                    values={record}
                    companyList={companyList}
                />,
                <ViewForm
                    trigger={<a>查看</a>}
                    key="view"
                    values={record}
                />,
            ],
        },
    ];

    return (
        <PageContainer title={false}>
            <ProTable
                actionRef={actionRef}
                rowKey="key"
                search={false}
                toolBarRender={() => [
                    <CreateForm
                        key="create"
                        reload={actionRef.current?.reload}
                        companyList={companyList}
                    />,
                ]}
                request={listProject}
                columns={columns}
            />
            <Drawer
                width={600}
                open={showDetail}
                onClose={() => {
                    setCurrentRow(undefined);
                    setShowDetail(false);
                }}
                closable={false}
            >
                {currentRow?.name && (
                    <ProDescriptions
                        column={2}
                        title={currentRow?.name}
                        request={async () => ({
                            data: currentRow || {},
                        })}
                        params={{
                            id: currentRow?.name,
                        }}
                        columns={columns}
                    />
                )}
            </Drawer>
        </PageContainer>
    );
};

export default Project;
