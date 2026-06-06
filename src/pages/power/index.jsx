import { removeRule, rule } from "@/services/ant-design-pro/api";
import { getUserMenus } from "@/services/menu";
import {
  FooterToolbar,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { FormattedMessage, useRequest } from "@umijs/max";
import { Button, message } from "antd";
import { useCallback, useRef, useState } from "react";
import CreateForm from "./components/CreateForm.jsx";
import UpdateForm from "./components/UpdateForm.jsx";

const Power = () => {
  const actionRef = useRef(null);
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

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

  const { data: menuData, loading: menusLoading } = useRequest(getUserMenus, {
    onSuccess: (res) => {
      console.log("菜单数据", res);
    },
    onError: (res) => {
      console.log("错误", res);
      messageApi.error("获取菜单失败，请重试！");
    },
  });

  const columns = [
    {
      title: "角色名称",
      dataIndex: "name",
    },
    {
      title: "角色描述",
      dataIndex: "description",
      hideInSearch: true,
    },
    {
      title: "角色权限",
      dataIndex: "power",
      hideInSearch: true,
    },
    {
      title: "菜单权限",
      dataIndex: "menu",
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
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        request={rule}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        scroll={{ x: "max-content" }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{" "}
              <FormattedMessage
                id="pages.searchTable.item"
                defaultMessage="项"
              />
              &nbsp;&nbsp;
              <span>
                总计{" "}
                {selectedRowsState.reduce(
                  (pre, item) => pre + (item.callNo ?? 0),
                  0
                )}{" "}
                万
              </span>
            </div>
          }
        >
          <Button
            loading={loading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

export default Power;
