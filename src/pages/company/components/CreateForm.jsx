import { Departments } from "@/enum.js";
import { addCompany } from "@/services/company";
import { PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "@umijs/max";
import { Button, message } from "antd";

const CreateForm = (props) => {
  const { reload } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(addCompany, {
    manual: true,
    onSuccess: () => {
      messageApi.success("添加成功");
      reload?.();
    },
    onError: () => {
      messageApi.error("添加失败，请重试！");
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm
        title="新建公司"
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            新建
          </Button>
        }
        width="600px"
        modalProps={{ okButtonProps: { loading }, destroyOnHidden: true }}
        onFinish={async (value) => {
          await run({
            ...value,
            status: 0,
            department: value?.department.join(","),
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
      </ModalForm>
    </>
  );
};

export default CreateForm;
