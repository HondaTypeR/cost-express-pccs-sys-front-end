import {
  DollarCircleOutlined,
  ExclamationCircleOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import ReactECharts from "echarts-for-react";
import { useState } from "react";

const { Title } = Typography;
const { Option } = Select;

// 首页成本驾驶舱
const CostDashboard = () => {
  // 项目筛选
  const [projectId, setProjectId] = useState("1");

  // 模拟数据
  const dashboardData = {
    targetCost: 12580, // 目标成本（万）
    dynamicCost: 11960, // 动态成本
    paidAmount: 7850, // 已支付
    contractTotal: 10800, // 合同总额
    changeAmount: 480, // 变更签证
    diffAmount: 11960 - 12580, // 偏差
  };

  // 待办审批
  const todoData = [
    {
      id: 1,
      type: "进度款审批",
      project: "XX项目1#楼",
      money: "285万",
      status: "待审核",
    },
    {
      id: 2,
      type: "签证变更",
      project: "地下室加固",
      money: "68万",
      status: "待审核",
    },
  ];

  // 超支预警
  const warnData = [
    {
      id: 1,
      subject: "模板工程",
      target: 520,
      dynamic: 615,
      rate: "18.3%",
      status: "超支",
    },
  ];

  // 成本构成饼图
  const pieOption = {
    title: { text: "成本科目占比", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      {
        name: "成本占比",
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 65, name: "土建工程" },
          { value: 15, name: "安装工程" },
          { value: 10, name: "精装工程" },
          { value: 5, name: "措施费" },
          { value: 5, name: "其他费用" },
        ],
      },
    ],
  };

  // 月度趋势图
  const lineOption = {
    title: { text: "近6个月成本趋势" },
    xAxis: {
      type: "category",
      data: ["8月", "9月", "10月", "11月", "12月", "1月"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "目标成本",
        type: "line",
        data: [12580, 12580, 12580, 12580, 12580, 12580],
        itemStyle: { color: "red" },
      },
      {
        name: "动态成本",
        type: "line",
        data: [9800, 10500, 11000, 11400, 11700, 11960],
      },
    ],
  };

  return (
    <PageContainer>
      {/* ========== 顶部筛选 ========== */}
      {/* <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>选择项目：</span>
          <Select
            value={projectId}
            onChange={setProjectId}
            style={{ width: 220 }}
          >
            <Option value="1">XX花园项目（总承包）</Option>
            <Option value="2">XX商业综合体</Option>
          </Select>
        </Space>
      </Card> */}

      {/* ========== 预警条 ========== */}
      <Alert
        message="【预警】模板工程超支 18.3%，请尽快核查成本！"
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* ========== 6大核心数据卡片 ========== */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="目标成本（万）"
              value={dashboardData.targetCost}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: "#1f2937" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="动态成本（万）"
              value={dashboardData.dynamicCost}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="成本偏差（万）"
              value={dashboardData.diffAmount}
              valueStyle={{
                color: dashboardData.diffAmount > 0 ? "#f5222d" : "#52c41a",
              }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="已支付（万）" value={dashboardData.paidAmount} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="合同总额（万）"
              value={dashboardData.contractTotal}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="变更签证（万）"
              value={`+${dashboardData.changeAmount}`}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ========== 图表区域 ========== */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={pieOption} style={{ height: 380 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={lineOption} style={{ height: 380 }} />
          </Card>
        </Col>
      </Row>

      {/* ========== 右侧台账 ========== */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="待办审批">
            <Table
              rowKey="id"
              pagination={false}
              dataSource={todoData}
              columns={[
                { title: "类型", dataIndex: "type" },
                { title: "项目", dataIndex: "project" },
                { title: "金额", dataIndex: "money" },
                {
                  title: "状态",
                  render: () => <Tag color="orange">待审核</Tag>,
                },
                {
                  title: "操作",
                  render: () => <Button type="link">去处理</Button>,
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="超支预警科目">
            <Table
              rowKey="id"
              pagination={false}
              dataSource={warnData}
              columns={[
                { title: "科目名称", dataIndex: "subject" },
                {
                  title: "目标成本",
                  dataIndex: "target",
                  render: (t) => `${t}万`,
                },
                {
                  title: "动态成本",
                  dataIndex: "dynamic",
                  render: (t) => `${t}万`,
                },
                { title: "偏差率", dataIndex: "rate", style: { color: "red" } },
                { title: "状态", render: () => <Tag color="red">超支</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default CostDashboard;
