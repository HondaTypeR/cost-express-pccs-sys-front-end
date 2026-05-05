import {
  ModalForm,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useRef, useState } from "react";

const ReviewApprovalModal = (props) => {
  const { trigger, onOk, users } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);

  return (
    <ModalForm
      title="审批"
      formRef={formRef}
      open={open}
      trigger={cloneElement(trigger, {
        onClick: () => setOpen(true),
      })}
      width={500}
      modalProps={{
        onCancel: () => {
          setOpen(false);
          setApprovalStatus(null);
        },
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        if (!values.approval_status && values.approval_status !== 0) {
          message.error("请选择审批状态");
          return false;
        }

        const success = await onOk?.(
          values.approval_status,
          values.approval_opinion || "",
          values.user_id
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
        label="审批状态"
        placeholder="请选择审批状态"
        options={[
          { label: "审批通过", value: 1 },
          { label: "审批驳回", value: 2 },
        ]}
        rules={[
          {
            required: true,
            message: "请选择审批状态",
          },
        ]}
        fieldProps={{
          onChange: (value) => {
            setApprovalStatus(value);
          },
        }}
      />
      {approvalStatus !== 2 && (
        <ProFormSelect
          name="user_id"
          label="审核人"
          placeholder="请选择审核人"
          initialValue={2}
          options={users}
          rules={[
            {
              required: approvalStatus === 1,
              message: "请选择审核人",
            },
          ]}
          fieldProps={{
            showSearch: false,
            disabled: true,
          }}
        />
      )}
      <ProFormTextArea
        name="approval_opinion"
        label="审批意见"
        placeholder={
          approvalStatus === 2
            ? "请输入审批意见（必填）"
            : "请输入审批意见（非必填）"
        }
        rules={[
          {
            required: approvalStatus === 2,
            message: "请输入审批意见",
          },
        ]}
        fieldProps={{
          rows: 4,
          maxLength: 500,
          showCount: true,
        }}
      />
    </ModalForm>
  );
};

export default ReviewApprovalModal;
