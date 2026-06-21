import { AllCheckerPowers, AllMenuRoutes } from "@/enum";
import { updateDept } from "@/services/dept";
import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { message } from "antd";
import { cloneElement, useRef, useState } from "react";

const UpdateForm = (props) => {
  const { onOk, values, trigger } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <DrawerForm
      title="编辑部门"
      formRef={formRef}
      open={open}
      trigger={
        trigger
          ? cloneElement(trigger, { onClick: () => setOpen(true) })
          : null
      }
      width="600px"
      drawerProps={{
        onClose: () => setOpen(false),
        destroyOnClose: true,
      }}
      submitter={{
        submitButtonProps: { loading: saving },
      }}
      initialValues={{
        dept_name: values?.dept_name,
        power: values?.power,
        menus: values?.router
          ? String(values.router).split(",").filter(Boolean)
          : [],
      }}
      onFinish={async (formValues) => {
        if (!values?.dept_id) {
          message.error("记录缺少 dept_id，无法保存");
          return false;
        }
        setSaving(true);
        try {
          const res = await updateDept({
            dept_id: values.dept_id,
            dept_name: formValues.dept_name,
            power: formValues.power,
            router: (formValues.menus || []).join(","),
          });
          if (res?.code === 200) {
            message.success(res?.msg || "更新成功");
            setOpen(false);
            onOk?.();
            return true;
          }
          message.error(res?.msg || "更新失败");
          return false;
        } catch (e) {
          message.error("更新失败");
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
        name="power"
        options={AllCheckerPowers}
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

export default UpdateForm;
