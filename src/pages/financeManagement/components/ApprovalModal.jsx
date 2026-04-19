import { getDeptList } from "@/services/dept";
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
} from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const ApprovalModal = (props) => {
  const { trigger, users, onOk, currentStatus, currentAmount, currentInfo } =
    props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !currentInfo) return;
    (async () => {
      const deptName =
        currentInfo.data_type === "material" ? "成本部" : "工程部";
      const res = await getDeptList();
      if (res?.code !== 200) return;
      const matched = (res.data || []).find(
        (item) => item.dept_name === deptName && item.power === "结算付款审批单"
      );
      if (!matched || !matched.level_two_checker) return;
      formRef.current?.setFieldValue(
        "reviewer",
        Number(matched.level_two_checker)
      );
    })();
  }, [open, currentInfo, users]);

  return (
    <ModalForm
      title="发起审批"
      formRef={formRef}
      open={open}
      trigger={cloneElement(trigger, {
        onClick: () => setOpen(true),
      })}
      width={400}
      modalProps={{
        onCancel: () => setOpen(false),
        destroyOnClose: true,
      }}
      initialValues={{
        total_amount: currentAmount || 0,
      }}
      onFinish={async (values) => {
        if (!values.reviewer) {
          message.error("请选择审批人");
          return false;
        }

        const success = await onOk?.(values.reviewer);
        if (success) {
          setOpen(false);
          return true;
        }
        return false;
      }}
    >
      <ProFormSelect
        name="reviewer"
        label="选择审批人"
        placeholder="请选择审批人"
        options={users}
        rules={[
          {
            required: true,
            message: "请选择审批人",
          },
        ]}
        fieldProps={{
          showSearch: false,
          disabled: true,
        }}
      />
      <ProFormDigit
        name="total_amount"
        label="总金额"
        placeholder="请输入总金额"
        disabled
        fieldProps={{
          precision: 2,
          valueType: "money",
        }}
      />
      <div style={{ color: "#666", fontSize: 12, marginTop: -16 }}>
        当前状态将从 <strong>{getStatusLabel(currentStatus)}</strong> 变更为{" "}
        <strong>{getStatusLabel(currentStatus + 1)}</strong>
      </div>
    </ModalForm>
  );
};

const getStatusLabel = (status) => {
  const statusMap = {
    0: "草稿",
    1: "发起审核",
    2: "复审通过",
    3: "已归档",
  };
  return statusMap[status] || "未知";
};

export default ApprovalModal;
