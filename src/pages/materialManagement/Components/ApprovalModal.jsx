import { getDeptList } from "@/services/dept";
import { ModalForm, ProFormSelect } from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const CHECKER_FIELDS = [
  "level_one_checker",
  "level_two_checker",
  "level_three_checker",
  "level_four_checker",
  "level_five_checker",
];

const ApprovalModal = (props) => {
  const {
    trigger,
    users,
    onOk,
    currentStatus,
    dept,
    power,
    level,
    currentUser,
  } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !dept || !power || !level) return;
    (async () => {
      const res = await getDeptList();
      if (res?.code !== 200) return;
      const field = CHECKER_FIELDS[level - 1];
      const matched = (res.data || []).find(
        (item) => item.dept_name === dept && item.power === power
      );
      console.log("🚀 ~ ApprovalModal ~ matched:", matched[field]);
      if (matched[field]) {
        formRef.current?.setFieldValue("reviewer", Number(matched[field]));
      }
    })();
  }, [open, dept, power, level, users]);

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
