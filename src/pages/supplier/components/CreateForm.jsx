import { supplierAdd } from "@/services/supplier";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Button, message } from "antd";
import { useState } from "react";

const CreateForm = (props) => {
  const { reload } = props;
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <ModalForm
        title="新建供应商"
        open={open}
        trigger={
          <Button
            onClick={() => setOpen(true)}
            type="primary"
            icon={<PlusOutlined />}
          >
            新建
          </Button>
        }
        width="600px"
        modalProps={{ destroyOnHidden: true }}
        onFinish={async (value) => {
          const res = await supplierAdd(value);
          if (res.code === 200) {
            messageApi.success(res.meg || "添加成功");
            reload();
            setOpen(false);
            return true;
          } else {
            messageApi.error(res.meg || "添加失败，请重试");
            return false;
          }
        }}
      >
        <ProFormText
          label="公司名称"
          name="supplier_name"
          rules={[
            {
              required: true,
              message: "请输入公司名称",
            },
          ]}
          placeholder="请输入公司名称"
        />
        <ProFormText
          label="收款开户银行"
          name="supplier_bank"
          rules={[
            {
              required: true,
              message: "请输入收款开户银行",
            },
          ]}
          placeholder="请输入收款开户银行"
        />
        <ProFormText
          label="收款开户银行账号"
          name="supplier_account"
          rules={[
            {
              required: true,
              message: "请输入收款开户银行账号",
            },
          ]}
          placeholder="请输入收款开户银行账号"
        />
      </ModalForm>
    </>
  );
};

export default CreateForm;
