import { AuditStatus, PhaseNum, WaitStatus } from "@/enum";
import { subListContract } from "@/services/contract";
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { Image } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const ViewForm = (props) => {
  const { values, trigger, projects, suppliers, contracts, users } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState({ visible: false, src: "" });
  const [subContracts, setSubContracts] = useState([]);

  const parseAcceptanceNote = (raw) => {
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

  // 打开抽屉时，根据关联合同加载“关联补充合同”的只读选项，便于展示label
  useEffect(() => {
    const loadSubs = async () => {
      try {
        setSubContracts([]);
        if (open && values?.related_contract) {
          const res = await subListContract({
            own_contract_id: values?.related_contract,
          });
          const options = (res?.data || []).map((item) => ({
            value: String(item.sub_contract_id),
            label: item.project_name || String(item.sub_contract_id),
          }));
          setSubContracts(options);
        }
      } catch (e) {
        setSubContracts([]);
      }
    };
    loadSubs();
  }, [open, values?.related_contract]);

  return (
    <>
      <DrawerForm
        title="查看机械"
        formRef={formRef}
        open={open}
        trigger={cloneElement(trigger, {
          onClick: () => {
            setOpen(true);
          },
        })}
        width="600px"
        drawerProps={{
          onClose: () => setOpen(false),
          destroyOnClose: true,
        }}
        initialValues={{
          ...values,
          acceptance_note: (() => {
            const files = parseAcceptanceNote(values.acceptance_note);
            return files.map((f, idx) => ({
              uid: `-acceptance-${idx}`,
              name:
                f.fileName ||
                String(f.fileUrl).split("/").pop() ||
                `验收说明${idx + 1}`,
              status: "done",
              url: f.fileUrl,
            }));
          })(),
        }}
        submitter={false}
        readonly
      >
        <ProFormSelect
          name="project_id"
          label="项目名称"
          options={projects}
          readonly
        />
        <ProFormSelect
          name="supplier_unit"
          label="供货单位"
          options={suppliers}
          readonly
          convertValue={(value) => {
            const supplier = suppliers?.find((s) => s.value == value);
            return supplier ? supplier.label : value;
          }}
        />
        <ProFormSelect
          name="phase_num"
          label="期数"
          options={PhaseNum}
          readonly
        />
        <ProFormText name="material_name" label="机械名称" readonly />
        <ProFormTextArea name="spec_model" label="规格型号" readonly />
        <ProFormText name="unit" label="单位" readonly />
        <ProFormDigit
          name="quantity"
          label="数量"
          readonly
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormDigit
          name="unit_price"
          label="单价(元)"
          readonly
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormDigit
          name="total_price"
          label="合价(元)"
          readonly
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormSelect
          name="related_contract"
          label="关联合同"
          mode="multiple"
          options={contracts}
          readonly
        />
        <ProFormSelect
          name="related_sub_contract"
          label="关联补充合同"
          options={subContracts}
          readonly
        />
        <ProFormSelect
          name="audit_status"
          label="审核状态"
          options={AuditStatus}
          readonly
        />
        <ProFormSelect
          name="document_status"
          label="单据状态"
          options={WaitStatus}
          readonly
        />
        <ProFormText
          name="handler"
          label="经办人"
          readonly
          convertValue={(value) => {
            const user = users?.find((u) => u.value == value);
            return user ? user.label : value;
          }}
        />
        <ProFormUploadButton
          name="acceptance_note"
          label="验收说明"
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
