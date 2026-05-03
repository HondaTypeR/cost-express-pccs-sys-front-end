import { listReviewLog } from "@/services/business";
import { DrawerForm } from "@ant-design/pro-components";
import { Timeline } from "antd";
import { cloneElement, useState } from "react";

const LEVEL_CONFIG = [
  { key: "one", label: "经办人" },
  { key: "two", label: "部门审核" },
  { key: "three", label: "财务部审核" },
  { key: "four", label: "复核人审核" },
  { key: "five", label: "终审人审核" },
];

const STATUS_COLOR = {
  审批通过: "blue",
  审批驳回: "red",
  待审批: "gray",
};

const LEVEL_TO_CHECKER = {
  one: "level_one_checker",
  two: "level_two_checker",
  three: "level_three_checker",
  four: "level_four_checker",
  five: "level_five_checker",
};

const WorkFeeApprovalLogDrawer = ({ trigger, recordId, users, record }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logData, setLogData] = useState(null);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const res = await listReviewLog({
        link_info: recordId,
        log_type: "销售审批",
      });
      if (res?.code === 200) {
        setLogData(Array.isArray(res.data) ? res.data[0] : null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTimelineItems = () => {
    if (!logData) return [];

    const items = [];
    const currentLevel = record?.current_apply_level; // 如 "two"

    // 经办人（level_one 是发起人）
    items.push({
      color: logData.level_one_review_status ? "blue" : "gray",
      children: (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            经办人：{logData.level_one_reviewer || "-"}
          </div>
          <div style={{ color: "#666", fontSize: 12, marginBottom: 2 }}>
            审批状态：{logData.level_one_review_status || "-"}
          </div>
          {logData.level_one_review_remark && (
            <div style={{ color: "#999", fontSize: 12, marginBottom: 2 }}>
              审批备注：{logData.level_one_review_remark}
            </div>
          )}
          {logData.level_one_time && (
            <div style={{ color: "#999", fontSize: 12, marginBottom: 2 }}>
              时间：{logData.level_one_time}
            </div>
          )}
        </div>
      ),
    });

    // 2~5 级审批人
    LEVEL_CONFIG.slice(1).forEach(({ key, label }) => {
      let reviewer = logData[`level_${key}_reviewer`];
      let status = logData[`level_${key}_review_status`];
      let remark = logData[`level_${key}_review_remark`];
      const time = logData[`level_${key}_time`];
      let color = STATUS_COLOR[status] || "gray";

      // 当前待审核级别，显示待审核状态，审核人取 record 中的值
      if (currentLevel === key) {
        if (!status) {
          status = "待审核";
          color = "gray";
        } else {
          color = STATUS_COLOR[status] || "gray";
        }
        if (!reviewer && record && LEVEL_TO_CHECKER[key]) {
          const checkerId = record[LEVEL_TO_CHECKER[key]];
          if (checkerId && users) {
            const user = users.find(
              (u) => String(u.value) === String(checkerId)
            );
            reviewer = user?.label || String(checkerId);
          } else if (checkerId) {
            reviewer = String(checkerId);
          }
        }
      }

      items.push({
        color,
        children: (
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {label}：{reviewer || "-"}
            </div>
            {status && (
              <div style={{ color: "#666", fontSize: 12, marginBottom: 2 }}>
                审批状态：{status}
              </div>
            )}
            {remark && (
              <div style={{ color: "#999", fontSize: 12, marginBottom: 2 }}>
                审批备注：{remark}
              </div>
            )}
            {time && (
              <div style={{ color: "#999", fontSize: 12, marginBottom: 2 }}>
                时间：{time}
              </div>
            )}
          </div>
        ),
      });
    });

    // 完结归档
    const lastStatus = logData.level_five_review_status;
    const isArchived = lastStatus === "审批通过";
    items.push({
      color: isArchived ? "green" : "gray",
      children: (
        <div
          style={{
            fontWeight: 500,
            color: isArchived ? "#52c41a" : "#999",
          }}
        >
          完结归档
        </div>
      ),
    });

    return items;
  };

  return (
    <DrawerForm
      title="审批流程"
      open={open}
      trigger={
        trigger &&
        cloneElement(trigger, {
          onClick: async () => {
            setOpen(true);
            await fetchLog();
          },
        })
      }
      width={480}
      drawerProps={{
        onClose: () => setOpen(false),
        destroyOnClose: true,
      }}
      submitter={false}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}>加载中...</div>
      ) : !logData ? (
        <div style={{ color: "#999", textAlign: "center", padding: 32 }}>
          暂无审批日志
        </div>
      ) : (
        <Timeline items={getTimelineItems()} />
      )}
    </DrawerForm>
  );
};

export default WorkFeeApprovalLogDrawer;
