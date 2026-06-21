import { removeRule } from "@/services/ant-design-pro/api";
import { fetchCompany } from "@/services/company";
import { getDeptLabel, useDeptOptions } from "@/hooks/useDeptOptions";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useRequest } from "@umijs/max";
import { message } from "antd";
import { useCallback, useRef, useState } from "react";
import CreateForm from "./components/CreateForm.jsx";
import UpdateForm from "./components/UpdateForm.jsx";

const Company = () => {
  const actionRef = useRef(null);
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { deptList, allDeptOptions } = useDeptOptions();

  const { run: delRun, loading } = useRequest(removeRule, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();

      messageApi.success("Deleted successfully and will refresh soon");
    },
    onError: () => {
      messageApi.error("Delete failed, please try again");
    },
  });

  const columns = [
    {
      title: "公司名称",
      dataIndex: "company_name",
    },
    {
      title: "部门",
      dataIndex: "department",
      hideInSearch: true,
      renderText: (text) => {
        if (!text) return "-";
        const departmentIds = text.split(",");
        const labels = departmentIds
          .map((id) => getDeptLabel(allDeptOptions, id))
          .filter(Boolean);
        return labels.length > 0 ? labels.join(", ") : "-";
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      valueEnum: {
        0: {
          text: "正常",
          status: "Success",
        },
        1: {
          text: "注销",
          status: "Error",
        },
      },
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
          deptList={deptList}
        />,
      ],
    },
  ];

  /**
   *  Delete node
   * @zh-CN 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = useCallback(
    async (selectedRows) => {
      if (!selectedRows?.length) {
        messageApi.warning("请选择删除项");

        return;
      }

      await delRun({
        data: {
          key: selectedRows.map((row) => row.key),
        },
      });
    },
    [delRun, messageApi.warning]
  );

  return (
    <PageContainer title={false}>
      {contextHolder}
      <ProTable
        scroll={{ x: "max-content" }}
        actionRef={actionRef}
        rowKey="key"
        search={false}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} deptList={deptList} />,
        ]}
        request={fetchCompany}
        columns={columns}
      />
    </PageContainer>
  );
};

export default Company;
