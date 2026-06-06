import { ApplyDept, AuditStatus } from "@/enum.js";
import {
  addReviewLog,
  approveWorkFeeApply,
  deleteWorkFeeApply,
  findWorkFeeApplyList,
  listReviewLog,
  rejectWorkFeeApply,
  submitWorkFeeApproval,
  updateReviewLog,
} from "@/services/business";
import { fetchUser } from "@/services/user";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Button, message, Popconfirm, Popover, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import AddAndEdit from "./components/AddAndEdit";
import ApprovalLogModal from "./components/ApprovalLogModal";
import ApprovalModal from "./components/ApprovalModal";
import FinalAuditModal from "./components/FinalAuditModal";
import ReviewApprovalModal from "./components/ReviewApprovalModal";

const DocumentStatusApply = [
  { label: "草稿", value: 0, color: "default" },
  { label: "复审中", value: 1, color: "processing" },
  { label: "终审中", value: 2, color: "warning" },
  { label: "已通过", value: 3, color: "success" },
  { label: "已驳回", value: 4, color: "error" },
];

const AuditStatusColors = { 0: "default", 1: "success", 2: "error" };

const baseColumns = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "部门",
    dataIndex: "dept",
    width: 120,
    render: (text) => {
      return ApplyDept.find((item) => item.value === text)?.label;
    },
  },
  {
    title: "合计金额",
    dataIndex: "total",
    width: 160,
    render: (text, record) => {
      let items = [];
      try {
        items = JSON.parse(record.info || "[]");
      } catch {
        items = [];
      }
      const card = (
        <div style={{ minWidth: 220 }}>
          {items.map((item, idx) => (
            <div
              key={item.id ?? idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "4px 0",
                borderBottom:
                  idx < items.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <span style={{ color: "#999", flexShrink: 0 }}>{idx + 1}.</span>
              <span style={{ flex: 1 }}>{item.content}</span>
              <span style={{ flexShrink: 0, color: "#d46b08" }}>
                ¥{item.amount}
              </span>
            </div>
          ))}
        </div>
      );
      return (
        <span>
          ¥{Number(text || 0).toFixed(2)}
          {items.length > 0 && (
            <Popover content={card} title="报销明细" trigger="hover">
              <QuestionCircleOutlined
                style={{ marginLeft: 6, color: "#1677ff", cursor: "pointer" }}
              />
            </Popover>
          )}
        </span>
      );
    },
  },
  {
    title: "收款人",
    dataIndex: "payee",
    width: 120,
  },
  {
    title: "开户银行",
    dataIndex: "payee_bank",
    width: 160,
  },
  {
    title: "收款账号",
    dataIndex: "payee_card_no",
    width: 200,
  },
  {
    title: "创建日期",
    dataIndex: "create_time",
    valueType: "date",
    fieldProps: {
      format: "YYYY-MM-DD HH:mm:ss",
    },
    width: 200,
  },
  {
    title: "单据状态",
    dataIndex: "document_status",
    width: 110,
    render: (val) => {
      const found = DocumentStatusApply.find((i) => i.value == val);
      return found ? <Tag color={found.color}>{found.label}</Tag> : "-";
    },
  },
  {
    title: "审批状态",
    dataIndex: "audit_status",
    width: 100,
    render: (val) => {
      const found = AuditStatus.find((i) => i.value == val);
      return found ? (
        <Tag color={AuditStatusColors[val] ?? "default"}>{found.label}</Tag>
      ) : (
        "-"
      );
    },
  },
  {
    title: "备注",
    dataIndex: "mark",
    ellipsis: true,
    width: 120,
  },
];

const DEPT = "销售部";
const POWER = "销售费用报销单";

