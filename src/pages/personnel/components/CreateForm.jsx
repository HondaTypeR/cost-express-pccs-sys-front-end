import { Departments, Roles } from "@/enum.js";
import { addUser } from "@/services/user";
import { PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "@umijs/max";
import { Button, message } from "antd";
import { useRef, useState } from "react";

const CreateForm = (props) => {
  const { reload, companyList } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const { run, loading } = useRequest(addUser, {
    manual: true,
    onSuccess: (res) => {
      messageApi.success("添加成功");
      setOpen(false);
      reload?.();
    },
    onError: () => {
      messageApi.error("添加失败，请重试");
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm
        title="新建人员"
        formRef={formRef}
        open={open}
        trigger={
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            icon={<PlusOutlined />}
          >
            新建
          </Button>
        }
        width="600px"
        modalProps={{ okButtonProps: { loading }, destroyOnClose: true }}
        onFinish={async (value) => {
          await run({
            ...value,
            status: 0,
            nickname: value?.username,
            name: value?.username,
            password: "123456",
            menu_role: "admin",
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
      </ModalForm>
    </>
  );
};

export default CreateForm;
