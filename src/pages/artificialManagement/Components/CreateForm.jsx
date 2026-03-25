import { PhaseNum } from "@/enum";
import { addArtificial } from "@/services/business";
import { subListContract } from "@/services/contract";
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Image, Upload, message } from "antd";
import { cloneElement, useRef, useState } from "react";

const CreateForm = (props) => {
  const { onOk, trigger, projects, suppliers, contracts } = props;
  const { initialState } = useModel("@@initialState");
  const currentUser = initialState?.currentUser;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [imgPreview, setImgPreview] = useState({ visible: false, src: "" });
  const [subContracts, setSubContracts] = useState([]);
  const [subContractMap, setSubContractMap] = useState({});

  const getFileMeta = (file) => {
    const fileUrl =
      file?.response?.data?.fileList?.[0]?.fileUrl ||
      file?.url ||
      file?.thumbUrl ||
      "";
    const fileName = String(file?.name || "");
    if (!fileUrl) return null;
    return {
      fileUrl,
      fileName,
    };
  };

  // 计算合价
  const calculateTotalPrice = (qty, price) => {
    const total = (qty || 0) * (price || 0);
    setTotalPrice(total);
    formRef.current?.setFieldsValue({ total_price: total });
  };

  const handleQuantityChange = (value) => {
    setQuantity(value || 0);
    calculateTotalPrice(value || 0, unitPrice);
  };

  const handleUnitPriceChange = (value) => {
    setUnitPrice(value || 0);
    calculateTotalPrice(quantity, value || 0);
  };

  return (
    <>
      <DrawerForm
        title="新建人工"
        formRef={formRef}
        open={open}
        trigger={cloneElement(trigger, {
          onClick: () => {
            setOpen(true);
            // 自动填充经办人为当前登录用户ID
            setTimeout(() => {
              formRef.current?.setFieldsValue({
                handler: currentUser?.id || "",
                audit_status: 0, // 默认待审核
                document_status: 0, // 默认草稿
              });
            }, 100);
          },
        })}
        width="600px"
        drawerProps={{
          onClose: () => {
            setOpen(false);
            setQuantity(0);
            setUnitPrice(0);
            setTotalPrice(0);
          },
          destroyOnClose: true,
        }}
        onFinish={async (value) => {
          const selectedProject = projects.find(
            (p) => p.value === value.project_id
          );

          const acceptanceNoteList = Array.isArray(value.acceptance_note)
            ? value.acceptance_note
            : [];
          const acceptanceNoteFiles = acceptanceNoteList
            .map(getFileMeta)
            .filter(Boolean);
          const acceptanceNotePayload = acceptanceNoteFiles.length
            ? JSON.stringify(acceptanceNoteFiles)
            : "";

          const params = {
            ...value,
            project_name: selectedProject?.label || "",
            acceptance_note: acceptanceNotePayload,
          };
          const res = await addArtificial(params);

          if (res.code === 200) {
            message.success(res?.msg || "创建成功");
            setOpen(false);
            setQuantity(0);
            setUnitPrice(0);
            setTotalPrice(0);
            onOk?.();
            return true;
          } else {
            message.error(res?.msg || "创建失败");
            return false;
          }
        }}
      >
        <ProFormSelect
          name="project_id"
          label="项目名称"
          placeholder="请选择项目"
          options={projects}
          rules={[
            {
              required: true,
              message: "请选择项目",
            },
          ]}
        />
        <ProFormSelect
          name="related_contract"
          label="关联合同"
          placeholder="请选择关联合同"
          options={contracts}
          fieldProps={{
            showSearch: true,
            filterOption: (input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
            onChange: async (value) => {
              // 若清空：清空补充合同及选项
              if (!value) {
                setSubContracts([]);
                setSubContractMap({});
                formRef.current?.setFieldsValue({
                  related_sub_contract: undefined,
                });
                return;
              }

              const selectedContract = contracts?.find(
                (c) => c.value === value
              );
              if (selectedContract) {
                formRef.current?.setFieldsValue({
                  supplier_unit: Number(selectedContract.party_b_id),
                  phase_num: selectedContract.term,
                  material_name:
                    selectedContract.people_name ??
                    selectedContract.material_name ??
                    selectedContract.machinery_name,
                  spec_model: selectedContract.spec_model,
                  related_sub_contract: undefined,
                });
              }

              // 加载该主合同的补充合同
              try {
                setSubContracts([]);
                setSubContractMap({});
                const res = await subListContract({ own_contract_id: value });
                const list = res?.data || [];
                const options = list.map((item) => ({
                  value: String(item.sub_contract_id),
                  label: item.project_name || String(item.sub_contract_id),
                }));
                setSubContracts(options);
                const map = {};
                list.forEach((it) => {
                  map[String(it.sub_contract_id)] = it;
                });
                setSubContractMap(map);
              } catch (e) {
                setSubContracts([]);
                setSubContractMap({});
              }
            },
          }}
        />
        <ProFormSelect
          name="related_sub_contract"
          label="关联补充合同"
          placeholder="请选择关联补充合同"
          options={subContracts}
          fieldProps={{
            showSearch: true,
            filterOption: (input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
            onChange: (value) => {
              const sc = subContractMap?.[value];
              if (sc) {
                const name =
                  sc.people_name ?? sc.material_name ?? sc.machinery_name;
                formRef.current?.setFieldsValue({
                  supplier_unit: sc.party_b_id
                    ? Number(sc.party_b_id)
                    : undefined,
                  phase_num: sc.term,
                  material_name: name,
                  spec_model: sc.spec_model,
                });
              }
            },
          }}
        />
        <ProFormSelect
          name="supplier_unit"
          label="供货单位"
          placeholder="请选择供货单位"
          options={suppliers}
          rules={[
            {
              required: true,
              message: "请选择供货单位",
            },
          ]}
        />
        <ProFormSelect
          name="phase_num"
          label="期数"
          placeholder="请选择期数"
          options={PhaseNum}
          rules={[
            {
              required: true,
              message: "请选择期数",
            },
          ]}
        />
        <ProFormText
          name="material_name"
          label="人工名称"
          placeholder="请输入人工名称"
          rules={[
            {
              required: true,
              message: "请输入人工名称",
            },
          ]}
        />
        <ProFormTextArea
          name="spec_model"
          label="规格型号"
          placeholder="请输入规格型号"
          rules={[
            {
              required: true,
              message: "请输入规格型号",
            },
          ]}
        />
        <ProFormText
          name="dept"
          label="具体部位"
          placeholder="请输入具体部位"
        />
        <ProFormText
          name="unit"
          label="单位"
          placeholder="请输入单位"
          rules={[
            {
              required: true,
              message: "请输入单位",
            },
          ]}
        />
        <ProFormDigit
          name="quantity"
          label="数量"
          placeholder="请输入数量"
          fieldProps={{
            precision: 2,
            onChange: handleQuantityChange,
          }}
          rules={[
            {
              required: true,
              message: "请输入数量",
            },
          ]}
        />
        <ProFormDigit
          name="unit_price"
          label="单价(元)"
          placeholder="请输入单价"
          fieldProps={{
            precision: 2,
            onChange: handleUnitPriceChange,
          }}
          rules={[
            {
              required: true,
              message: "请输入单价",
            },
          ]}
        />
        <ProFormDigit
          name="total_price"
          label="合价(元)"
          placeholder="自动计算"
          readonly
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormText
          name="handler"
          label="经办人"
          placeholder="当前登录用户"
          readonly
          hidden
          rules={[
            {
              required: true,
              message: "经办人不能为空",
            },
          ]}
        />
        <ProFormUploadButton
          name="acceptance_note"
          label="验收说明"
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
