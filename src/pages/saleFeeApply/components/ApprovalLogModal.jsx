import { listReviewLog } from "@/services/business";
import { Modal, Table } from "antd";
import { cloneElement, useState } from "react";

const ApprovalLogModal = (props) => {
  const { trigger, materialCode, log_type } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const res = await listReviewLog({
        link_info: materialCode,
        log_type,
      });
      if (res?.code === 200) {
        setLogs(Array.isArray(res?.data) ? res.data : []);
      } else {
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const dataSource = logs.map((item, index) => ({
    ...item,
    __rowKey: item?.id ?? index,
  }));
  const columns = [
    {
      title: "经办人",
      dataIndex: "level_one_reviewer",
      key: "level_one_reviewer",
      render: (v) => v || "-",
    },
    {
      title: "经办人审批状态",
      dataIndex: "level_one_review_status",
      key: "level_one_review_status",
      render: (v) => v || "-",
    },
    {
      title: "经办人备注",
      dataIndex: "level_one_review_remark",
      key: "level_one_review_remark",
      render: (v) => v || "-",
    },
    {
      title: "经办人发起时间",
      dataIndex: "level_one_time",
      key: "level_one_time",
      render: (v) => v || "-",
    },
    {
      title: "复核审批人",
      dataIndex: "level_two_reviewer",
      key: "level_two_reviewer",
      render: (v) => v || "-",
    },
    {
      title: "复核审批状态",
      dataIndex: "level_two_review_status",
      key: "level_two_review_status",
      render: (v) => v || "-",
    },
    {
      title: "复核审批备注",
      dataIndex: "level_two_review_remark",
      key: "level_two_review_remark",
      render: (v) => v || "-",
    },
    {
      title: "复核审批时间",
      dataIndex: "level_two_time",
      key: "level_two_time",
      render: (v) => v || "-",
    },
    {
      title: "终审审批人",
      dataIndex: "level_three_reviewer",
      key: "level_three_reviewer",
      render: (v) => v || "-",
    },
    {
      title: "终审审批状态",
      dataIndex: "level_three_review_status",
      key: "level_three_review_status",
      render: (v) => v || "-",
    },
    {
      title: "终审审批备注",
      dataIndex: "level_three_review_remark",
      key: "level_three_review_remark",
      render: (v) => v || "-",
    },
    {
      title: "终审审批时间",
      dataIndex: "level_three_time",
      key: "level_three_time",
      render: (v) => v || "-",
    },
  ];

  return (
    <>
      {trigger
        ? cloneElement(trigger, {
            onClick: async () => {
              setOpen(true);
              await fetchLog();
            },
          })
        : null}
      <Modal
        title="审批日志"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        width={900}
      >
        {loading ? (
          <div>加载中...</div>
        ) : logs.length === 0 ? (
          <div>暂无审批日志</div>
        ) : (
          <Table
            size="small"
            rowKey="__rowKey"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        )}
      </Modal>
    </>
  );
};

export default ApprovalLogModal;
