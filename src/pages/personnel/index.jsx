import { Roles } from "@/enum.js";
import { fetchCompany } from "@/services/company";
import { fetchUser } from "@/services/user.js";
import { getDeptLabel, useDeptOptions } from "@/hooks/useDeptOptions";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { Drawer, message } from "antd";
import { useEffect, useRef, useState } from "react";
import CreateForm from "./components/CreateForm.jsx";
import UpdateForm from "./components/UpdateForm.jsx";

const Personnel = () => {
  const actionRef = useRef(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const { deptList, allDeptOptions } = useDeptOptions();

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

  const [messageApi, contextHolder] = message.useMessage();

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "所属公司",
      dataIndex: "owner_company",
      render: (text) => companyList.find((item) => item.value === text)?.label,
    },
    {
      title: "所属部门",
      dataIndex: "owner_dept",
      render: (text) => {
        if (text == null || text === "") return "-";
        const ids = String(text).split(",").filter(Boolean);
        return ids.map((id) => getDeptLabel(allDeptOptions, id)).join("、");
      },
    },
    {
      title: "角色",
      dataIndex: "menu_role",
      render: (text) => {
        const role = Roles.find((item) => item.value === text);
        return role ? role.label : text;
      },
    },
    {
      title: "开户银行",
      dataIndex: "bankCardName",
      search: false,
    },
    {
      title: "银行卡号",
      dataIndex: "bankCardNo",
      search: false,
    },
    {
      title: "操作",
      dataIndex: "option",
      valueType: "option",
      render: (_, record) => [
        <UpdateForm
          trigger={<a>编辑</a>}
          key="config"
          onOk={actionRef.current?.reload}
          values={record}
          companyList={companyList}
          deptList={deptList}
          allDeptOptions={allDeptOptions}
        />,
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      {contextHolder}
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        search={false}
        toolBarRender={() => [
          <CreateForm
            key="create"
            reload={actionRef.current?.reload}
            companyList={companyList}
            deptList={deptList}
            allDeptOptions={allDeptOptions}
          />,
        ]}
        request={async () => {
          const res = await fetchUser();
          const filteredData = res.data.filter((item) => item.role !== "admin");
          return {
            data: filteredData,
            success: true,
          };
        }}
        columns={columns}
        scroll={{ x: "max-content" }}
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

export default Personnel;
