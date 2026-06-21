import { deleteDept, getDeptList, updateDept } from "@/services/dept";
import { fetchUser } from "@/services/user";
import { AllMenuRoutes } from "@/enum";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { Dropdown, message, Modal, Popconfirm, Select } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";

const FIELD_LABEL = {
  level_one_checker: "一级发起人",
  level_two_checker: "二级审批人",
  level_three_checker: "三级审批人",
  level_four_checker: "四级审批人",
  level_five_checker: "五级审批人",
};

const CHECKER_POWERS = [
  "材料确认单",
  "人工确认单",
  "机械确认单",
  "分包工程确认单",
  "销售费用单",
];

const menuRouteLabelMap = Object.fromEntries(
  AllMenuRoutes.map((item) => [item.value, item.label])
);

const formatMenuRoutes = (router) => {
  if (!router) return "-";
  return String(router)
    .split(",")
    .filter(Boolean)
    .map((path) => menuRouteLabelMap[path.trim()] || path.trim())
    .join("、");
};

const DeptPage = () => {
  const actionRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
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

  const handleDelete = async (record) => {
    if (!record?.dept_id) {
      message.error("记录缺少 dept_id，无法删除");
      return;
    }
    try {
      const res = await deleteDept({ dept_id: record.dept_id });
      if (res?.code === 200) {
        message.success(res?.msg || "删除成功");
        actionRef.current?.reload();
      } else {
        message.error(res?.msg || "删除失败");
      }
    } catch (e) {
      message.error("删除失败");
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
      title: "菜单权限",
      dataIndex: "router",
      onCell: (_, index) => ({ rowSpan: deptRowSpanMap.get(index) ?? 1 }),
      render: (text) => formatMenuRoutes(text),
    },
    {
      title: "权限点",
      dataIndex: "power",
    },
    {
      title: "一级发起人",
      dataIndex: "level_one_checker",
      render: (text, record) => {
        if (["办公费用报销单"].includes(record?.power)) return "各员工";
        if (
          record?.dept_name === "综合办" &&
          record?.power === "结算付款审批单"
        ) {
          return "各员工";
        }
        return users.find((u) => u.value == text)?.label || text;
      },
    },
    {
      title: "二级审批人",
      dataIndex: "level_two_checker",
      render: (text) => users.find((u) => u.value == text)?.label || text,
    },
    {
      title: "三级审批人",
      dataIndex: "level_three_checker",
      render: (text) => users.find((u) => u.value == text)?.label || text,
    },
    {
      title: "四级审批人",
      dataIndex: "level_four_checker",
      render: (text) => users.find((u) => u.value == text)?.label || text,
    },
    {
      title: "五级审批人",
      dataIndex: "level_five_checker",
      render: (text) => users.find((u) => u.value == text)?.label || text,
    },
    {
      title: "操作",
      valueType: "option",
      width: 180,
      render: (_, record) => {
        const isOfficeFee = record?.power === "办公费用报销单";
        const hideLevelOne =
          record?.dept_name === "综合办" &&
          record?.power === "结算付款审批单";
        const baseItems = isOfficeFee
          ? [
            {
              key: "level_two_checker",
              label: "设置二级审批人",
            },
            {
              key: "level_three_checker",
              label: "设置三级审批人",
            },
          ]
          : [
            ...(hideLevelOne
              ? []
              : [
                {
                  key: "level_one_checker",
                  label: "设置一级发起人",
                },
              ]),
            {
              key: "level_two_checker",
              label: "设置二级审批人",
            },
          ];
        let extraItems = [];
        if (isOfficeFee) {
          extraItems = [];
        } else if (CHECKER_POWERS.includes(record?.power)) {
          extraItems = [
            {
              key: "level_three_checker",
              label: "设置三级审批人",
            },
          ];
        } else {
          extraItems = [
            {
              key: "level_three_checker",
              label: "设置三级审批人",
            },
            {
              key: "level_four_checker",
              label: "设置四级审批人",
            },
            {
              key: "level_five_checker",
              label: "设置五级审批人",
            },
          ];
        }
        const items = [...baseItems, ...extraItems];
        return [
          <UpdateForm
            key="edit"
            values={record}
            onOk={() => actionRef.current?.reload()}
            trigger={<a>编辑</a>}
          />,
          <Popconfirm
            key="delete"
            title="确认删除"
            description="确定要删除该部门权限记录吗？"
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <a style={{ color: "red" }}>删除</a>
          </Popconfirm>,
          <Dropdown
            key="actions"
            menu={{
              items,
              onClick: ({ key }) => openChecker(record, key),
            }}
            trigger={["hover"]}
          >
            <a>设置权限</a>
          </Dropdown>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable
        loading={loading}
        actionRef={actionRef}
        rowKey={(record, index) => record?.id || record?.dept_id || index}
        columns={columns}
        dataSource={dataSource}
        search={false}
        pagination={false}
        options={false}
        toolBarRender={() => [
          <CreateForm key="create" reload={() => actionRef.current?.reload()} />,
        ]}
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
        scroll={{ x: "max-content" }}
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
          value={checkerModal.value ? Number(checkerModal.value) : undefined}
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