const WorkFeeApply = () => {
  const { initialState } = useModel("@@initialState");
  const currentUser = initialState?.currentUser;
  const actionRef = useRef(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetchUser();
      if (res.code === 200) {
        setUsers(
          res.data.map((item) => ({
            value: item.id,
            label: item.nickname || item.username,
          }))
        );
      }
    })();
  }, []);

  const columns = [
    ...baseColumns,
    {
      title: "操作",
      valueType: "option",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        const actions = [
          <ApprovalLogModal
            key="approval-log"
            log_type="销售费用"
            materialCode={record.id}
            trigger={<a>审批日志</a>}
          />,
        ];

        if (record.document_status === 0 && currentUser?.id == record.hander) {
          actions.push(
            <AddAndEdit
              key="edit"
              record={record}
              onOk={() => actionRef.current?.reload()}
              trigger={<a>编辑</a>}
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
                  link_info: record.id,
                  log_type: "销售费用",
                  level_one_reviewer: currentUser?.username,
                  level_one_review_status: "发起审批",
                  level_one_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  level_two_reviewer: users.find((u) => u.value === reviewerId)
                    ?.label,
                  level_two_review_status: "待审批",
                });
                const res = await submitWorkFeeApproval({
                  id: record.id,
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
              title="确认删除该报销单？"
              okText="确认"
              cancelText="取消"
              onConfirm={async () => {
                const res = await deleteWorkFeeApply({ id: record.id });
                if (res.code === 200) {
                  message.success("删除成功");
                  actionRef.current?.reload();
                } else {
                  message.error(res.msg || "删除失败");
                }
              }}
            >
              <a style={{ color: "#ff4d4f" }}>删除</a>
            </Popconfirm>
          );
        }

        // 复审：document_status===1 且当前用户是 reviewer
        if (
          record.document_status === 1 &&
          record.reviewer == currentUser?.id
        ) {
          actions.push(
            <ReviewApprovalModal
              key="review"
              trigger={<a>复审审批</a>}
              record={record}
              users={users}
              onOk={async (approvalStatus, approvalOpinion, user_id) => {
                const getCurrentLog = await listReviewLog({
                  link_info: record.id,
                  log_type: "销售费用",
                });
                let res;
                if (approvalStatus === 1) {
                  await updateReviewLog({
                    id: getCurrentLog.data?.[0]?.id,
                    level_two_review_status: "审批通过",
                    level_two_review_remark: approvalOpinion,
                    level_two_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    level_three_reviewer: users.find((u) => u.value === user_id)
                      ?.label,
                    level_three_review_status: "待审批",
                  });
                  res = await approveWorkFeeApply({
                    id: record.id,
                    approval_note: approvalOpinion,
                    user_id,
                  });
                } else if (approvalStatus === 2) {
                  await updateReviewLog({
                    id: getCurrentLog.data?.[0]?.id,
                    level_two_review_status: "审批驳回",
                    level_two_review_remark: approvalOpinion,
                    level_two_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  });
                  res = await rejectWorkFeeApply({
                    id: record.id,
                    reject_note: approvalOpinion,
                    user_id: currentUser?.id,
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

        // 终审：document_status===2 且 auditor 是当前用户
        if (record.document_status === 2 && record.auditor == currentUser?.id) {
          actions.push(
            <FinalAuditModal
              key="final-audit"
              trigger={<a>终审审核</a>}
              onOk={async (approvalStatus, approvalOpinion) => {
                const getCurrentLog = await listReviewLog({
                  link_info: record.id,
                  log_type: "销售费用",
                });
                let res;
                if (approvalStatus === 1) {
                  await updateReviewLog({
                    id: getCurrentLog.data?.[0]?.id,
                    level_three_reviewer: currentUser?.nickname,
                    level_three_review_status: "审批通过",
                    level_three_review_remark: approvalOpinion,
                    level_three_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  });
                  res = await approveWorkFeeApply({
                    id: record.id,
                    approval_note: approvalOpinion,
                    user_id: currentUser?.id,
                  });
                } else if (approvalStatus === 2) {
                  await updateReviewLog({
                    id: getCurrentLog.data?.[0]?.id,
                    level_three_reviewer: currentUser?.nickname,
                    level_three_review_status: "审批驳回",
                    level_three_review_remark: approvalOpinion,
                    level_three_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  });
                  res = await rejectWorkFeeApply({
                    id: record.id,
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
        scroll={{ x: "max-content" }}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <AddAndEdit
            key={Math.random()}
            record={{ dept: ApplyDept[0].value }}
            onOk={() => actionRef.current?.reload()}
            trigger={
              <Button type="primary" icon={<PlusOutlined />}>
                新建
              </Button>
            }
          />,
        ]}
        columns={columns}
        request={async (params) => {
          const res = await findWorkFeeApplyList({ ...params, dept: "1" });
          return {
            data: res.data,
            success: true,
            total: res.total,
          };
        }}
      />
    </PageContainer>
  );
};

export default WorkFeeApply;
