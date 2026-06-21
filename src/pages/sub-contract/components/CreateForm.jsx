import { subAddContract } from "@/services/contract";
import { getUrlParam } from "@/utils";
import {
  DrawerForm,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { Image, message, Modal, Upload } from "antd";
import { cloneElement, useRef, useState } from "react";

const CreateForm = (props) => {
  const own_contract_id = getUrlParam("own_contract_id");
  const own_contract_name = getUrlParam("name");
  const { onOk, trigger, suppliers, projects } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState({ visible: false, src: "" });

  const getFileMeta = (file) => {
    const fileUrl =
      file?.response?.data?.fileList?.[0]?.fileUrl ||
      file?.url ||
      file?.thumbUrl ||
      "";
    const fileName = String(file?.name || "");
    if (!fileUrl) return null;
    return { fileUrl, fileName };
  };

  return (
    <>
      <DrawerForm
        title={
          <div>
            新建补充合同{" "}
            <span style={{ color: "gray" }}>(原合同:{own_contract_name})</span>
          </div>
        }
        formRef={formRef}
        open={open}
        trigger={
          trigger
            ? cloneElement(trigger, {
                onClick: () => setOpen(true),
              })
            : null
        }
        width="600px"
        drawerProps={{
          onClose: () => setOpen(false),
          destroyOnClose: true,
        }}
        initialValues={{
          contract_type: "1",
          party_a: "贵州久益建筑有限公司",
        }}
        onValuesChange={(changedValues) => {
          if (changedValues.contract_type !== undefined) {
            formRef.current?.setFieldsValue({
              party_b_id: undefined,
            });
          }
        }}
        onFinish={async (value) => {
          return new Promise((resolve) => {
            Modal.confirm({
              title: "确认创建",
              content: "合同创建后，仅合同名称可以修改，请仔细核对后再创建",
              okText: "确认创建",
              cancelText: "取消",
              onOk: async () => {
                const attachmentList = Array.isArray(value.contract_attachment)
                  ? value.contract_attachment
                  : [];
                const attachmentFiles = attachmentList
                  .map(getFileMeta)
                  .filter(Boolean);
                const attachmentPayload = attachmentFiles.length
                  ? JSON.stringify(attachmentFiles)
                  : "";

                let params = {
                  ...value,
                  contract_attachment: attachmentPayload,
                  own_contract_id: own_contract_id
                    ? Number(own_contract_id)
                    : undefined,
                };

                const selectedSupplierB = suppliers.find(
                  (s) => s.value === value.party_b_id
                );
                params.party_a = "贵州久益建筑有限公司";
                params.party_b = selectedSupplierB?.label || "";
                const res = await subAddContract(params);

                if (res.code === 200) {
                  message.success(res?.msg || "创建成功");
                  setOpen(false);
                  onOk?.();
                  resolve(true);
                } else {
                  message.error(res?.msg || "创建失败");
                  resolve(false);
                }
              },
              onCancel: () => {
                resolve(false);
              },
            });
          });
        }}
      >
        <ProFormRadio.Group
          name="contract_type"
          label="合同类型"
          initialValue="1"
          options={[
            { label: "工程合同", value: "1" },
            { label: "采购合同", value: "2" },
            { label: "劳务合同", value: "3" },
            { label: "其他合同", value: "4" },
          ]}
          rules={[
            {
              required: true,
              message: "请选择合同类型",
            },
          ]}
        />
        <ProFormSelect
          name="project_id"
          label="归属项目"
          placeholder="请选择归属项目"
          options={projects}
          rules={[
            {
              required: true,
              message: "请选择归属项目",
            },
          ]}
        />
        <ProFormText
          name="project_name"
          label="合同名称"
          placeholder="请输入合同名称"
          rules={[
            {
              required: true,
              message: "请输入合同名称",
            },
          ]}
        />
        <ProFormText
          name="party_a"
          label="甲方"
          disabled
          rules={[
            {
              required: true,
              message: "请输入甲方名称",
            },
          ]}
        />
        <ProFormSelect
          name="party_b_id"
          label="乙方"
          placeholder="请选择乙方（供应商）"
          options={suppliers}
          rules={[
            {
              required: true,
              message: "请选择乙方",
            },
          ]}
        />
        <ProFormDigit
          name="contract_amount"
          label="合同金额"
          placeholder="请输入合同金额"
          fieldProps={{
            precision: 2,
            style: { width: "100%" },
            min: Number.NEGATIVE_INFINITY,
          }}
          rules={[
            {
              required: true,
              message: "请输入合同金额",
            },
          ]}
        />
        <ProFormDependency name={["contract_amount"]}>
          {({ contract_amount }) => {
            if (
              contract_amount === undefined ||
              contract_amount === null ||
              contract_amount === 0
            ) {
              return null;
            }
            return (
              <ProFormText
                name="amount_type_display"
                label="核算类型"
                readonly
                style={{
                  color: contract_amount >= 0 ? "#52c41a" : "#ff4d4f",
                  fontWeight: "bold",
                }}
                fieldProps={{
                  value:
                    contract_amount >= 0
                      ? `核增 ${contract_amount}`
                      : `核减 ${Math.abs(contract_amount)}`,
                }}
              />
            );
          }}
        </ProFormDependency>
        <ProFormSelect
          name="term"
          label="期限"
          placeholder="请选择期限"
          options={[
            { label: "一期", value: "1" },
            { label: "二期", value: "2" },
            { label: "三期", value: "3" },
            { label: "四期", value: "4" },
            { label: "五期", value: "5" },
          ]}
          rules={[
            {
              required: true,
              message: "请选择期限",
            },
          ]}
        />
        <ProFormTextArea
          name="project_content"
          label="项目内容"
          placeholder="请输入项目内容"
          fieldProps={{
            rows: 4,
          }}
          rules={[
            {
              required: true,
              message: "请输入项目内容",
            },
          ]}
        />
        <ProFormSelect
          name="type"
          label="类型"
          placeholder="请选择类型"
          options={[
            { label: "材料", value: "material" },
            { label: "机械", value: "machinery" },
            { label: "包工包料", value: "package" },
            { label: "其他", value: "other" },
          ]}
          rules={[
            {
              required: true,
              message: "请选择类型",
            },
          ]}
        />
        <ProFormDependency name={["type"]}>
          {({ type }) => {
            if (type === "material" || type === "package") {
              return (
                <ProFormTextArea
                  name="material_name"
                  label="材料名称"
                  placeholder="请输入材料名称"
                  fieldProps={{
                    rows: 4,
                  }}
                  rules={[
                    {
                      required: true,
                      message: "请输入材料名称",
                    },
                  ]}
                />
              );
            }
            return null;
          }}
        </ProFormDependency>
        <ProFormDependency name={["type"]}>
          {({ type }) => {
            if (type === "machinery" || type === "package") {
              return (
                <ProFormTextArea
                  name="machinery_name"
                  label="机械名称"
                  placeholder="请输入机械名称"
                  fieldProps={{
                    rows: 4,
                  }}
                  rules={[
                    {
                      required: true,
                      message: "请输入机械名称",
                    },
                  ]}
                />
              );
            }
            return null;
          }}
        </ProFormDependency>
        <ProFormDependency name={["type"]}>
          {({ type }) => {
            if (type === "package") {
              return (
                <ProFormTextArea
                  name="people_name"
                  label="人工名称"
                  placeholder="请输入人工名称"
                  fieldProps={{
                    rows: 4,
                  }}
                  rules={[
                    {
                      required: true,
                      message: "请输入人工名称",
                    },
                  ]}
                />
              );
            }
            return null;
          }}
        </ProFormDependency>
        <ProFormDependency name={["type"]}>
          {({ type }) => {
            if (type === "other") {
              return (
                <ProFormTextArea
                  name="other_name"
                  label="其他名称"
                  placeholder="请输入其他名称"
                  fieldProps={{
                    rows: 4,
                  }}
                  rules={[
                    {
                      required: true,
                      message: "请输入其他名称",
                    },
                  ]}
                />
              );
            }
            return null;
          }}
        </ProFormDependency>
        <ProFormUploadButton
          name="contract_attachment"
          label="合同附件"
          max={5}
          fieldProps={{
            name: "files",
            accept: "image/*,.pdf",
            listType: "text",
            showUploadList: {
              showDownloadIcon: true,
              showRemoveIcon: true,
              showPreviewIcon: true,
            },
            beforeUpload: (file) => {
              const fileType = String(file?.type || "");
              const fileName = String(file?.name || "").toLowerCase();
              const isImage = fileType.startsWith("image/");
              const isPdf =
                fileType === "application/pdf" || fileName.endsWith(".pdf");
              if (!isImage && !isPdf) {
                message.error("仅支持上传图片或PDF文件");
                return Upload.LIST_IGNORE;
              }
              return true;
            },
            onChange: (info) => {
              if (info.file.status === "done") {
                const fileUrl =
                  info.file.response?.data?.fileList?.[0]?.fileUrl;
                if (fileUrl) {
                  info.file.url = fileUrl;
                }
              }
            },
            onPreview: (file) => {
              const url =
                file.url || file.response?.data?.fileList?.[0]?.fileUrl;
              const name = String(file?.name || "").toLowerCase();
              const type = String(file?.type || "");
              const isPdf = type === "application/pdf" || name.endsWith(".pdf");
              const isImage =
                type.startsWith("image/") ||
                /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(name);
              if (!url) return;
              if (isPdf) {
                window.open(url, "_blank");
                return;
              }
              if (isImage) {
                setImgPreview({ visible: true, src: url });
                return;
              }
              window.open(url, "_blank");
            },
          }}
          action="/api/contract/upload"
        />
        <Image
          src={imgPreview.src}
          style={{ display: "none" }}
          preview={{
            visible: imgPreview.visible,
            src: imgPreview.src,
            onVisibleChange: (v) =>
              setImgPreview((prev) => ({ ...prev, visible: v })),
          }}
        />
      </DrawerForm>
    </>
  );
};

export default CreateForm;
