import { AuditStatus, WaitStatus } from "@/enum";
import {
  listArtificial,
  listMaterial,
  listMechanical,
  listProcessRecord,
} from "@/services/business";
import { fetchUser } from "@/services/user";
import { SmileOutlined } from "@ant-design/icons";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { Card, Modal, Typography } from "antd";
import { cloneElement, useEffect, useState } from "react";
import { history, useModel } from "umi";
import PaymentRecordModal from "../financeManagement/components/PaymentRecordModal";

const { Title, Paragraph } = Typography;

// 通用简单列表弹窗（用于材料/机械/人工）
const SimpleListModal = ({ trigger, title, records, width = 900 }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger && cloneElement(trigger, { onClick: () => setOpen(true) })}
      <Modal
        title={title}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={width}
        destroyOnClose
      >
        <ProTable
          columns={[
            {
              title: "名称",
              dataIndex: "name",
              width: 220,
              render: (_, r) =>
                r?.material_name ||
                r?.machinery_name ||
                r?.artificial_name ||
                "-",
            },
            {
              title: "单据状态",
              dataIndex: "document_status",
              width: 140,
              render: (_, r) =>
                r?.document_status_text ||
                WaitStatus.find((i) => i.value === r?.document_status)?.label ||
                "-",
            },
            {
              title: "审核状态",
              dataIndex: "audit_status",
              width: 140,
              render: (t) =>
                AuditStatus.find((i) => i.value === t)?.label || "-",
            },
            {
              title: "创建时间",
              dataIndex: "create_time",
              valueType: "dateTime",
              width: 200,
            },
          ]}
          dataSource={records}
          rowKey={(r) => r?.id || r?.material_code || r?.code}
          search={false}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          options={false}
          scroll={{ x: 800 }}
        />
      </Modal>
    </>
  );
};

