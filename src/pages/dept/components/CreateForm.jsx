import { AllCheckerPowers, AllMenuRoutes } from "@/enum";
import { addDept } from "@/services/dept";
import { PlusOutlined } from "@ant-design/icons";
import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, message } from "antd";
import { useRef, useState } from "react";

const CreateForm = (props) => {
  const { reload } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <DrawerForm
      title="新增部门"
      formRef={formRef}
      open={open}
      trigger={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          新增
        </Button>
      }
      width="600px"
      drawerProps={{
        onClose: () => setOpen(false),
        destroyOnClose: true,
      }}
      submitter={{
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (value) => {
        const powers = value?.powers || [];
        if (!powers.length) {
          message.warning("请至少选择一个权限点");
          return false;
        }

        const router = (value?.menus || []).join(",");
        setSaving(true);
        try {
          for (const power of powers) {
            const res = await addDept({
              dept_name: value.dept_name,
              power,
              router,
            });
            if (res?.code !== 200) {
              message.error(res?.msg || "创建失败");
              return false;
            }
          }
          message.success("创建成功");
          setOpen(false);
          reload?.();
          return true;
        } catch (e) {
          message.error("创建失败");
          return false;
        } finally {
          setSaving(false);
        }
      }}
    >
      <ProFormText
        label="部门名称"
        name="dept_name"
        rules={[{ required: true, message: "请输入部门名称" }]}
        placeholder="请输入部门名称"
      />
      <ProFormSelect
        label="权限点"
        name="powers"
        options={AllCheckerPowers}
        mode="multiple"
        fieldProps={{ mode: "multiple" }}
        rules={[{ required: true, message: "请选择权限点" }]}
        placeholder="请选择权限点"
      />
      <ProFormSelect
        label="菜单权限"
        name="menus"
        options={AllMenuRoutes}
        mode="multiple"
        fieldProps={{ mode: "multiple" }}
        placeholder="请选择菜单权限"
      />
    </DrawerForm>
  );
};

export default CreateForm;
