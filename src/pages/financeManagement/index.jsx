import {
  allListMaterials,
  listProcessRecord,
  listProject,
} from "@/services/business";
import { supplierList } from "@/services/supplier";
import { fetchUser } from "@/services/user";
import { checkPower } from "@/utils";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { message } from "antd";
import { useEffect, useRef, useState } from "react";
import PaymentModal from "./components/PaymentModal";
import PaymentRecordModal from "./components/PaymentRecordModal";

const FinanceManagement = () => {
  const { initialState } = useModel("@@initialState");
  const currentUser = initialState?.currentUser;
  const actionRef = useRef(null);
  const [suppliers, setSuppliers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProcessRecord, setAllProcessRecord] = useState([]);
  const [users, setUsers] = useState([]);
  const [canMaterial, setCanMaterial] = useState(false);
  const [canMechanical, setCanMechanical] = useState(false);
  const [canArtificial, setCanArtificial] = useState(false);

  useEffect(() => {
    (async () => {
      if (!currentUser?.id) return;
      const [m, me, a] = await Promise.all([
        checkPower(`成本部-材料确认单-${currentUser.id}`, 1, currentUser?.role),
        checkPower(`工程部-机械确认单-${currentUser.id}`, 1, currentUser?.role),
        checkPower(`工程部-人工确认单-${currentUser.id}`, 1, currentUser?.role),
      ]);
      setCanMaterial(m);
      setCanMechanical(me);
      setCanArtificial(a);
    })();
  }, [currentUser?.id]);

  const fetchProcessRecord = async () => {
    const res = await listProcessRecord();
    if (res.code === 200) {
      setAllProcessRecord(res.data);
    }
  };

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

  const fetchProjects = async () => {
    const res = await listProject();
    if (res.code === 200) {
      setProjects(
        res.data.map((item) => ({
          value: item.project_id,
          label: item.project_name,
        }))
      );
    }
  };

  const fetchUsers = async () => {
    const res = await fetchUser();
    if (res.code === 200) {
      setUsers(
        res.data.map((item) => ({
          value: item.id,
          label: item.nickname || item.username,
        }))
      );
    }
  };

  useEffect(() => {
    fetchProcessRecord();
    fetchSuppliers();
    fetchProjects();
    fetchUsers();
  }, []);

  const columns = [
    {
      title: "名称",
      dataIndex: "material_name",
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        if (record?.material_name) {
          return record?.material_name;
        }
        if (record?.machinery_name) {
          return record?.machinery_name;
        }
        if (record?.artificial_name) {
          return record?.artificial_name;
        }
        return "-";
      },
    },
    {
      title: "规格型号",
      dataIndex: "spec_model",
      width: 120,
      hideInSearch: true,
    },
    {
      title: "供应商",
      dataIndex: "supplier",
      width: 200,
      valueType: "select",
      fieldProps: {
        options: suppliers,
      },
      render: (text, record) => {
        const supplier = suppliers.find((s) => s.value == record.supplier);
        return supplier ? supplier.label : record.supplier;
      },
    },
    {
      title: "期数",
      dataIndex: "phase_num",
      width: 100,
      valueEnum: {
        1: { text: "一期" },
        2: { text: "二期" },
        3: { text: "三期" },
        4: { text: "四期" },
        5: { text: "五期" },
      },
    },
    {
      title: "单位",
      dataIndex: "unit",
      width: 100,
      hideInSearch: true,
    },
    {
      title: "预算单位",
      dataIndex: "budget_unit",
      width: 100,
      hideInSearch: true,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      width: 100,
      valueType: "digit",
      hideInSearch: true,
    },
    {
      title: "预算数量",
      dataIndex: "budget_quantity",
      width: 100,
      hideInSearch: true,
    },
    {
      title: "合同单价",
      dataIndex: "contract_unit_price",
      width: 120,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "预算单价",
      dataIndex: "budget_unit_price",
      width: 120,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "合同总价",
      dataIndex: "contract_total_price",
      width: 120,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "预算总价",
      dataIndex: "budget_total_price",
      width: 120,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "待付款金额",
      dataIndex: "wait_account_paid",
      width: 150,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "已付款金额",
      dataIndex: "account_paid",
      width: 150,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "归属项目",
      dataIndex: "project_name",
      width: 150,
      valueType: "select",
      fieldProps: {
        options: projects,
        showSearch: true,
        filterOption: (input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      },
      search: {
        transform: (value) => ({ project_id: value }),
      },
    },
    {
      title: "类型",
      dataIndex: "data_type",
      width: 100,
      valueType: "select",
      valueEnum: {
        material: { text: "材料" },
        mechanical: { text: "机械" },
        artificial: { text: "人工" },
      },
    },
    {
      title: "已关联付款单",
      dataIndex: "payment_code",
      width: 110,
      hideInSearch: true,
      fixed: "right",
      render: (text, record) => {
        const relatedRecords = allProcessRecord.filter(
          (pr) => pr.relation_id === record.code
        );
        const count = relatedRecords.length;
        if (count === 0) return "-";
        return (
          <PaymentRecordModal
            trigger={<a>{count}</a>}
            records={relatedRecords}
            currentInfo={record}
            users={users}
            currentUser={currentUser}
            onRefresh={() => {
              fetchProcessRecord();
              actionRef.current?.reload();
            }}
          />
        );
      },
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      fixed: "right",
      render: (text, record) => {
        const actions = [];
        if (record.wait_account_paid > 0) {
          const canCreate =
            (record.data_type === "material" && canMaterial) ||
            (record.data_type === "mechanical" && canMechanical) ||
            (record.data_type === "artificial" && canArtificial);
          if (canCreate) {
            actions.push(
              <PaymentModal
                key="payment"
                record={record}
                onOk={() => {
                  fetchProcessRecord();
                  actionRef.current?.reload();
                }}
                trigger={<a>创建付款单</a>}
              />
            );
          }
        }

        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="财务管理列表"
        actionRef={actionRef}
        rowKey={(record) => `${record.data_type}-${record.code}`}
        search={{
          labelWidth: 120,
        }}
        request={async (params, sort, filter) => {
          // Remove pagination parameters
          fetchProcessRecord();
          const { current, pageSize, ...queryParams } = params;
          const res = await allListMaterials(queryParams);
          if (res.code === 200) {
            const userId = currentUser?.id;
            const ownerDept = currentUser?.owner_dept;
            const filterList = (res.data.list || []).filter((item) => {
              if (userId == 1 || userId == 2) return true;
              if (ownerDept == 1) return item.data_type === "material";
              if (ownerDept == 2)
                return (
                  item.data_type === "mechanical" ||
                  item.data_type === "artificial"
                );
              return true;
            });
            return {
              data: filterList,
              success: true,
              total: res.data.summary?.totalCount || 0,
            };
          } else {
            message.error(res?.msg || "获取数据失败");
            return {
              data: [],
              success: true,
              total: 0,
            };
          }
        }}
        columns={columns}
        scroll={{ x: 1500 }}
        summary={(pageData) => {
          let totalQuantity = 0;
          let totalBudgetQuantity = 0;
          let totalContractUnitPrice = 0;
          let totalBudgetUnitPrice = 0;
          let totalContractTotalPrice = 0;
          let totalBudgetTotalPrice = 0;
          let totalWaitAccountPaid = 0;
          let totalAccountPaid = 0;

          pageData.forEach(
            ({
              quantity,
              budget_quantity,
              contract_unit_price,
              budget_unit_price,
              contract_total_price,
              budget_total_price,
              wait_account_paid,
              account_paid,
            }) => {
              totalQuantity += Number(quantity) || 0;
              totalBudgetQuantity += Number(budget_quantity) || 0;
              totalContractUnitPrice += Number(contract_unit_price) || 0;
              totalBudgetUnitPrice += Number(budget_unit_price) || 0;
              totalContractTotalPrice += Number(contract_total_price) || 0;
              totalBudgetTotalPrice += Number(budget_total_price) || 0;
              totalWaitAccountPaid += Number(wait_account_paid) || 0;
              totalAccountPaid += Number(account_paid) || 0;
            }
          );

          return (
            <>
              <ProTable.Summary.Row>
                <ProTable.Summary.Cell index={0} colSpan={6}>
                  <strong>合计</strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={6}>
                  <strong>{totalQuantity.toLocaleString()}</strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={7}>
                  <strong>{totalBudgetQuantity.toLocaleString()}</strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={8}>
                  <strong style={{ color: "orange" }}>
                    ¥
                    {totalContractUnitPrice.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={9}>
                  <strong style={{ color: "orange" }}>
                    ¥
                    {totalBudgetUnitPrice.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={10}>
                  <strong style={{ color: "blue" }}>
                    ¥
                    {totalContractTotalPrice.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={11}>
                  <strong style={{ color: "blue" }}>
                    ¥
                    {totalBudgetTotalPrice.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={12}>
                  <strong style={{ color: "red" }}>
                    ¥
                    {totalWaitAccountPaid.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={13}>
                  <strong style={{ color: "green" }}>
                    ¥
                    {totalAccountPaid.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                <ProTable.Summary.Cell index={14} colSpan={4} />
              </ProTable.Summary.Row>
            </>
          );
        }}
      />
    </PageContainer>
  );
};

export default FinanceManagement;
