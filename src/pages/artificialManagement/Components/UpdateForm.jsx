import { PhaseNum } from "@/enum";
import { updateArtificial } from "@/services/business";
import { subListContract } from "@/services/contract";
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { Image, Upload, message } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const UpdateForm = (props) => {
  const { onOk, values, trigger, projects, suppliers, contracts, users } =
    props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(values.quantity || 0);
  const [unitPrice, setUnitPrice] = useState(values.unit_price || 0);
  const [totalPrice, setTotalPrice] = useState(values.total_price || 0);
  const [imgPreview, setImgPreview] = useState({ visible: false, src: "" });
  const [subContracts, setSubContracts] = useState([]);
  const [subContractMap, setSubContractMap] = useState({});

  useEffect(() => {
    if (open) {
      setQuantity(values.quantity || 0);
      setUnitPrice(values.unit_price || 0);
      setTotalPrice(values.total_price || 0);
      formRef.current?.setFieldsValue({
        total_price: values.total_price || 0,
      });
    }
  }, [open, values]);

  // 打开编辑抽屉时，如果已有关联合同，预加载其补充合同列表
  useEffect(() => {
    const loadSubs = async () => {
      try {
        setSubContracts([]);
        setSubContractMap({});
        if (open && values?.related_contract) {
          const res = await subListContract({
            own_contract_id: values.related_contract,
          });
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
        }
      } catch (e) {
        setSubContracts([]);
        setSubContractMap({});
      }
    };
    loadSubs();
  }, [open, values?.related_contract]);

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

  return (
    <>
      <DrawerForm
        title="编辑人工"
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
          related_contract: values.related_contract
            ? Number(values.related_contract)
            : undefined,
          related_sub_contract: values.related_sub_contract
            ? String(values.related_sub_contract)
            : undefined,
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
            artficial_code: values.artficial_code,
            project_name: selectedProject?.label || "",
            related_contract: value.related_contract,
            acceptance_note: acceptanceNotePayload,
          };
          const res = await updateArtificial(params);

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
              // 清空/更换关联合同时，先清空补充合同
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
          convertValue={(value) => {
            const supplier = suppliers?.find((s) => s.value == value);
            return supplier ? supplier.value : value;
          }}
          fieldProps={{
            showSearch: true,
            filterOption: (input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
          }}
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
