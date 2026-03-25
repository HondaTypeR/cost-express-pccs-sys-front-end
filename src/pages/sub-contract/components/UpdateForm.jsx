import { updateContract } from "@/services/contract";
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
import { Image, Upload, message } from "antd";
import { cloneElement, useRef, useState } from "react";

const UpdateForm = (props) => {
  const { onOk, values, trigger, suppliers, projects } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState({ visible: false, src: "" });

  const parseAttachment = (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((x) => ({
          fileUrl: String(x?.fileUrl || ""),
          fileName: String(x?.fileName || ""),
        }))
        .filter((x) => x.fileUrl);
    } catch {
      return [];
    }
  };

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
        title="编辑补充合同"
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
          ...values,
          // 后端数据中 party_b_id 存的是供应商名称，需要根据名称找到对应的 ID
          party_b_id:
            suppliers.find((s) => s.label === values.party_b_id)?.value ||
            (values.party_b_id && !isNaN(values.party_b_id)
              ? Number(values.party_b_id)
              : undefined),
          contract_attachment: (() => {
            const files = parseAttachment(values.contract_attachment);
            return files.map((f, idx) => ({
              uid: `-attach-${idx}`,
              name:
                f.fileName ||
                String(f.fileUrl).split("/").pop() ||
                `附件${idx + 1}`,
              status: "done",
              url: f.fileUrl,
            }));
          })(),
        }}
        onFinish={async (value) => {
          // 根据 party_b_id 查找供应商名称
          const selectedSupplier = suppliers.find(
            (s) => s.value === value.party_b_id
          );

          const attachmentList = Array.isArray(value.contract_attachment)
            ? value.contract_attachment
            : [];
          const attachmentFiles = attachmentList
            .map(getFileMeta)
            .filter(Boolean);
          const attachmentPayload = attachmentFiles.length
            ? JSON.stringify(attachmentFiles)
            : "";

          const params = {
            ...value,
            contract_id: values.contract_id,
            party_b: selectedSupplier?.label || "",
            project_name: value.project_name || values.project_name,
            contract_type: values.contract_type,
            contract_attachment: attachmentPayload,
          };
          const res = await updateContract(params);

          if (res.code === 200) {
            message.success(res?.msg || "更新成功");
            setOpen(false);
            onOk?.();
            return true;
          } else {
            message.error(res?.msg || "更新失败");
            return false;
          }
        }}
      >
        <ProFormRadio.Group
          name="contract_type"
          label="合同类型"
          disabled
          options={[
            { label: "非采购合同", value: "1" },
            { label: "采购合同", value: "2" },
          ]}
        />
        <ProFormText
          name="project_id"
          label="归属项目"
          disabled
          convertValue={(value) => {
            const project = projects.find((p) => p.value == value);
            return project ? project.label : value;
          }}
        />
        <ProFormText name="project_name" label="合同名称" />
        <ProFormDependency name={["contract_type"]}>
          {({ contract_type }) => {
            if (contract_type === "2") {
              return (
                <ProFormSelect
                  name="party_a"
                  label="甲方"
                  disabled
                  placeholder="请选择甲方（供应商）"
                  options={suppliers}
                  rules={[
                    {
                      required: true,
                      message: "请选择甲方",
                    },
                  ]}
                />
              );
            }
            return (
              <ProFormText
                name="party_a"
                label="甲方"
                disabled
                placeholder="请输入甲方名称"
                rules={[
                  {
                    required: true,
                    message: "请输入甲方名称",
                  },
                ]}
              />
            );
          }}
        </ProFormDependency>
        <ProFormDependency name={["contract_type"]}>
          {({ contract_type }) => {
            if (contract_type === "2") {
              return (
                <ProFormText
                  name="party_b"
                  label="乙方"
                  disabled
                  placeholder="请输入乙方名称"
                  rules={[
                    {
                      required: true,
                      message: "请输入乙方名称",
                    },
                  ]}
                />
              );
            }
            return (
              <ProFormSelect
                name="party_b_id"
                label="乙方"
                disabled
                placeholder="请选择乙方（供应商）"
                options={suppliers}
                rules={[
                  {
                    required: true,
                    message: "请选择乙方",
                  },
                ]}
              />
            );
          }}
        </ProFormDependency>
        <ProFormDigit
          name="contract_amount"
          label="合同金额"
          disabled
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
                disabled
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
          disabled
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
          disabled
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
          disabled
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
                  disabled
                  placeholder="请输入材料名称"
                  fieldProps={{
                    rows: 4,
                  }}
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
                  disabled
                  placeholder="请输入机械名称"
                  fieldProps={{
                    rows: 4,
                  }}
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
                  disabled
                  placeholder="请输入人工名称"
                  fieldProps={{
                    rows: 4,
                  }}
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
                  disabled
                  placeholder="请输入其他名称"
                  fieldProps={{
                    rows: 4,
                  }}
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

export default UpdateForm;
