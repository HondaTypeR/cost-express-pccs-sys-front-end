import { PageContainer } from "@ant-design/pro-components";
import { Col, Row } from "antd";
import BudgetPie from "./Components/BudgetPie";
import CLLine from "./Components/CLLine";
import GYSLine from "./Components/GYSLine";
import JXLine from "./Components/JXLine";
import RGLine from "./Components/RGLine";

const Dashboard = () => {
  return (
    <PageContainer title={false}>
      <Row gutter={16}>
        <Col span={24}>
          <BudgetPie />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <CLLine />
        </Col>
        <Col xs={24} md={12}>
          <JXLine />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <RGLine />
        </Col>
        <Col xs={24} md={12}>
          <GYSLine />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
