import { loginOut } from "@/services/auth";
import { changePassword } from "@/services/password";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { message } from "antd";
import { history } from "umi";

const ChangePasswordModal = (props) => {
  const { open, onCancel, forced } = props;
  const { initialState } = useModel("@@initialState");
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <ModalForm
        title="修改密码"
        open={open}
        width="500px"
        modalProps={{
          onCancel: forced ? undefined : onCancel,
          destroyOnClose: true,
          closable: !forced,
          maskClosable: !forced,
          keyboard: !forced,
        }}
        submitter={{
          resetButtonProps: forced ? false : undefined,
        }}
        onFinish={async (values) => {
          if (values.newPassword !== values.confirmPassword) {
            messageApi.error("两次输入的新密码不一致");
            return false;
          }
          const res = await changePassword({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            userId: initialState?.currentUser?.id,
          });
          if (res.code === 200) {
            messageApi.success(res?.msg || "密码修改成功，请重新登录");
            await loginOut();
            const { search, pathname } = window.location;
            const urlParams = new URL(window.location.href).searchParams;
            const searchParams = new URLSearchParams({
              redirect: pathname + search,
            });
            /** 此方法会跳转到 redirect 参数所在的位置 */
            const redirect = urlParams.get("redirect");
            // Note: There may be security issues, please note
            if (window.location.pathname !== "/user/login" && !redirect) {
              history.replace({
                pathname: "/user/login",
                search: searchParams.toString(),
              });
            }
          } else {
            messageApi.error(res?.msg || "密码修改失败，请重试");
          }
        }}
      >
        <ProFormText.Password
          label="原密码"
          name="oldPassword"
          rules={[
            {
              required: true,
              message: "请输入原密码",
            },
          ]}
          placeholder="请输入原密码"
        />
        <ProFormText.Password
          label="新密码"
          name="newPassword"
          rules={[
            {
              required: true,
              message: "请输入新密码",
            },
            {
              min: 6,
              message: "密码长度至少6位",
            },
          ]}
          placeholder="请输入新密码（至少6位）"
        />
        <ProFormText.Password
          label="确认新密码"
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: "请再次输入新密码",
            },
          ]}
          placeholder="请再次输入新密码"
        />
      </ModalForm>
    </>
  );
};

export default ChangePasswordModal;
