import {
  ModalForm,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useRef, useState } from "react";

const FinalAuditModal = (props) => {
  const { trigger, onOk } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);

  return (
    <ModalForm
      title="终审审核"
      formRef={formRef}
      open={open}
      trigger={cloneElement(trigger, {
        onClick: () => setOpen(true),
      })}
      width={500}
      modalProps={{
        onCancel: () => setOpen(false),
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        if (!values.approval_status && values.approval_status !== 0) {
          message.error("请选择审核状态");
          return false;
        }

        const success = await onOk?.(
          values.approval_status,
          values.approval_opinion || ""
        );
        if (success) {
          setOpen(false);
          return true;
        }
        return false;
      }}
    >
      <ProFormSelect
        name="approval_status"
        label="审核状态"
        placeholder="请选择审核状态"
        options={[
          { label: "审核通过", value: 1 },
          { label: "审核驳回", value: 2 },
        ]}
        rules={[
          {
            required: true,
            message: "请选择审核状态",
          },
        ]}
      />
      <ProFormTextArea
        name="approval_opinion"
        label="审核意见"
        placeholder="请输入审核意见（非必填）"
        fieldProps={{
          rows: 4,
          maxLength: 500,
          showCount: true,
        }}
      />
    </ModalForm>
  );
};

export default FinalAuditModal;
