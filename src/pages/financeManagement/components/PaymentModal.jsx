import { Departments } from "@/enum";
import { addProcessRecord } from "@/services/business";
import { supplierList } from "@/services/supplier";
import {
  DrawerForm,
  EditableProTable,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { message, Timeline } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";

const PaymentModal = (props) => {
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
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
      title="结算付款审批单"
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
          // Calculate total amount
          const totalAmount = paymentItems.reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
          );
          if (paymentItems?.length === 0) {
            message.error("请补充付款明细");
            return false;
          }
          // Create process record
          const processRes = await addProcessRecord({
            relation_id: record.code,
            handler: currentUser?.nickname || "-",
            handle_opinion: values.payment_note || "-",
            audit_status: 0,
            document_status: 0,
            collection_detail: JSON.stringify(paymentItems),
            total_amount: totalAmount.toString(),
            remark: values.payment_note || "-",
          });

          if (processRes.code !== 200) {
            message.error(processRes.msg || "创建付款单失败");
            return false;
          }

          message.success("创建付款单成功");
          resetFormState();
          setOpen(false);
          onOk?.();
          return true;
        } catch (error) {
          message.error("创建付款单失败");
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
          <span style={{ color: "#666" }}>制单部门：</span>
          <span style={{ fontWeight: 500 }}>
            {Departments.find((d) => d.value == currentUser?.owner_dept)?.label}
            ({currentUser?.nickname})
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
          <span style={{ color: "#666" }}>供应商：</span>
          <span style={{ fontWeight: 500 }}>
            {suppliers.find((s) => s.value == record?.supplier)?.label ||
              record?.supplier ||
              "-"}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>收款开户银行：</span>
          <span style={{ fontWeight: 500 }}>
            {record?.supplier_bank || "-"}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>收款开户账号：</span>
          <span style={{ fontWeight: 500 }}>
            {record?.supplier_account || "-"}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#666" }}>待付款金额：</span>
          <span style={{ fontWeight: 500, color: "#ff4d4f" }}>
            ¥{record?.wait_account_paid || "0.00"}
          </span>
        </div>
        <div>
          <span style={{ color: "#666" }}>已付款金额：</span>
          <span style={{ fontWeight: 500, color: "#52c41a" }}>
            ¥{record?.account_paid || "0.00"}
          </span>
        </div>
      </div>
      <EditableProTable
        rowKey="id"
        headerTitle="收款明细"
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
            title: "收款内容",
            dataIndex: "content",
            valueType: "textarea",
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: "请输入收款内容",
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
            width: 120,
            render: (text, record, _, action) => {
              return [
                <a
                  key="editable"
                  onClick={() => action?.startEditable?.(record.id)}
                >
                  编辑
                </a>,
                <a
                  key="delete"
                  onClick={() => {
                    setPaymentItems(
                      paymentItems.filter((item) => item.id !== record.id)
                    );
                  }}
                >
                  删除
                </a>,
              ];
            },
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
        name="payment_note"
        label="付款备注"
        placeholder="请输入付款备注（选填）"
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

export default PaymentModal;
