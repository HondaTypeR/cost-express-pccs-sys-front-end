import { Departments } from "@/enum.js";
import { updateCompany } from "@/services/company";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "@umijs/max";
import { message } from "antd";
import { cloneElement, useState } from "react";

const UpdateForm = (props) => {
  const { onOk, values, trigger } = props;

  const [open, setOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(updateCompany, {
    manual: true,
    onSuccess: () => {
      messageApi.success("更新成功");
      setOpen(false);
      onOk?.();
    },
    onError: () => {
      messageApi.error("更新失败，请重试！");
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm
        title="编辑公司"
        open={open}
        trigger={
          trigger
            ? cloneElement(trigger, { onClick: () => setOpen(true) })
            : null
        }
        width="600px"
        modalProps={{
          okButtonProps: { loading },
          onCancel: () => setOpen(false),
        }}
        initialValues={{
          ...values,
          department: values?.department?.split(","),
        }}
        onFinish={async (formValues) => {
          await run({
            ...formValues,
            id: values.id,
            department: formValues.department.join(","),
          });
          return true;
        }}
      >
        <ProFormText
          label="公司名称"
          name="company_name"
          rules={[
            {
              required: true,
              message: "请输入公司名称",
            },
          ]}
          placeholder="请输入公司名称"
        />
        <ProFormSelect
          label="部门"
          name="department"
          mode="multiple"
          options={Departments}
          rules={[
            {
              required: true,
              message: "请选择部门",
            },
          ]}
          placeholder="请选择部门"
        />
        <ProFormSelect
          label="状态"
          name="status"
          options={[
            { label: "正常", value: 0 },
            { label: "注销", value: 1 },
          ]}
          rules={[
            {
              required: true,
              message: "请选择状态",
            },
          ]}
          placeholder="请选择状态"
        />
      </ModalForm>
    </>
  );
};

export default UpdateForm;
