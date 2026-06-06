import { ApplyDept, AuditStatus } from "@/enum.js";
import {
  addReviewLog,
  approveWorkFeeApplyWithLevels,
  findWorkFeeApplyListByLevel,
  listReviewLog,
  rejectWorkFeeApplyWithLevels,
  submitWorkFeeApplyWithLevels,
  updateReviewLog,
} from "@/services/business";
import { fetchUser } from "@/services/user";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { message, Popover, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import SubmitApprovalModal from "./components/SubmitApprovalModal";
import WorkFeeApprovalLogDrawer from "./components/WorkFeeApprovalLogDrawer";
import WorkFeeReviewModal from "./components/WorkFeeReviewModal";

const DocumentStatusApply = [
  { label: "经办人", value: "one", color: "default" },
  { label: "部门审核", value: "two", color: "processing" },
  { label: "财务部审核", value: "three", color: "processing" },
  { label: "复核人审核", value: "four", color: "warning" },
  { label: "终审人审核", value: "five", color: "success" },
];

const AuditStatusColors = { 0: "default", 1: "success", 2: "error" };

const LEVEL_CHECKER_FIELDS = [
  "level_one_checker",
  "level_two_checker",
  "level_three_checker",
  "level_four_checker",
  "level_five_checker",
];

const LEVEL_LOG_FIELDS = [
  "level_one",
  "level_two",
  "level_three",
  "level_four",
  "level_five",
];

const WorkFeeApplyApproval = () => {
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
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "部门",
      dataIndex: "dept",
      width: 120,
      render: (text) => ApplyDept.find((item) => item.value === text)?.label,
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
      fieldProps: { format: "YYYY-MM-DD HH:mm:ss" },
      width: 200,
    },
    {
      title: "单据状态",
      dataIndex: "current_apply_level",
      width: 110,
      render: (val) => {
        const found = DocumentStatusApply.find((i) => i.value == val);
        return found ? <Tag color={found.color}>{found.label}</Tag> : "-";
      },
    },
    {
      title: "审批状态",
      dataIndex: "audit_status_apply",
      width: 100,
      render: (val, record) => {
        const found = AuditStatus.find((i) => i.value == val);
        if (record?.current_apply_level === "one") {
          return <Tag color="default">待发起审批</Tag>;
        }
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
    {
      title: "操作",
      valueType: "option",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        const actions = [
          <WorkFeeApprovalLogDrawer
            key="approval-log"
            recordId={record.id}
            record={record}
            users={users}
            trigger={<a>审批日志</a>}
          />,
        ];

        const uid = String(currentUser?.id);
        const levelNum = record?.current_apply_level.replace("level_", "");
        const levelKey = `level_${levelNum}`;
        // 发起审批：草稿且待审核且当前用户是 level_one_checker
        if (record?.current_apply_level === "one") {
          actions.push(
            <SubmitApprovalModal
              key="submit"
              trigger={<a>发起审批</a>}
              record={record}
              users={users}
              onOk={async (reviewerId) => {
                await addReviewLog({
                  link_info: record.id,
                  log_type: "办公审批",
                  level_one_reviewer:
                    currentUser?.nickname || currentUser?.username,
                  level_one_review_status: "发起审批",
                  level_one_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
                const res = await submitWorkFeeApplyWithLevels({
                  id: record.id,
                  next_checker: reviewerId,
                });
                if (res?.code === 200) {
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
        }

        // 审批：document_status_apply=1~4，对应的 level_(N+1)_checker 可以审批
        if (
          ["two", "three", "four", "five"].includes(record?.current_apply_level)
        ) {
          const levelNum = record?.current_apply_level.replace("level_", "");
          const levelKey = `level_${levelNum}`;
          if (
            record?.current_apply_level === "five" &&
            record?.audit_status_apply === 1
          ) {
            return actions;
          }
          if (String(record[`${levelKey}_checker`]) === uid) {
            actions.push(
              <WorkFeeReviewModal
                key="review"
                trigger={<a>审批</a>}
                record={record}
                users={users}
                onOk={async (approvalStatus, approvalOpinion) => {
                  const getCurrentLog = await listReviewLog({
                    link_info: record.id,
                    log_type: "办公审批",
                  });
                  const logId = getCurrentLog.data?.[0]?.id;
                  let res;
                  if (approvalStatus === 1) {
                    await updateReviewLog({
                      id: logId,
                      [`${levelKey}_reviewer`]:
                        currentUser?.nickname || currentUser?.username,
                      [`${levelKey}_review_status`]: "审批通过",
                      [`${levelKey}_review_remark`]: approvalOpinion,
                      [`${levelKey}_time`]: dayjs().format(
                        "YYYY-MM-DD HH:mm:ss"
                      ),
                    });
                    res = await approveWorkFeeApplyWithLevels({
                      id: record.id,
                      approval_note: approvalOpinion,
                      user_id: currentUser?.id,
                    });
                  } else if (approvalStatus === 2) {
                    await updateReviewLog({
                      id: logId,
                      [`${levelKey}_reviewer`]:
                        currentUser?.nickname || currentUser?.username,
                      [`${levelKey}_review_status`]: "审批驳回",
                      [`${levelKey}_review_remark`]: approvalOpinion,
                      [`${levelKey}_time`]: dayjs().format(
                        "YYYY-MM-DD HH:mm:ss"
                      ),
                    });
                    res = await rejectWorkFeeApplyWithLevels({
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
        columns={columns}
        request={async (params) => {
          const res = await findWorkFeeApplyListByLevel({
            ...params,
            user_id: currentUser?.id,
            dept: "2",
          });
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

export default WorkFeeApplyApproval;
