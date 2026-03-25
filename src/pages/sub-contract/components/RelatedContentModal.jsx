import { AuditStatus, DocumentStatusContract } from "@/enum";
import { getSubContractRelated } from "@/services/contract";
import { ModalForm, ProTable } from "@ant-design/pro-components";
import { message, Tabs } from "antd";
import { cloneElement, useRef, useState } from "react";

const RelatedContentModal = (props) => {
  const { trigger, contractId } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [relatedData, setRelatedData] = useState({
    materials: [],
    mechanicals: [],
    artificials: [],
    summary: {},
  });

  const fetchRelatedData = async () => {
    setLoading(true);
    try {
      const res = await getSubContractRelated({ sub_contract_id: contractId });
      if (res.code === 200) {
        setRelatedData({
          materials: res.data.material?.list || [],
          mechanicals: res.data.mechanical?.list || [],
          artificials: res.data.artificial?.list || [],
          summary: res.data.summary || {},
        });
      } else {
        message.error(res.msg || "获取关联数据失败");
      }
    } catch (error) {
      message.error(error.msg || "获取关联数据失败");
    } finally {
      setLoading(false);
    }
  };

  const materialColumns = [
    {
      title: "材料名称",
      dataIndex: "material_name",
      width: 150,
    },
    {
      title: "单位",
      dataIndex: "unit",
      width: 80,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      width: 100,
    },
    {
      title: "单价(元)",
      dataIndex: "unit_price",
      valueType: "money",
      width: 120,
    },
    {
      title: "合价(元)",
      dataIndex: "total_price",
      valueType: "money",
      width: 120,
    },
    {
      title: "审核状态",
      dataIndex: "audit_status",
      width: 100,
      valueType: "select",
      valueEnum: AuditStatus.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
    },
    {
      title: "单据状态",
      dataIndex: "document_status",
      width: 100,
      valueType: "select",
      valueEnum: DocumentStatusContract.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
    },
  ];

  const mechanicalColumns = [
    {
      title: "机械名称",
      dataIndex: "material_name",
      width: 150,
    },
    {
      title: "单位",
      dataIndex: "unit",
      width: 80,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      width: 100,
    },
    {
      title: "单价(元)",
      dataIndex: "unit_price",
      valueType: "money",
      width: 120,
    },
    {
      title: "合价(元)",
      dataIndex: "total_price",
      valueType: "money",
      width: 120,
    },
    {
      title: "审核状态",
      dataIndex: "audit_status",
      width: 100,
      valueType: "select",
      valueEnum: AuditStatus.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
    },
    {
      title: "单据状态",
      dataIndex: "document_status",
      width: 100,
      valueType: "select",
      valueEnum: DocumentStatusContract.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
    },
  ];

  const artificialColumns = [
    {
      title: "人工名称",
      dataIndex: "material_name",
      width: 150,
    },
    {
      title: "单位",
      dataIndex: "unit",
      width: 80,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      width: 100,
    },
    {
      title: "单价(元)",
      dataIndex: "unit_price",
      valueType: "money",
      width: 120,
    },
    {
      title: "合价(元)",
      dataIndex: "total_price",
      valueType: "money",
      width: 120,
    },
    {
      title: "审核状态",
      dataIndex: "audit_status",
      width: 100,
      valueType: "select",
      valueEnum: AuditStatus.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
    },
    {
      title: "单据状态",
      dataIndex: "document_status",
      width: 100,
      valueType: "select",
      valueEnum: DocumentStatusContract.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
    },
  ];

  const tabItems = [
    {
      key: "materials",
      label: `材料 (${relatedData.materials.length})`,
      children: (
        <ProTable
          columns={materialColumns}
          dataSource={relatedData.materials}
          rowKey="material_code"
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          loading={loading}
          options={false}
          toolBarRender={false}
        />
      ),
    },
    {
      key: "mechanicals",
      label: `机械 (${relatedData.mechanicals.length})`,
      children: (
        <ProTable
          columns={mechanicalColumns}
          dataSource={relatedData.mechanicals}
          rowKey="mechanical_code"
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          loading={loading}
          options={false}
          toolBarRender={false}
        />
      ),
    },
    {
      key: "artificials",
      label: `人工 (${relatedData.artificials.length})`,
      children: (
        <ProTable
          columns={artificialColumns}
          dataSource={relatedData.artificials}
          rowKey="artficial_code"
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          loading={loading}
          options={false}
          toolBarRender={false}
        />
      ),
    },
  ];

  return (
    <ModalForm
      title={
        <div>
          关联内容
          {relatedData.summary?.totalCount > 0 && (
            <span
              style={{
                marginLeft: 16,
                fontSize: 14,
                fontWeight: "normal",
                color: "#666",
              }}
            >
              共 {relatedData.summary.totalCount} 条记录，合计金额：¥
              {relatedData.summary.grandTotal}
            </span>
          )}
        </div>
      }
      formRef={formRef}
      open={open}
      trigger={
        trigger
          ? cloneElement(trigger, {
              onClick: () => {
                setOpen(true);
                fetchRelatedData();
              },
            })
          : null
      }
      width={1000}
      modalProps={{
        onCancel: () => setOpen(false),
        destroyOnClose: true,
      }}
      submitter={false}
    >
      <Tabs items={tabItems} />
    </ModalForm>
  );
};

export default RelatedContentModal;
