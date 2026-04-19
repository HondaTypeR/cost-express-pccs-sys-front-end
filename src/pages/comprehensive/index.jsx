import {
  deleteImportedBudget,
  findImportedBudgets,
  findImportTasks,
  importBudget,
  listProject,
} from "@/services/business";
import {
  PageContainer,
  ProFormSelect,
  ProTable,
} from "@ant-design/pro-components";
import {
  Button,
  message,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";

const TYPES = {
  other: "其他",
  jx: "机械",
  cl: "材料",
  rg: "人工",
};

const Comprehensive = () => {
  const actionRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importFileList, setImportFileList] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProjectId, setImportProjectId] = useState(undefined);
  const [importTypes, setImportTypes] = useState("other");
  const [importIssue, setImportIssue] = useState("all");
  const [tasksOpen, setTasksOpen] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchProjects = async () => {
    const res = await listProject();
    if (res.code === 200) {
      setProjects(
        res.data.map((item) => ({
          value: item.project_id,
          label: item.project_name,
          project_name: item.project_name,
          additional_info1: item.additional_info1,
        }))
      );
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleImportOk = async () => {
    if (!importProjectId) {
      message.warning("请选择归属项目");
      return;
    }
    if (!importTypes) {
      message.warning("请选择类型");
      return;
    }
    if (!importIssue) {
      message.warning("请选择归属期数");
      return;
    }
    if (!importFileList || importFileList.length === 0) {
      message.warning("请先选择一个 Excel 文件");
      return;
    }
    const fileItem = importFileList[0];
    if (fileItem.status && fileItem.status !== "done") {
      message.warning("文件正在上传，请稍后再试");
      return;
    }
    const uploadedUrl =
      fileItem?.response?.data?.fileList?.[0]?.fileUrl || fileItem?.url;
    if (!uploadedUrl) {
      message.error("未获取到文件地址，请重试");
      return;
    }
    try {
      setImporting(true);
      const res = await importBudget({
        project_id: importProjectId,
        types: importTypes,
        issue: importIssue,
        fileUrl: uploadedUrl,
      });
      if (res?.code === 200) {
        message.success(res?.msg || "导入任务已提交");
        setImportOpen(false);
        setImportFileList([]);
        setImportProjectId(undefined);
        setImportTypes("other");
        setImportIssue("all");
        actionRef.current?.reload();
      } else {
        message.error(res?.msg || "导入失败");
      }
    } catch (e) {
      message.error("导入异常，请稍后重试");
    } finally {
      setImporting(false);
    }
  };

  const handleImportCancel = () => {
    setImportOpen(false);
    setImportFileList([]);
    setImportProjectId(undefined);
    setImportTypes("other");
    setImportIssue("all");
  };

  const fetchImportTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await findImportTasks({});
      if (res?.code === 200) {
        const list = Array.isArray(res?.data) ? res.data : [];
        setTasks(list.slice(0, 50));
      } else {
        message.error(res?.msg || "获取任务失败");
        setTasks([]);
      }
    } catch (e) {
      message.error("获取任务异常，请稍后重试");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (tasksOpen) {
      fetchImportTasks();
    }
  }, [tasksOpen]);

  const columns = [
    {
      title: "序号",
      dataIndex: "budget_id",
      search: false,
    },
    {
      title: "归属项目",
      dataIndex: "project_name",
      valueType: "select",

      search: {
        transform: (value) => ({ project_id: value }),
      },
      fieldProps: {
        options: projects,
      },
    },
    {
      title: "归属期数",
      dataIndex: "issue",
      valueEnum: {
        all: { text: "全部" },
        1: { text: "一期" },
        2: { text: "二期" },
        3: { text: "三期" },
        4: { text: "四期" },
        5: { text: "五期" },
      },
      render: (text, record) => {
        const issueEnum = {
          all: "全部",
          1: "一期",
          2: "二期",
          3: "三期",
          4: "四期",
          5: "五期",
        };
        return issueEnum[record?.issue] || record?.issue;
      },
    },
    {
      title: "类型",
      dataIndex: "types",
      valueEnum: {
        other: { text: "其他" },
        jx: { text: "机械" },
        cl: { text: "材料" },
        rg: { text: "人工" },
      },
      render: (text, record) => {
        return TYPES[record?.types] || text;
      },
    },
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "编号",
      dataIndex: "spec_model",
    },
    {
      title: "单位",
      dataIndex: "unit",
      hideInSearch: true,
    },
    {
      title: "数量",
      dataIndex: "quantity",
      hideInSearch: true,
    },
    {
      title: "市场价",
      dataIndex: "market_price",
      hideInSearch: true,
    },
    {
      title: "预算价",
      dataIndex: "budget_price",
      hideInSearch: true,
    },
    {
      title: "价差",
      dataIndex: "spread",
      hideInSearch: true,
    },
    {
      title: "调差金额",
      dataIndex: "change_spread",
      hideInSearch: true,
    },
    {
      title: "创建时间",
      dataIndex: "create_time",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "更新时间",
      dataIndex: "update_time",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      fixed: "right",
      render: (text, record) => [
        <UpdateForm
          key="edit"
          values={record}
          onOk={() => actionRef.current?.reload()}
          trigger={<a>编辑</a>}
          projects={projects}
        />,
        <Popconfirm
          key="delete"
          title="确认删除"
          description="确定要删除这条预算吗？删除后无法恢复。"
          onConfirm={async () => {
            const res = await deleteImportedBudget({
              budget_ids: [record.budget_id],
            });
            if (res.code === 200) {
              message.success("删除成功");
              actionRef.current?.reload();
            } else {
              message.error(res.msg || "删除失败");
            }
          }}
          okText="确认"
          cancelText="取消"
          okType="danger"
        >
          <a style={{ color: "red" }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="预算管理列表"
        actionRef={actionRef}
        rowKey="budget_id"
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            onOk={() => actionRef.current?.reload()}
            trigger={
              <Button type="primary" key="primary">
                新建记录
              </Button>
            }
            projects={projects}
          />,
          <Button
            key="import"
            onClick={() => {
              setImportProjectId(undefined);
              setImportTypes("other");
              setImportIssue("all");
              setImportFileList([]);
              setImportOpen(true);
            }}
          >
            导入Excel
          </Button>,
          <Button key="importTasks" onClick={() => setTasksOpen(true)}>
            导入日志
          </Button>,
          selectedRowKeys.length > 0 ? (
            <Popconfirm
              key="batchDelete"
              title="确认批量删除"
              description="确定要删除所选预算吗？删除后无法恢复。"
              onConfirm={async () => {
                const res = await deleteImportedBudget({
                  budget_ids: selectedRowKeys,
                });
                if (res?.code === 200) {
                  message.success("批量删除成功");
                  setSelectedRowKeys([]);
                  actionRef.current?.reload();
                } else {
                  message.error(res?.msg || "批量删除失败");
                }
              }}
              okText="确认"
              cancelText="取消"
              okType="danger"
            >
              <Button danger>批量删除</Button>
            </Popconfirm>
          ) : (
            <Button key="batchDeleteDisabled" danger disabled>
              批量删除
            </Button>
          ),
        ]}
        request={async (params, sort, filter) => {
          const res = await findImportedBudgets({
            params: {
              ...params,
              page: params.current,
              pageSize: params.pageSize,
            },
          });
          if (res?.code === 200) {
            return {
              data: res.data?.list || [],
              success: true,
              total: res.data?.total || 0,
            };
          }
          message.error(res?.msg || "获取数据失败");
          return {
            data: [],
            success: false,
            total: 0,
          };
        }}
        columns={columns}
        scroll={{ x: 1400 }}
      />
      <Modal
        title="导入Excel"
        open={importOpen}
        onOk={handleImportOk}
        onCancel={handleImportCancel}
        okText="确认导入"
        cancelText="取消"
        confirmLoading={importing}
        destroyOnHidden
        width={800}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <ProFormSelect
            name="import_project_id"
            label="归属项目"
            placeholder="请选择"
            options={projects}
            fieldProps={{
              value: importProjectId,
              onChange: setImportProjectId,
              allowClear: false,
            }}
            rules={[{ required: true, message: "请选择归属项目" }]}
          />
          <ProFormSelect
            name="import_types"
            label="类型"
            placeholder="请选择"
            options={[
              { value: "other", label: "其他" },
              { value: "jx", label: "机械" },
              { value: "cl", label: "材料" },
              { value: "rg", label: "人工" },
            ]}
            fieldProps={{
              value: importTypes,
              onChange: setImportTypes,
              allowClear: false,
            }}
            initialValue="other"
            rules={[{ required: true, message: "请选择类型" }]}
          />
          <ProFormSelect
            name="import_issue"
            label="归属期数"
            placeholder="请选择"
            options={[
              { value: "all", label: "全部" },
              { value: "1", label: "一期" },
              { value: "2", label: "二期" },
              { value: "3", label: "三期" },
              { value: "4", label: "四期" },
              { value: "5", label: "五期" },
            ]}
            fieldProps={{
              value: importIssue,
              onChange: setImportIssue,
              allowClear: false,
            }}
            initialValue="all"
            rules={[{ required: true, message: "请选择归属期数" }]}
          />
        </div>
        <Upload
          name="files"
          fileList={importFileList}
          multiple={false}
          maxCount={1}
          action="/api/contract/upload"
          beforeUpload={(file) => {
            const name = String(file?.name || "").toLowerCase();
            const type = String(file?.type || "");
            const isExcel =
              name.endsWith(".xls") ||
              name.endsWith(".xlsx") ||
              type === "application/vnd.ms-excel" ||
              type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            if (!isExcel) {
              message.error("仅支持上传 .xls 或 .xlsx 文件");
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
          onChange={({ fileList: newList }) => {
            setImportFileList(newList.slice(-1));
          }}
          onRemove={() => {
            setImportFileList([]);
          }}
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          listType="text"
        >
          <Button>选择文件</Button>
        </Upload>
        <a href="http://101.37.231.212:3000/uploads/temp/%E9%A2%84%E7%AE%97%E6%A8%A1%E7%89%88.xlsx">
          下载上传模板
        </a>
        <div style={{ marginTop: 8, color: "rgba(0,0,0,.45)" }}>
          仅支持 .xls / .xlsx，单次仅上传一个文件。
        </div>
      </Modal>
      <Modal
        title="导入日志"
        open={tasksOpen}
        onCancel={() => setTasksOpen(false)}
        footer={[
          <Button
            key="refresh"
            type="primary"
            loading={tasksLoading}
            onClick={fetchImportTasks}
          >
            刷新
          </Button>,
          <Button key="close" onClick={() => setTasksOpen(false)}>
            关闭
          </Button>,
        ]}
        width={900}
        destroyOnClose
      >
        <Table
          rowKey="task_id"
          loading={tasksLoading}
          dataSource={tasks}
          pagination={false}
          size="small"
          columns={[
            { title: "任务ID", dataIndex: "task_id" },
            {
              title: "状态",
              dataIndex: "status",
              render: (val) => {
                const v = Number(val);
                const map = {
                  1: { text: "导入中", color: "blue" },
                  2: { text: "导入成功", color: "green" },
                  3: { text: "导入失败", color: "red" },
                };
                const item = map[v] || { text: val, color: "default" };
                return <Tag color={item.color}>{item.text}</Tag>;
              },
            },
            { title: "总行数", dataIndex: "total_rows" },
            { title: "已导入行数", dataIndex: "success_rows" },
            {
              title: "结果",
              dataIndex: "message",
              ellipsis: { showTitle: false },
              render: (text) =>
                text ? (
                  <Tooltip title={text}>
                    <span>{text}</span>
                  </Tooltip>
                ) : (
                  "-"
                ),
            },
            {
              title: "文件名称",
              dataIndex: "file_name",
              ellipsis: true,
            },
            {
              title: "创建时间",
              dataIndex: "create_time",
              render: (val) =>
                val ? moment(val).format("YYYY-MM-DD HH:mm:ss") : "-",
            },
          ]}
          scroll={{ x: "max-content" }}
        />
      </Modal>
    </PageContainer>
  );
};

export default Comprehensive;
