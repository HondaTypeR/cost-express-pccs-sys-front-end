import { Departments, Roles } from "@/enum.js";
import { updateUser } from "@/services/user";
import {
  ModalForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "@umijs/max";
import { message } from "antd";
import { cloneElement, useRef, useState } from "react";

const UpdateForm = (props) => {
  const { onOk, values, trigger, companyList } = props;
  const formRef = useRef();

  const [open, setOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(updateUser, {
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
        title="编辑人员"
        formRef={formRef}
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
          destroyOnClose: true,
        }}
        initialValues={{
          ...values,
          owner_dept:
            typeof values?.owner_dept === "string"
              ? values.owner_dept.split(",").filter(Boolean)
              : values?.owner_dept,
        }}
        onFinish={async (formValues) => {
          await run({
            ...formValues,
            owner_dept: Array.isArray(formValues?.owner_dept)
              ? formValues.owner_dept.join(",")
              : formValues?.owner_dept,
            id: values.id,
            status: 0,
            nickname: formValues?.username,
            name: formValues?.username,
          });
          return true;
        }}
      >
        <ProFormText
          label="姓名"
          name="username"
          rules={[
            {
              required: true,
              message: "请输入姓名",
            },
          ]}
          placeholder="请输入姓名"
        />
        <ProFormSelect
          label="所属公司"
          name="owner_company"
          options={companyList}
          rules={[
            {
              required: true,
              message: "请选择所属公司",
            },
          ]}
          placeholder="请选择所属公司"
          fieldProps={{
            onChange: () => {
              formRef.current?.setFieldsValue({ owner_dept: undefined });
            },
          }}
        />
        <ProFormDependency name={["owner_company"]}>
          {({ owner_company }) => {
            const selectedCompany = companyList.find(
              (item) => item.value === owner_company
            );
            const departmentIds = selectedCompany?.department?.split(",") || [];
            const departmentOptions = Departments.filter((dept) =>
              departmentIds.includes(dept.value)
            );

            return (
              <ProFormSelect
                label="所属部门"
                name="owner_dept"
                options={departmentOptions}
                disabled={!owner_company}
                mode="multiple"
                fieldProps={{ mode: "multiple" }}
                rules={[
                  {
                    required: true,
                    message: "请选择所属部门",
                  },
                ]}
                placeholder={
                  owner_company ? "请选择所属部门" : "请先选择所属公司"
                }
              />
            );
          }}
        </ProFormDependency>
        <ProFormSelect
          label="角色"
          name="role"
          options={Roles}
          rules={[
            {
              required: true,
              message: "请选择角色",
            },
          ]}
          placeholder="请选择角色"
        />
        <ProFormText
          label="开户银行"
          name="bankCardName"
          placeholder="请输入开户银行"
        />
        <ProFormText
          label="银行卡号"
          name="bankCardNo"
          placeholder="请输入银行卡号"
        />
      </ModalForm>
    </>
  );
};

export default UpdateForm;
