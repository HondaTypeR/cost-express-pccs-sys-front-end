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
import { Image } from "antd";
import { cloneElement, useRef, useState } from "react";

const ViewForm = (props) => {
  const { values, trigger, suppliers, projects } = props;
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

  return (
    <>
      <DrawerForm
        title="查看补充合同"
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
          party_b_id: values.party_b_id || values.party_b,
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
        submitter={false}
        readonly
      >
        <ProFormRadio.Group
          name="contract_type"
          label="合同类型"
          readonly
          options={[
            { label: "工程合同", value: "1" },
            { label: "采购合同", value: "2" },
            { label: "劳务合同", value: "3" },
            { label: "其他合同", value: "4" },
          ]}
        />
        <ProFormText
          name="project_id"
          label="归属项目"
          readonly
          convertValue={(value) => {
            const project = projects.find((p) => p.value == value);
            return project ? project.label : value;
          }}
        />
        <ProFormText name="project_name" label="合同名称" readonly />
        <ProFormText name="party_a" label="甲方" readonly />
        <ProFormSelect
          name="party_b_id"
          label="乙方"
          options={suppliers}
          readonly
          convertValue={(value) => {
            const supplier = suppliers?.find((s) => s.value == value);
            return supplier ? supplier.label : value;
          }}
        />
        <ProFormDigit
          name="contract_amount"
          label="合同金额"
          fieldProps={{
            precision: 2,
            style: { width: "100%" },
          }}
          readonly
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
          options={[
            { label: "一期", value: "1" },
            { label: "二期", value: "2" },
            { label: "三期", value: "3" },
            { label: "四期", value: "4" },
            { label: "五期", value: "5" },
          ]}
          readonly
        />
        <ProFormTextArea
          name="project_content"
          label="项目内容"
          fieldProps={{
            rows: 4,
          }}
          readonly
        />
        <ProFormSelect
          name="type"
          label="类型"
          options={[
            { label: "材料", value: "material" },
            { label: "机械", value: "machinery" },
            { label: "包工包料", value: "package" },
            { label: "其他", value: "other" },
          ]}
          readonly
        />
        <ProFormDependency name={["type"]}>
          {({ type }) => {
            if (type === "material" || type === "package") {
              return (
                <ProFormTextArea
                  name="material_name"
                  label="材料名称"
                  readonly
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
                  readonly
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
                  readonly
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
                  readonly
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
          disabled
          fieldProps={{
            name: "files",
            listType: "text",
            showUploadList: {
              showDownloadIcon: true,
              showRemoveIcon: false,
              showPreviewIcon: true,
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

export default ViewForm;