const Welcome = () => {
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};

  const [allProcessRecord, setAllProcessRecord] = useState([]);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [mechanicals, setMechanicals] = useState([]);
  const [artificials, setArtificials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [prRes, userRes, matRes, mechRes, artRes] = await Promise.all([
        listProcessRecord(),
        fetchUser(),
        listMaterial(),
        listMechanical(),
        listArtificial(),
      ]);
      if (prRes?.code === 200) {
        setAllProcessRecord(prRes.data || []);
      }
      if (userRes?.code === 200) {
        setUsers(
          (userRes.data || []).map((item) => ({
            value: item.id,
            label: item.nickname || item.username,
          }))
        );
      }
      if (matRes?.code === 200) setMaterials(matRes.data || []);
      if (mechRes?.code === 200) setMechanicals(mechRes.data || []);
      if (artRes?.code === 200) setArtificials(artRes.data || []);
    };
    fetchData();
  }, []);

  // 财务 待我审批（付款审批流）
  const pendingFinanceRecords = (allProcessRecord || []).filter((pr) => {
    if (pr?.audit_status !== 0) return false;
    if (pr?.document_status === 1) return currentUser?.id == pr?.handlerDept;
    if (pr?.document_status === 2) return currentUser?.id == pr?.finceDept;
    if (pr?.document_status === 3) return currentUser?.id == pr?.rechecker;
    if (pr?.document_status === 4) return currentUser?.id == pr?.finalChecker;
    return false;
  });

  // 材料/机械/人工 待我审批（根据 reviewer / auditor + 待审核）
  const pendingMaterials = (materials || []).filter(
    (r) =>
      ((r?.document_status === 1 && currentUser?.id == r?.reviewer) || (r?.document_status === 2 && currentUser?.id == r?.auditor))
  );
  const pendingMechanicals = (mechanicals || []).filter(
    (r) => ((r?.document_status === 1 && currentUser?.id == r?.reviewer) ||
      (r?.document_status === 2 && currentUser?.id == r?.auditor))
  );
  const pendingArtificials = (artificials || []).filter(
    (r) => ((r?.document_status === 1 && currentUser?.id == r?.reviewer) ||
      (r?.document_status === 2 && currentUser?.id == r?.auditor))
  );
  const themes = {
    finance: {
      bg: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
      titleColor: "#ffffff",
      countColor: "#ffffff",
    },
    material: {
      bg: "linear-gradient(135deg, #52c41a 0%, #95de64 100%)",
      titleColor: "#ffffff",
      countColor: "#ffffff",
    },
    mechanical: {
      bg: "linear-gradient(135deg, #fa8c16 0%, #ffd591 100%)",
      titleColor: "#ffffff",
      countColor: "#ffffff",
    },
    artificial: {
      bg: "linear-gradient(135deg, #722ed1 0%, #b37feb 100%)",
      titleColor: "#ffffff",
      countColor: "#ffffff",
    },
  };

  const renderApprovalCard = (title, count, theme = {}, onClick = null) => {
    const hasPending = (count || 0) > 0;
    return (
      <Card
        hoverable={hasPending}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: 260,
          textAlign: "left",
          background: hasPending
            ? theme.bg || "linear-gradient(135deg, #faad14 0%, #ffd666 100%)"
            : "#f5f5f5",
          boxShadow: "6px 10px 24px gray",
          borderRadius: 12,
          cursor: hasPending ? "pointer" : "not-allowed",
          opacity: hasPending ? 1 : 0.8,
          transition: "all .2s ease",
        }}
        bodyStyle={{ padding: 16, height: "auto" }}
        onClick={hasPending && onClick ? onClick : undefined}
      >
        <div
          style={{
            fontSize: 20,
            color: hasPending ? theme.titleColor || "#fff" : "#8c8c8c",
            marginBottom: 8,
            fontWeight: "bold",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: hasPending ? theme.countColor || "#fff" : "#bfbfbf",
            lineHeight: 1.1,
          }}
        >
          {hasPending ? count : "0"}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: hasPending ? "rgba(255,255,255,0.95)" : "transparent",
            visibility: hasPending ? "visible" : "hidden",
          }}
        >
          点击查看审批列表
        </div>
      </Card>
    );
  };

  return (
    <PageContainer title={false}>
      <Card>
        {/* 欢迎信息 */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SmileOutlined style={{ fontSize: 72, color: "#1890ff" }} />
          <Title level={2}>欢迎使用成本控制系统</Title>
          <Paragraph style={{ fontSize: 18 }}>
            您好，{currentUser?.nickname || "用户"}！
          </Paragraph>
          <Paragraph type="secondary">
            请从左侧菜单选择功能模块开始使用
          </Paragraph>
        </div>

        {/* 底部四个待我审批卡片 */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "space-between",
          }}
        >
          {/* 1. 财务 待我审批 */}
          <div style={{ flex: 1 }}>
            {pendingFinanceRecords.length > 0 ? (
              <PaymentRecordModal
                trigger={renderApprovalCard(
                  "财务 待我审批",
                  pendingFinanceRecords.length,
                  themes.finance
                )}
                records={pendingFinanceRecords}
                users={users}
                currentUser={currentUser}
                onRefresh={async () => {
                  const res = await listProcessRecord();
                  if (res?.code === 200) setAllProcessRecord(res.data || []);
                }}
              />
            ) : (
              renderApprovalCard("财务 待我审批", 0, themes.finance)
            )}
          </div>

          {/* 2. 材料 待我审批 */}
          <div style={{ flex: 1 }}>
            {renderApprovalCard(
              "材料 待我审批",
              pendingMaterials.length,
              themes.material,
              () => history.push("/materialManagement")
            )}
          </div>

          {/* 3. 机械 待我审批 */}
          <div style={{ flex: 1 }}>
            {renderApprovalCard(
              "机械 待我审批",
              pendingMechanicals.length,
              themes.mechanical,
              () => history.push("/mechanicalManagement")
            )}
          </div>

          {/* 4. 人工 待我审批 */}
          <div style={{ flex: 1 }}>
            {renderApprovalCard(
              "人工 待我审批",
              pendingArtificials.length,
              themes.artificial,
              () => history.push("/artificialManagement")
            )}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
