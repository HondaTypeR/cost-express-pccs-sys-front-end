import { supplierDelete, supplierList } from "@/services/supplier";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { message, Popconfirm } from "antd";
import { useRef } from "react";
import CreateForm from "./components/CreateForm.jsx";
import UpdateForm from "./components/UpdateForm.jsx";

const Supplier = () => {
  const actionRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = async (supplierId) => {
    const res = await supplierDelete({ supplier_id: supplierId });
    if (res.code === 200) {
      messageApi.success(res.msg || "删除成功");
      actionRef.current?.reload();
    } else {
      messageApi.error(res.msg || "删除失败");
    }
  };

  const columns = [
    {
      title: "公司名称",
      dataIndex: "supplier_name",
    },
    {
      title: "收款开户银行",
      dataIndex: "supplier_bank",
      hideInSearch: true,
    },
    {
      title: "收款开户银行账号",
      dataIndex: "supplier_account",
      hideInSearch: true,
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
        />,
        <Popconfirm
          key="delete"
          title="确定删除该供应商吗？"
          onConfirm={() => handleDelete(record.supplier_id)}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: "red" }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];
  return (
    <PageContainer title={false}>
      {contextHolder}
      <ProTable
        scroll={{ x: "max-content" }}
        actionRef={actionRef}
        rowKey="key"
        search={false}
        toolBarRender={() => [
          <CreateForm
            key="create"
            reload={() => actionRef.current?.reload()}
          />,
        ]}
        request={supplierList}
        columns={columns}
      />
    </PageContainer>
  );
};

export default Supplier;
