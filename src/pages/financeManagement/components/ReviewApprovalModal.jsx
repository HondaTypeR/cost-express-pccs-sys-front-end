import { getDeptList } from "@/services/dept";
import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const ReviewApprovalModal = (props) => {
  const {
    trigger,
    users,
    onOk,
    nextApproverLabel = "下一级审批人",
    currentAmount,
    currentInfo,
    checkerLevel = 3,
    fixedChecker,
  } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(1); // 1: 通过, 2: 拒绝

  useEffect(() => {
    if (!open) return;
    if (fixedChecker != null) {
      setTimeout(() => {
        formRef.current?.setFieldValue("next_checker", fixedChecker);
      }, 0);
      return;
    }
    if (!currentInfo) return;
    (async () => {
      const deptName =
        currentInfo.data_type === "material" ? "成本部" : "工程部";
      const res = await getDeptList();
      if (res?.code !== 200) return;
      const matched = (res.data || []).find(
        (item) => item.dept_name === deptName && item.power === "结算付款审批单"
      );
      const checkerField = `level_${
        ["one", "two", "three", "four", "five"][checkerLevel - 1]
      }_checker`;
      if (!matched || !matched[checkerField]) return;
      formRef.current?.setFieldValue(
        "next_checker",
        Number(matched[checkerField])
      );
    })();
  }, [open, currentInfo, users, checkerLevel, fixedChecker]);

  return (
    <ModalForm
      title={`审批详情`}
      formRef={formRef}
      open={open}
      trigger={cloneElement(trigger, {
        onClick: () => setOpen(true),
      })}
      width={500}
      modalProps={{
        onCancel: () => {
          setOpen(false);
          setApprovalStatus(1);
        },
        destroyOnClose: true,
      }}
      initialValues={{
        total_amount: currentAmount || 0,
      }}
      onFinish={async (values) => {
        if (approvalStatus === 1 && !values.next_checker) {
          message.error(`请选择${nextApproverLabel}`);
          return false;
        }
        if (approvalStatus === 2 && !values.reject_reason) {
          message.error("请填写拒绝原因");
          return false;
        }

        const success = await onOk?.(
          approvalStatus,
          values.approval_opinion,
          values.next_checker,
          values.reject_reason
        );
        if (success) {
          setOpen(false);
          setApprovalStatus(1);
          return true;
        }
        return false;
      }}
    >
      <ProFormDigit
        name="total_amount"
        label="审批金额"
        placeholder="请输入审批金额"
        disabled
        fieldProps={{
          precision: 2,
        }}
      />
      <ProFormRadio.Group
        name="approval_status"
        label="审批意见"
        initialValue={1}
        fieldProps={{
          onChange: (e) => {
            setApprovalStatus(e.target.value);
          },
        }}
        options={[
          { label: "通过", value: 1 },
          { label: "拒绝", value: 2 },
        ]}
        rules={[
          {
            required: true,
            message: "请选择审批意见",
          },
        ]}
      />

      {approvalStatus === 1 && (
        <>
          <ProFormSelect
            name="next_checker"
            label={nextApproverLabel}
            placeholder={`请选择${nextApproverLabel}`}
            options={users}
            rules={[
              {
                required: true,
                message: `请选择${nextApproverLabel}`,
              },
            ]}
            fieldProps={{
              showSearch: false,
              disabled: true,
            }}
          />
          <ProFormTextArea
            name="approval_opinion"
            label="审批意见"
            placeholder="请输入审批意见（选填）"
            fieldProps={{
              rows: 4,
            }}
          />
        </>
      )}

      {approvalStatus === 2 && (
        <ProFormTextArea
          name="reject_reason"
          label="拒绝原因"
          placeholder="请输入拒绝原因"
          rules={[
            {
              required: true,
              message: "请输入拒绝原因",
            },
          ]}
          fieldProps={{
            rows: 4,
          }}
        />
      )}
    </ModalForm>
  );
};

export default ReviewApprovalModal;
