import { AuditStatus, DocumentStatus } from "@/enum";
import {
  addReviewLog,
  approveProcessRecord,
  listReviewLog,
  rejectProcessRecord,
  submitProcessRecord,
  updateReviewLog,
} from "@/services/business";
import { ProTable } from "@ant-design/pro-components";
import { message, Modal } from "antd";
import dayjs from "dayjs";
import { cloneElement, useState } from "react";
import ApprovalModal from "./ApprovalModal";
import FinalApprovalModal from "./FinalApprovalModal";
import ReviewApprovalModal from "./ReviewApprovalModal";
import ReviewLogModal from "./ReviewLogModal";

const PaymentRecordModal = (props) => {
  const { trigger, records, users, currentUser, onRefresh, currentInfo } =
    props;
  const [open, setOpen] = useState(false);

  const columns = [
    {
      title: "经办人",
      dataIndex: "handler",
      width: 120,
      render: (text) => {
        const user = users?.find((u) => u.value == text);
        return user ? user.label : text || "-";
      },
    },
    {
      title: "单据状态",
      dataIndex: "document_status",
      width: 120,
      render: (text) => {
        const found = DocumentStatus.find((item) => item.value === text);
        return found ? found.label : "-";
      },
    },
    {
      title: "审批状态",
      dataIndex: "audit_status",
      width: 120,
      render: (text) => {
        const found = AuditStatus.find((item) => item.value === text);
        return found ? found.label : "-";
      },
    },
    {
      title: "合计金额",
      dataIndex: "total_amount",
      width: 120,
      valueType: "money",
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 200,
      ellipsis: true,
    },
    {
      title: "创建时间",
      dataIndex: "create_time",
      width: 180,
      valueType: "dateTime",
    },
    {
      title: "操作",
      valueType: "option",
      fixed: "right",
      width: 180,
      render: (text, record) => {
        const actions = [];
        // 只有状态为草稿(0)且审核状态为待审核(0)且当前用户是经办人时才显示发起审批按钮
        if (
          record.document_status === 0 &&
          record.audit_status === 0 &&
          currentUser?.id == record.handler
        ) {
          actions.push(
            <ApprovalModal
              key="approval"
              currentInfo={currentInfo}
              trigger={<a>发起审批</a>}
              users={users}
              currentStatus={record.document_status}
              currentAmount={record.total_amount}
              onOk={async (reviewerId) => {
                const processRecord = records.find(
                  (pr) => pr.relation_id === record.relation_id
                );

                await addReviewLog({
                  link_info: record.id,
                  log_type: "财务",
                  level_one_reviewer: currentUser?.username,
                  level_one_review_status: "发起审批",
                  level_one_review_remark: "-",
                  level_one_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                  level_two_reviewer: users.find((u) => u.value === reviewerId)
                    ?.label,
                  level_two_review_status: "待审批",
                  approval_money: record.total_amount,
                });

                const res = await submitProcessRecord({
                  material_code: record.relation_id,
                  document_status: record.document_status + 1,
                  next_checker: reviewerId,
                  id: record?.id,
                });
                if (res.code === 200) {
                  message.success(res?.msg || "审批发起成功");
                  onRefresh?.();
                  setOpen(false);
                  return true;
                } else {
                  message.error(res?.msg || "审批发起失败");
                  return false;
                }
              }}
            />
          );
        }

        // 单据状态是经办部门审批(1)且审核状态是待审核(0)时，如果handlerDept等于当前登录人id则展示审批按钮
        if (
          record.document_status === 1 &&
          record.audit_status === 0 &&
          currentUser?.id == record.handlerDept
        ) {
          actions.push(
            <ReviewApprovalModal
              key="handler-dept-approval"
              trigger={<a>审批</a>}
              users={users}
              currentInfo={currentInfo}
              currentAmount={record.total_amount}
              nextApproverLabel="财务部审批人"
              onOk={async (
                approvalStatus,
                approvalOpinion,
                nextChecker,
                rejectReason
              ) => {
                let res;
                const getCurrentLog = await listReviewLog({
                  link_info: record.id,
                  log_type: "财务",
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
                        (u) => u.value === nextChecker
                      )?.label,
                      level_three_review_status: "待审批",
                    });
                  }
                  // 审批通过 - 经办部门审批
                  res = await approveProcessRecord({
                    id: record.id,
                    remark: approvalOpinion || "-",
                    next_checker: nextChecker,
                    current_document_status: 1,
                  });
                } else if (approvalStatus === 2) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_two_review_status: "审批驳回",
                      level_two_review_remark: rejectReason,
                      level_two_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审批拒绝
                  res = await rejectProcessRecord({
                    id: record.id,
                    reject_note: rejectReason,
                  });
                }

                if (res?.code === 200) {
                  message.success(res?.msg || "审批成功");
                  onRefresh?.();
                  setOpen(false);
                  return true;
                } else {
                  message.error(res?.msg || "审批失败");
                  return false;
                }
              }}
            />
          );
        }

        // 单据状态是财务部审批(2)且审核状态是待审核(0)时，如果finceDept等于当前登录人id则展示审批按钮
        if (
          record.document_status === 2 &&
          record.audit_status === 0 &&
          currentUser?.id == record.finceDept
        ) {
          actions.push(
            <ReviewApprovalModal
              key="finance-approval"
              trigger={<a>审批</a>}
              users={users}
              currentInfo={currentInfo}
              checkerLevel={4}
              currentAmount={record.total_amount}
              nextApproverLabel="复核审批人"
              onOk={async (
                approvalStatus,
                approvalOpinion,
                nextChecker,
                rejectReason
              ) => {
                let res;
                const getCurrentLog = await listReviewLog({
                  link_info: record.id,
                  log_type: "财务",
                });
                const logId = getCurrentLog.data?.[0]?.id;
                if (approvalStatus === 1) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_three_review_status: "审批通过",
                      level_three_review_remark: approvalOpinion,
                      level_three_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                      level_four_reviewer: users.find(
                        (u) => u.value === nextChecker
                      )?.label,
                      level_four_review_status: "待审批",
                    });
                  }
                  // 审批通过 - 财务部审批
                  res = await approveProcessRecord({
                    id: record.id,
                    remark: approvalOpinion || "-",
                    next_checker: nextChecker,
                    current_document_status: 2,
                  });
                } else if (approvalStatus === 2) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_three_review_status: "审批驳回",
                      level_three_review_remark: rejectReason,
                      level_three_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审批拒绝
                  res = await rejectProcessRecord({
                    id: record.id,
                    reject_note: rejectReason,
                  });
                }

                if (res?.code === 200) {
                  message.success(res?.msg || "审批成功");
                  onRefresh?.();
                  setOpen(false);
                  return true;
                } else {
                  message.error(res?.msg || "审批失败");
                  return false;
                }
              }}
            />
          );
        }

        // 单据状态是复核审核中(3)且审核状态是待审核(0)时，如果rechecker等于当前登录人id则展示审批按钮
        if (
          record.document_status === 3 &&
          record.audit_status === 0 &&
          currentUser?.id == record.rechecker
        ) {
          actions.push(
            <ReviewApprovalModal
              key="rechecker-approval"
              trigger={<a>审批</a>}
              users={users}
              fixedChecker={999}
              currentAmount={record.total_amount}
              nextApproverLabel="终审审批人"
              onOk={async (
                approvalStatus,
                approvalOpinion,
                nextChecker,
                rejectReason
              ) => {
                let res;
                const getCurrentLog = await listReviewLog({
                  link_info: record.id,
                  log_type: "财务",
                });
                const logId = getCurrentLog.data?.[0]?.id;
                if (approvalStatus === 1) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_four_review_status: "审批通过",
                      level_four_review_remark: approvalOpinion,
                      level_four_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                      level_five_reviewer: users.find(
                        (u) => u.value === nextChecker
                      )?.label,
                      level_five_review_status: "待审批",
                    });
                  }
                  // 审批通过 - 复核审批
                  res = await approveProcessRecord({
                    id: record.id,
                    remark: approvalOpinion || "-",
                    next_checker: nextChecker,
                    current_document_status: 3,
                  });
                } else if (approvalStatus === 2) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_four_review_status: "审批驳回",
                      level_four_review_remark: rejectReason,
                      level_four_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审批拒绝
                  res = await rejectProcessRecord({
                    id: record.id,
                    reject_note: rejectReason,
                  });
                }

                if (res?.code === 200) {
                  message.success(res?.msg || "审批成功");
                  onRefresh?.();
                  setOpen(false);
                  return true;
                } else {
                  message.error(res?.msg || "审批失败");
                  return false;
                }
              }}
            />
          );
        }
        // 单据状态是终审审核中(4)且审核状态是待审核(0)时，如果finalChecker等于当前登录人id则展示审批按钮
        if (
          record.document_status === 4 &&
          record.audit_status === 0 &&
          currentUser?.id == record.finalChecker
        ) {
          actions.push(
            <FinalApprovalModal
              key="final-approval"
              trigger={<a>审批</a>}
              currentAmount={record.total_amount}
              onOk={async (
                approvalStatus,
                approvalReason,
                rejectReason,
                real_amount
              ) => {
                let res;
                const getCurrentLog = await listReviewLog({
                  link_info: record.id,
                  log_type: "财务",
                });
                const logId = getCurrentLog.data?.[0]?.id;
                if (approvalStatus === 1) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_five_reviewer: currentUser?.nickname,
                      level_five_review_status: "审批通过",
                      level_five_review_remark: approvalReason,
                      level_five_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                      real_approval_money: String(real_amount),
                    });
                  }
                  // 审批通过
                  res = await approveProcessRecord({
                    id: record.id,
                    remark: approvalReason || "-",
                    current_document_status: 4,
                    // 最终实际审批金额
                    real_amount,
                  });
                } else if (approvalStatus === 2) {
                  if (logId) {
                    await updateReviewLog({
                      id: logId,
                      level_five_reviewer: currentUser?.nickname,
                      level_five_review_status: "审批驳回",
                      level_five_review_remark: rejectReason,
                      level_five_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    });
                  }
                  // 审批拒绝
                  res = await rejectProcessRecord({
                    id: record.id,
                    reject_note: rejectReason,
                  });
                }

                if (res?.code === 200) {
                  message.success(res?.msg || "审批成功");
                  onRefresh?.();
                  setOpen(false);
                  return true;
                } else {
                  message.error(res?.msg || "审批失败");
                  return false;
                }
              }}
            />
          );
        }

        // 审批日志按钮始终显示
        actions.push(
          <ReviewLogModal
            key="review-log-modal"
            trigger={<a>审批日志</a>}
            recordId={record.id}
          />
        );

        return actions.length > 0 ? actions : "-";
      },
    },
  ];

  return (
    <>
      {trigger &&
        cloneElement(trigger, {
          onClick: () => setOpen(true),
        })}
      <Modal
        title="关联付款单列表"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <ProTable
          columns={columns}
          dataSource={records}
          rowKey="id"
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          options={false}
          scroll={{ x: 800 }}
        />
      </Modal>
    </>
  );
};

export default PaymentRecordModal;
