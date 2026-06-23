import { AuditStatus, PhaseNum } from "@/enum";
import {
  addReviewLog,
  approveMechanical,
  deleteMechanical,
  deleteReviewLog,
  listContract,
  listMechanical,
  listProject,
  listReviewLog,
  rejectMechanical,
  submitMechanicalApproval,
  updateReviewLog,
} from "@/services/business";
import { supplierList } from "@/services/supplier";
import { fetchUser } from "@/services/user";
import { checkPower } from "@/utils";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Button, message, Popconfirm } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import ApprovalLogModal from "../materialManagement/Components/ApprovalLogModal";
import ApprovalModal from "./Components/ApprovalModal";
import CreateForm from "./Components/CreateForm";
import FinalAuditModal from "./Components/FinalAuditModal";
import ReviewApprovalModal from "./Components/ReviewApprovalModal";
import UpdateForm from "./Components/UpdateForm";
import ViewForm from "./Components/ViewForm";

const DEPT = "工程部";
const POWER = "机械确认单";

const MaterialManagement = () => {
  const { initialState } = useModel("@@initialState");
  const currentUser = initialState?.currentUser;
  const actionRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [canCreate, setCanCreate] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    (async () => {
      if (!currentUser?.id) return;
      const ok = await checkPower(`${DEPT}-${POWER}-${currentUser.id}`, 1, currentUser?.role);
      setCanCreate(ok);
    })();
  }, [currentUser?.id]);

  useEffect(() => {
    (async () => {
      if (!currentUser?.id) return;
      const ok = await checkPower(`${DEPT}-${POWER}-${currentUser.id}`, 2, currentUser?.role);
      setCanReview(ok);
    })();
  }, [currentUser?.id]);

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

  const fetchContracts = async () => {
    const res = await listContract();
    if (res.code === 200) {
      setContracts(
        res.data.map((item) => ({
          value: item.contract_id,
          label: `${item.project_name} (${item.contract_id})`,
          ...item,
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
    fetchProjects();
    fetchSuppliers();
    fetchContracts();
    fetchUsers();
  }, []);

  const columns = [
    {
      title: "序号",
      dataIndex: "mechanical_code",
      width: 80,
      search: false,
    },
    {
      title: "项目名称",
      dataIndex: "project_id",
      width: 200,
      valueType: "select",
      fieldProps: {
        options: projects,
      },
    },
    {
      title: "供货单位",
      dataIndex: "supplier_unit",
      width: 200,
      valueType: "select",
      fieldProps: {
        options: suppliers,
      },
      render: (text, record) => {
        const supplier = suppliers.find((s) => s.value == record.supplier_unit);
        return supplier ? supplier.label : record.supplier_unit;
      },
    },
    {
      title: "期数",
      dataIndex: "phase_num",
      width: 120,
      valueType: "select",
      fieldProps: {
        options: PhaseNum,
      },
      render: (text, record) => {
        if (!record.phase_num) return "-";
        const found = PhaseNum.find((item) => item.value === record.phase_num);
        return found ? found.label : record.phase_num;
      },
    },
    {
      title: "机械名称",
      dataIndex: "material_name",
      width: 200,
    },
    {
      title: "规格型号",
      dataIndex: "spec_model",
      width: 200,
    },
    {
      title: "单位",
      dataIndex: "unit",
      width: 100,
      hideInSearch: true,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      width: 120,
      valueType: "digit",
      hideInSearch: true,
    },
    {
      title: "单价(元)",
      dataIndex: "unit_price",
      width: 120,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "合价(元)",
      dataIndex: "total_price",
      width: 150,
      valueType: "money",
      hideInSearch: true,
    },
    {
      title: "已付款金额",
      dataIndex: "account_paid",
      valueType: "money",
      width: 150,
      hideInSearch: true,
    },
    {
      title: "未付款金额",
      dataIndex: "wait_account_paid",
      valueType: "money",
      width: 150,
      hideInSearch: true,
    },
    {
      title: "关联合同",
      dataIndex: "related_contract",
      width: 200,
      hideInSearch: true,
      render: (text, record) => {
        if (!record.related_contract) return "-";
        const contract = contracts.find(
          (c) => c.value == record.related_contract
        );
        return contract ? contract.label : record.related_contract;
      },
    },
    {
      title: "审核状态",
      dataIndex: "audit_status",
      width: 120,
      valueType: "select",
      fieldProps: {
        options: AuditStatus,
      },
      render: (text, record) => {
        const found = AuditStatus.find(
          (item) => item.value === record.audit_status
        );
        return found ? found.label : "-";
      },
    },
    {
      title: "单据状态",
      dataIndex: "document_status",
      width: 120,
      valueType: "select",
      fieldProps: {
        options: [
          {
            label: "草稿",
            value: 0,
          },
          {
            label: "已提交",
            value: 1,
          },
          {
            label: "已验收",
            value: 2,
          },
          {
            label: "已归档",
            value: 3,
          },
        ],
      },
      render: (text, record) => {
        return record?.document_status_text || "-";
      },
    },
    {
      title: "经办人",
      dataIndex: "handler",
      width: 120,
      render: (text, record) => {
        const user = users.find((u) => u.value == record.handler);
        return user ? user.label : record.handler;
      },
    },
    {
      title: "创建时间",
      dataIndex: "create_time",
      valueType: "dateTime",
      width: 180,
      hideInSearch: true,
    },
    {
      title: "操作",
      valueType: "option",
      width: 250,
      fixed: "right",
      render: (text, record) => {
        const actions = [
          <ViewForm
            key="view"
            values={record}
            trigger={<a>查看</a>}
            projects={projects}
            suppliers={suppliers}
            contracts={contracts}
            users={users}
          />,
        ];
        actions.push(
          <ApprovalLogModal
            key="approval-log"
            log_type="机械"
            materialCode={record.mechanical_code}
            trigger={<a>审批日志</a>}
          />
        );

        // 只有状态为草稿时且当前登录用户是经办人时，且有权限，显示编辑、删除和发起审批按钮
        if (
          record.document_status === 0 &&
          currentUser?.id == record.handler &&
          canCreate
        ) {
          actions.push(
            <UpdateForm
              key="edit"
              values={record}
              onOk={() => actionRef.current?.reload()}
              trigger={<a>编辑</a>}
              projects={projects}
              suppliers={suppliers}
              contracts={contracts}
              users={users}
            />
          );

          actions.push(
            <ApprovalModal
              key="approval"
              dept={DEPT}
              power={POWER}
              level={2}
              currentUser={currentUser}
              trigger={<a>发起审批</a>}
              users={users}
              currentStatus={record.document_status}
              onOk={async (reviewerId) => {
                await addReviewLog({
                  link_info: record.mechanical_code,
                  log_type: "机械",
                  level_one_reviewer: currentUser?.username,
                  level_one_review_status: "发起审批",
                  level_one_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  level_two_reviewer: users.find(
                    (user) => user.value === reviewerId
                  )?.label,
                  level_two_review_status: "待审批",
                });
                const res = await submitMechanicalApproval({
                  mechanical_code: record.mechanical_code,
                  document_status: record.document_status + 1,
                  user_id: reviewerId,
                });
                if (res.code === 200) {
                  message.success(res?.msg || "审批发起成功");
                  actionRef.current?.reload();
                  return true;
                } else {
                  message.error(res?.msg || "审批发起失败");
                  return false;
                }
              }}
            />
          );

          actions.push(
            <Popconfirm
              key="delete"
              title="确认删除"
              description="确定要删除这条机械记录吗？删除后无法恢复。"
              onConfirm={async () => {
                try {
                  await deleteReviewLog({
                    link_info: record.mechanical_code,
                    log_type: "机械",
                  });
                } catch (e) { }
                const res = await deleteMechanical({
                  mechanical_code: record.mechanical_code,
                });
                if (res.code === 200) {
                  message.success(res?.msg || "删除成功");
                  actionRef.current?.reload();
                } else {
                  message.error(res?.msg || "删除失败");
                }
              }}
              okText="确认"
              cancelText="取消"
            >
              <a key="delete" style={{ color: "red" }}>
                删除
              </a>
            </Popconfirm>
          );
        }

        // 如果审核状态是待审核且单据状态是复核审核中，且当前用户是审批人，且有权限，显示复审审批按钮
        if (
          record.document_status === 1 &&
          record.reviewer == currentUser?.id &&
          canReview
        ) {
          actions.push(
            <ReviewApprovalModal
              key="review-approval"
              trigger={<a>复审审批</a>}
              users={users}
              onOk={async (approvalStatus, approvalOpinion, user_id) => {
                let res;
                const getCurrentLog = await listReviewLog({
                  link_info: record.mechanical_code,
                  log_type: "机械",
                });
                const logId = getCurrentLog.data?.[0]?.id;
                if (approvalStatus === 1) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_two_review_status: "审批通过",
                      level_two_review_remark: approvalOpinion,
                      level_two_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                      level_three_reviewer: users.find(
                        (user) => user.value === user_id
                      )?.label,
                      level_three_review_status: "待审批",
                    });
                  }
                  // 审批通过
                  res = await approveMechanical({
                    mechanical_code: record.mechanical_code,
                    approval_note: approvalOpinion,
                    user_id: user_id,
                  });
                } else if (approvalStatus === 2) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_two_review_status: "审批驳回",
                      level_two_review_remark: approvalOpinion,
                      level_two_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审批驳回
                  res = await rejectMechanical({
                    mechanical_code: record.mechanical_code,
                    reject_note: approvalOpinion,
                    user_id: currentUser.id,
                  });
                }

                if (res?.code === 200) {
                  message.success(res?.msg || "审批成功");
                  actionRef.current?.reload();
                  return true;
                } else {
                  message.error(res?.msg || "审批失败");
                  return false;
                }
              }}
            />
          );
        }

        // 如果审核状态是审核通过且单据状态是终审审核中，且当前用户是审核人，显示终审审核按钮
        if (record.document_status === 2 && record.auditor == currentUser?.id) {
          actions.push(
            <FinalAuditModal
              key="final-audit"
              trigger={<a>终审审核</a>}
              onOk={async (approvalStatus, approvalOpinion) => {
                let res;
                if (approvalStatus === 1) {
                  const getCurrentLog = await listReviewLog({
                    link_info: record.mechanical_code,
                    log_type: "机械",
                  });
                  const logId = getCurrentLog.data?.[0]?.id;
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_three_reviewer: currentUser?.nickname,
                      level_three_review_status: "审批通过",
                      level_three_review_remark: approvalOpinion,
                      level_three_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审核通过
                  res = await approveMechanical({
                    mechanical_code: record.mechanical_code,
                    approval_note: approvalOpinion,
                    user_id: currentUser?.id,
                  });
                } else if (approvalStatus === 2) {
                  const getCurrentLog = await listReviewLog({
                    link_info: record.mechanical_code,
                    log_type: "机械",
                  });
                  const logId = getCurrentLog.data?.[0]?.id;
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_three_reviewer: currentUser?.nickname,
                      level_three_review_status: "审批驳回",
                      level_three_review_remark: approvalOpinion,
                      level_three_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审核驳回
                  res = await rejectMechanical({
                    mechanical_code: record.mechanical_code,
                    reject_note: approvalOpinion,
                    user_id: currentUser?.id,
                  });
                }

                if (res?.code === 200) {
                  message.success(res?.msg || "审核成功");
                  actionRef.current?.reload();
                  return true;
                } else {
                  message.error(res?.msg || "审核失败");
                  return false;
                }
              }}
            />
          );
        }

        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="机械管理列表"
        actionRef={actionRef}
        rowKey="mechanical_code"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          canCreate && (
            <CreateForm
              key="create"
              onOk={() => actionRef.current?.reload()}
              trigger={
                <Button type="primary" key="primary">
                  新建机械
                </Button>
              }
              projects={projects}
              suppliers={suppliers}
              contracts={contracts}
            />
          ),
        ]}
        request={async (params, sort, filter) => {
          const res = await listMechanical({
            params: {
              ...params,
              page: params.current,
              pageSize: params.pageSize,
            },
          });
          return {
            data: res.data || [],
            success: res.code === 200,
            total: res.total || 0,
          };
        }}
        columns={columns}
        scroll={{ x: 1600 }}
        summary={(pageData) => {
          let totalQuantity = 0;
          let totalUnitPrice = 0;
          let totalPrice = 0;
          let totalAccountPaid = 0;
          let totalWaitAccountPaid = 0;

          pageData.forEach(
            ({
              quantity,
              unit_price,
              total_price,
              account_paid,
              wait_account_paid,
            }) => {
              totalQuantity += Number(quantity) || 0;
              totalUnitPrice += Number(unit_price) || 0;
              totalPrice += Number(total_price) || 0;
              totalAccountPaid += Number(account_paid) || 0;
              totalWaitAccountPaid += Number(wait_account_paid) || 0;
            }
          );

          return (
            <>
              <ProTable.Summary.Row>
                {/* 合并从 序号 到 单位 共7列，使数值正好对齐在 数量 及其后面 */}
                <ProTable.Summary.Cell index={0} colSpan={7}>
                  <strong>合计</strong>
                </ProTable.Summary.Cell>
                {/* 数量 */}
                <ProTable.Summary.Cell index={7}>
                  <strong>{totalQuantity.toLocaleString()}</strong>
                </ProTable.Summary.Cell>
                {/* 单价(元) */}
                <ProTable.Summary.Cell index={8}>
                  <strong>
                    ¥
                    {totalUnitPrice.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                {/* 合价(元) */}
                <ProTable.Summary.Cell index={9}>
                  <strong>
                    ¥
                    {totalPrice.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                {/* 已付款金额 */}
                <ProTable.Summary.Cell index={10}>
                  <strong>
                    ¥
                    {totalAccountPaid.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                {/* 未付款金额 */}
                <ProTable.Summary.Cell index={11}>
                  <strong>
                    ¥
                    {totalWaitAccountPaid.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </ProTable.Summary.Cell>
                {/* 关联合同-操作 等剩余 6 列 */}
                <ProTable.Summary.Cell index={12} colSpan={6} />
              </ProTable.Summary.Row>
            </>
          );
        }}
      />
    </PageContainer>
  );
};

export default MaterialManagement;
