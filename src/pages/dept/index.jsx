import { getDeptList, updateDept } from "@/services/dept";
import { fetchUser } from "@/services/user";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { message, Modal, Select } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

const FIELD_LABEL = {
  level_one_checker: "经办人",
  level_two_checker: "复核人",
};

const CHECKER_POWERS = [
  "材料确认单",
  "人工确认单",
  "机械确认单",
  "分包工程确认单",
  "销售费用单",
];

const DeptPage = () => {
  const actionRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);
  const [users, setUsers] = useState([]);
  const [checkerModal, setCheckerModal] = useState({
    open: false,
    record: null,
    field: null,
    value: undefined,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUser();
        if (res?.code === 200) {
          const list = (res.data || []).map((item) => {
            const name = item.nickname || item.username;
            return { value: item?.id, label: name };
          });
          setUsers(list);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const openChecker = (record, field) => {
    setCheckerModal({
      open: true,
      record,
      field,
      value: record?.[field] ?? undefined,
    });
  };

  const closeChecker = () => {
    setCheckerModal({
      open: false,
      record: null,
      field: null,
      value: undefined,
    });
  };

  const handleCheckerOk = async () => {
    const { record, field, value } = checkerModal;
    if (!value) {
      message.warning("请选择一个人员");
      return;
    }
    if (!record?.dept_id) {
      message.error("记录缺少 dept_id，无法保存");
      return;
    }
    try {
      setSaving(true);
      const res = await updateDept({ dept_id: record.dept_id, [field]: value });
      if (res?.code === 200) {
        message.success(res?.msg || "保存成功");
        closeChecker();
        actionRef.current?.reload();
      } else {
        message.error(res?.msg || "保存失败");
      }
    } catch (e) {
      message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const deptRowSpanMap = useMemo(() => {
    const map = new Map();
    const counts = new Map();
    dataSource.forEach((item) => {
      const key = item?.dept_name ?? "";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const used = new Map();
    dataSource.forEach((item, index) => {
      const key = item?.dept_name ?? "";
      if (!used.has(key)) {
        map.set(index, counts.get(key));
        used.set(key, true);
      } else {
        map.set(index, 0);
      }
    });
    return map;
  }, [dataSource]);

  const columns = [
    {
      title: "部门",
      dataIndex: "dept_name",
      onCell: (_, index) => ({ rowSpan: deptRowSpanMap.get(index) ?? 1 }),
    },
    {
      title: "权限点",
      dataIndex: "power",
    },
    {
      title: "经办人",
      dataIndex: "level_one_checker",
    },
    {
      title: "复核人",
      dataIndex: "level_two_checker",
    },
    {
      title: "部门意见",
      dataIndex: "level_three_checker",
    },
    {
      title: "财务部",
      dataIndex: "level_four_checker",
    },
    {
      title: "审批人",
      dataIndex: "level_five_checker",
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      render: (_, record) => {
        if (!CHECKER_POWERS.includes(record?.power)) return [];
        return [
          <a
            key="set-handler"
            onClick={() => openChecker(record, "level_one_checker")}
          >
            设置经办人
          </a>,
          <a
            key="set-reviewer"
            onClick={() => openChecker(record, "level_two_checker")}
          >
            设置复核人
          </a>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        rowKey={(record, index) => record?.id || record?.dept_id || index}
        columns={columns}
        dataSource={dataSource}
        search={false}
        pagination={false}
        options={false}
        request={async () => {
          const res = await getDeptList();
          const data = res?.data || res || [];
          const list = Array.isArray(data) ? data : [];
          const sorted = [...list].sort((a, b) =>
            String(a?.dept_name ?? "").localeCompare(String(b?.dept_name ?? ""))
          );
          setDataSource(sorted);
          return {
            data: sorted,
            success: true,
          };
        }}
      />
      <Modal
        title={`设置${FIELD_LABEL[checkerModal.field] || ""}`}
        open={checkerModal.open}
        onOk={handleCheckerOk}
        onCancel={closeChecker}
        confirmLoading={saving}
        destroyOnClose
      >
        <Select
          style={{ width: "100%" }}
          showSearch
          allowClear
          placeholder="请选择人员"
          options={users}
          value={checkerModal.value}
          onChange={(val) =>
            setCheckerModal((prev) => ({ ...prev, value: val }))
          }
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(String(input).toLowerCase())
          }
        />
      </Modal>
    </PageContainer>
  );
};

export default DeptPage;
