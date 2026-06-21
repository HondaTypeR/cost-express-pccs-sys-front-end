import { getDeptLabel, useDeptOptions } from "@/hooks/useDeptOptions";
import { addWorkFeeApply, updateWorkFeeApply } from "@/services/business";
import { supplierList } from "@/services/supplier";
import {
  DrawerForm,
  EditableProTable,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { message, Timeline } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const AddAndEdit = (props) => {
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
  const { allDeptOptions } = useDeptOptions();

  const { trigger, record, onOk } = props;
  const formRef = useRef();
  const [open, setOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentItems, setPaymentItems] = useState([]);
  const [editableKeys, setEditableRowKeys] = useState([]);

  const resetFormState = () => {
    formRef.current?.resetFields?.();
    setPaymentItems([]);
    setEditableRowKeys([]);
  };

  useEffect(() => {
    if (!open) return;
    if (record?.info) {
      try {
        const parsed = JSON.parse(record.info);
        setPaymentItems(parsed);
        setEditableRowKeys([]);
      } catch {
        setPaymentItems([]);
      }
    }
    if (record?.mark && record.mark !== "-") {
      setTimeout(() => {
        formRef.current?.setFieldValue("mark", record.mark);
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const res = await supplierList();
      if (res.code === 200) {
        setSuppliers(
          res.data.map((item) => ({
            value: item.supplier_id,
            label: item.supplier_name,
          }))
        );
      }
    };
    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  return (
    <DrawerForm
      title={record?.id ? "编辑报销单" : "新建报销单"}
      formRef={formRef}
      open={open}
      trigger={
        trigger
          ? cloneElement(trigger, {
              onClick: () => {
                resetFormState();
                setOpen(true);
              },
            })
          : null
      }
      width={1000}
      drawerProps={{
        onClose: () => {
          setOpen(false);
          resetFormState();
        },
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        try {
          const totalAmount = paymentItems.reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
          );
          if (paymentItems?.length === 0) {
            message.error("请补充报销明细");
            return false;
          }
          const payload = {
            dept: record.dept,
            info: JSON.stringify(paymentItems),
            total: totalAmount.toString(),
            payee: currentUser?.nickname,
            payee_card_no: currentUser?.bankCardNo,
            payee_bank: currentUser?.bankCardName,
            handler: currentUser?.nickname || "-",
            audit_status: 0,
            document_status: 0,
            mark: values.mark || "-",
          };
          const processRes = record?.id
            ? await updateWorkFeeApply({ ...payload, id: record.id })
            : await addWorkFeeApply(payload);

          if (processRes.code !== 200) {
            message.error(processRes.msg || "创建失败");
            return false;
          }

          message.success(record?.id ? "更新成功" : "创建成功");
          resetFormState();
          setOpen(false);
          onOk?.();
          return true;
        } catch (error) {
          message.error("操作失败");
          return false;
        }
      }}
    >
      <div
        style={{
          padding: 12,
          background: "#f5f5f5",
          borderRadius: 4,
          marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>收款人信息：</span>
          <span style={{ fontWeight: 500 }}>
            {currentUser?.nickname}(
            {getDeptLabel(allDeptOptions, currentUser?.owner_dept)}
            )
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>填报日期：</span>
          <span style={{ fontWeight: 500 }}>
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>收款开户银行：</span>
          <span style={{ fontWeight: 500 }}>
            {currentUser?.bankCardName || "-"}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>收款开户账号：</span>
          <span style={{ fontWeight: 500 }}>
            {currentUser?.bankCardNo || "-"}
          </span>
        </div>
      </div>
      <EditableProTable
        rowKey="id"
        headerTitle="报销明细"
        maxLength={10}
        recordCreatorProps={{
          position: "bottom",
          record: () => ({
            id: Date.now(),
          }),
          creatorButtonText: "添加一行数据",
        }}
        columns={[
          {
            title: "序号",
            dataIndex: "index",
            valueType: "index",
            width: 60,
            editable: false,
          },
          {
            title: "报销内容",
            dataIndex: "content",
            valueType: "textarea",
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: "请输入报销内容",
                },
              ],
            },
          },
          {
            title: "金额(元)",
            dataIndex: "amount",
            valueType: "digit",
            width: 150,
            fieldProps: {
              precision: 2,
              min: 1,
              style: { width: "100%" },
            },
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: "请输入金额",
                },
              ],
            },
          },
          {
            title: "操作",
            valueType: "option",
            width: 160,
            render: (text, row, _, action) => [
              <a key="editable" onClick={() => action?.startEditable?.(row.id)}>
                编辑
              </a>,
              <a
                key="delete"
                onClick={() =>
                  setPaymentItems(
                    paymentItems.filter((item) => item.id !== row.id)
                  )
                }
              >
                删除
              </a>,
            ],
          },
        ]}
        value={paymentItems}
        onChange={setPaymentItems}
        editable={{
          editableKeys,
          onChange: setEditableRowKeys,
        }}
      />
      <div
        style={{
          marginTop: 16,
          marginBottom: 16,
          padding: 12,
          background: "#f5f5f5",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        合计：
        {(() => {
          const total = paymentItems.reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
          );
          const digitUppercase = (n) => {
            const fraction = ["角", "分"];
            const digit = [
              "零",
              "壹",
              "贰",
              "叁",
              "肆",
              "伍",
              "陆",
              "柒",
              "捌",
              "玖",
            ];
            const unit = [
              ["元", "万", "亿"],
              ["", "拾", "佰", "仟"],
            ];
            let num = Math.abs(n);
            let s = "";
            fraction.forEach((item, index) => {
              s += (
                digit[Math.floor(num * 10 * 10 ** index) % 10] + item
              ).replace(/零./, "");
            });
            s = s || "整";
            num = Math.floor(num);
            for (let i = 0; i < unit[0].length && num > 0; i += 1) {
              let p = "";
              for (let j = 0; j < unit[1].length && num > 0; j += 1) {
                p = digit[num % 10] + unit[1][j] + p;
                num = Math.floor(num / 10);
              }
              s =
                p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s;
            }
            return s
              .replace(/(零.)*零元/, "元")
              .replace(/(零.)+/g, "零")
              .replace(/^整$/, "零元整");
          };
          return `¥${total}（大写：${digitUppercase(total)}）`;
        })()}
      </div>
      <ProFormTextArea
        name="mark"
        label="备注"
        placeholder="请输入备注（选填）"
        fieldProps={{
          rows: 4,
        }}
      />
      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #d9d9d9",
          borderRadius: 4,
        }}
      >
        <h4 style={{ marginBottom: 16, fontWeight: 600 }}>审批流程</h4>
        <Timeline
          items={[
            {
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    经办人发起审批
                  </div>
                </div>
              ),
            },
            {
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    经办部门负责人审批
                  </div>
                </div>
              ),
            },
            {
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    财务部负责人审批
                  </div>
                </div>
              ),
            },
            {
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    复核人审批
                  </div>
                </div>
              ),
            },
            {
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    终审人审批
                  </div>
                </div>
              ),
            },
            {
              children: (
                <div>
                  <div
                    style={{
                      fontWeight: 500,
                      marginBottom: 4,
                      color: "#52c41a",
                    }}
                  >
                    完结归档
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </DrawerForm>
  );
};

export default AddAndEdit;
