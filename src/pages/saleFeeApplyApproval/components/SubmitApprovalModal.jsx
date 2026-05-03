import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
} from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const SubmitApprovalModal = (props) => {
  const { trigger, users, onOk, record } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);

  // 自动填入 level_two_checker
  useEffect(() => {
    setTimeout(() => {
      if (!open) return;
      const reviewerId = record?.level_two_checker;
      if (reviewerId) {
        formRef.current?.setFieldValue("reviewer", Number(reviewerId));
      }
    }, 300);
  }, [open, record]);

  const getStatusLabel = (status) => {
    const statusMap = {
      0: "草稿",
      1: "经办部门审批",
      2: "财务部审批",
      3: "复核审核中",
      4: "终审审核中",
    };
    return statusMap[status] || "未知";
  };

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
        destroyOnHidden: true,
      }}
      initialValues={{
        total: record?.total || 0,
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
        name="total"
        label="总金额"
        placeholder="请输入总金额"
        disabled
        fieldProps={{
          precision: 2,
          valueType: "money",
        }}
      />
      <div style={{ color: "#666", fontSize: 12, marginTop: -16 }}>
        当前状态将从 <strong>草稿</strong> 变更为 <strong>发起审核状态</strong>
      </div>
    </ModalForm>
  );
};

export default SubmitApprovalModal;
