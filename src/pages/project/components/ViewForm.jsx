import { PhaseNum, StructureType } from "@/enum.js";
import { supplierList } from "@/services/supplier";
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { Divider, Tag, message } from "antd";
import { cloneElement, useEffect, useRef, useState } from "react";
import MaterialModal from "./MaterialModal";

const ViewForm = (props) => {
  const { values, trigger } = props;
  const formRef = useRef();

  const [open, setOpen] = useState(false);

  // 从 additional_info1 中解析数据
  const parsedData = values?.additional_info1
    ? JSON.parse(values.additional_info1)
    : [];
  // 从 additional_info2 中解析全局数据
  const parsedGlobalData = values?.additional_info2
    ? JSON.parse(values.additional_info2)
    : { material: {}, machinery: {}, labor: {}, cost: {} };

  // 从 dataSource 中提取各行的材料、机械、人工、费用数据
  const extractDataByType = (rows, type) => {
    const result = {};
    rows.forEach((row) => {
      if (row[type]) {
        result[row.id] = row[type];
      }
    });
    return result;
  };

  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [machineryModalOpen, setMachineryModalOpen] = useState(false);
  const [laborModalOpen, setLaborModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [materialData] = useState(extractDataByType(parsedData, "material"));
  const [machineryData] = useState(extractDataByType(parsedData, "machinery"));
  const [laborData] = useState(extractDataByType(parsedData, "labor"));
  const [costData] = useState(extractDataByType(parsedData, "cost"));
  const [materialSupplierData] = useState(
    extractDataByType(parsedData, "material_supplier")
  );
  const [machinerySupplierData] = useState(
    extractDataByType(parsedData, "machinery_supplier")
  );
  const [laborSupplierData] = useState(
    extractDataByType(parsedData, "labor_supplier")
  );
  const [costSupplierData] = useState(
    extractDataByType(parsedData, "cost_supplier")
  );
  const globalMaterialData = parsedGlobalData.material || {};
  const globalMachineryData = parsedGlobalData.machinery || {};
  const globalLaborData = parsedGlobalData.labor || {};
  const globalCostData = parsedGlobalData.cost || {};
  const [selectedPhases, setSelectedPhases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [currentRowId, setCurrentRowId] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const res = await supplierList();
      if (res.code === 200) {
        setSuppliers(res.data || []);
      }
    };
    fetchSuppliers();
  }, []);

  const dataSource = parsedData;

  const columns = [
    {
      title: "建筑位置",
      dataIndex: "position",
      width: 200,
    },
    {
      title: "所属期数",
      dataIndex: "phase_num",
      width: 150,
      render: (text) => {
        if (!text) return "-";
        const t = String(text).trim();
        const found = PhaseNum.find((item) => item.value === t);
        return found ? found.label : text;
      },
    },
    {
      title: "建筑面积(m²)",
      dataIndex: "area",
      width: 180,
    },
    {
      title: "层数(层)",
      dataIndex: "height",
      width: 100,
    },
    {
      title: "预算造价(元)",
      dataIndex: "budget_cost",
      width: 210,
    },
    {
      title: "操作",
      valueType: "option",
      width: 360,
      render: (text, record) => [
        <Tag
          key="material"
          color="blue"
          style={{
            width: "50px",
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={() => {
            const phases = (values?.phase_num || "")
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            if (!phases || phases.length === 0) {
              message.warning("请先选择期数");
              return;
            }
            setCurrentRowId(record.id);
            setSelectedPhases(phases);
            setMaterialModalOpen(true);
          }}
        >
          材料
        </Tag>,
        <Tag
          key="machinery"
          color="red"
          style={{ width: "50px", cursor: "pointer", textAlign: "center" }}
          onClick={() => {
            const phases = (values?.phase_num || "")
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            if (!phases || phases.length === 0) {
              message.warning("请先选择期数");
              return;
            }
            setCurrentRowId(record.id);
            setSelectedPhases(phases);
            setMachineryModalOpen(true);
          }}
        >
          机械
        </Tag>,
        <Tag
          key="labor"
          style={{ width: "50px", cursor: "pointer", textAlign: "center" }}
          onClick={() => {
            const phases = (values?.phase_num || "")
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            if (!phases || phases.length === 0) {
              message.warning("请先选择期数");
              return;
            }
            setCurrentRowId(record.id);
            setSelectedPhases(phases);
            setLaborModalOpen(true);
          }}
        >
          人工
        </Tag>,
        <Tag
          key="cost"
          style={{ width: "50px", cursor: "pointer", textAlign: "center" }}
          onClick={() => {
            const phases = (values?.phase_num || "")
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            if (!phases || phases.length === 0) {
              message.warning("请先选择期数");
              return;
            }
            setCurrentRowId(record.id);
            setSelectedPhases(phases);
            setCostModalOpen(true);
          }}
        >
          费用
        </Tag>,
      ],
    },
  ];

  return (
    <>
      <DrawerForm
        title="查看项目"
        open={open}
        trigger={
          trigger
            ? cloneElement(trigger, { onClick: () => setOpen(true) })
            : null
        }
        width="1000px"
        grid={true}
        drawerProps={{
          onClose: () => setOpen(false),
          destroyOnClose: true,
        }}
        initialValues={{
          ...values,
          phase_num: values?.phase_num?.split(","),
        }}
        submitter={false}
      >
        <>
          <Divider variant="dotted" style={{ borderColor: "#7cb305" }}>
            项目基础信息
          </Divider>
          <ProFormText
            label="项目名称"
            name="project_name"
            colProps={{ span: 12 }}
            disabled
          />
          <ProFormText
            label="项目地址"
            name="project_address"
            colProps={{ span: 12 }}
            disabled
          />
          <ProFormText
            label="用地面积"
            name="land_area"
            colProps={{ span: 12 }}
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormText
            label="容积率"
            name="plot_ratio"
            colProps={{ span: 12 }}
            disabled
          />
          <ProFormText
            label="总建筑面积"
            name="total_building_area"
            colProps={{ span: 12 }}
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormText
            label="住宅面积"
            name="residential_area"
            colProps={{ span: 12 }}
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormText
            label="商铺面积"
            name="shop_area"
            colProps={{ span: 12 }}
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormText
            label="地下室面积"
            name="basement_area"
            colProps={{ span: 12 }}
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormText
            label="公共面积"
            name="public_area"
            colProps={{ span: 12 }}
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormText
            label="项目内容"
            name="project_content"
            colProps={{ span: 12 }}
            disabled
          />
          <ProFormSelect
            label="期数"
            name="phase_num"
            colProps={{ span: 12 }}
            options={PhaseNum}
            mode="multiple"
            disabled
          />
          <ProFormDigit
            colProps={{ span: 12 }}
            label="建筑总面积"
            name="building_total_area"
            disabled
            fieldProps={{
              suffix: "m²",
            }}
          />
          <ProFormDigit
            colProps={{ span: 12 }}
            label="预算总造价"
            name="budget_total_cost"
            disabled
            fieldProps={{
              suffix: "元",
            }}
          />
          <div style={{ lineHeight: "90px", marginLeft: "10px" }}>
            <Tag
              color="blue"
              style={{ width: "60px", cursor: "pointer", textAlign: "center" }}
              onClick={() => {
                const phases = values?.phase_num?.split(",");
                if (!phases || phases.length === 0) {
                  message.warning("请先选择期数");
                  return;
                }
                setCurrentRowId(null);
                setSelectedPhases(phases);
                setMaterialModalOpen(true);
              }}
            >
              材料
            </Tag>
            <Tag
              color="red"
              style={{ width: "60px", cursor: "pointer", textAlign: "center" }}
              onClick={() => {
                const phases = values?.phase_num?.split(",");
                if (!phases || phases.length === 0) {
                  message.warning("请先选择期数");
                  return;
                }
                setCurrentRowId(null);
                setSelectedPhases(phases);
                setMachineryModalOpen(true);
              }}
            >
              机械
            </Tag>
            <Tag
              style={{ width: "60px", cursor: "pointer", textAlign: "center" }}
              onClick={() => {
                const phases = values?.phase_num?.split(",");
                if (!phases || phases.length === 0) {
                  message.warning("请先选择期数");
                  return;
                }
                setCurrentRowId(null);
                setSelectedPhases(phases);
                setLaborModalOpen(true);
              }}
            >
              人工
            </Tag>
            <Tag
              style={{ width: "60px", cursor: "pointer", textAlign: "center" }}
              onClick={() => {
                const phases = values?.phase_num?.split(",");
                if (!phases || phases.length === 0) {
                  message.warning("请先选择期数");
                  return;
                }
                setCurrentRowId(null);
                setSelectedPhases(phases);
                setCostModalOpen(true);
              }}
            >
              费用
            </Tag>
          </div>
          <ProFormSelect
            label="结构形式"
            name="structure_type"
            colProps={{ span: 12 }}
            options={StructureType}
            disabled
          />
        </>
        <Divider variant="dotted" style={{ borderColor: "#7cb305" }}>
          项目预算信息
        </Divider>
        <ProTable
          scroll={{ x: "max-content" }}
          style={{ width: "100%" }}
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          search={false}
          pagination={false}
          toolBarRender={false}
        />
      </DrawerForm>
      <MaterialModal
        open={materialModalOpen}
        onCancel={() => setMaterialModalOpen(false)}
        phases={selectedPhases}
        materialData={
          currentRowId ? materialData[currentRowId] : globalMaterialData
        }
        type="material"
        readonly={true}
        supplierList={suppliers}
        supplierData={currentRowId ? materialSupplierData[currentRowId] : {}}
      />
      <MaterialModal
        open={machineryModalOpen}
        onCancel={() => setMachineryModalOpen(false)}
        phases={selectedPhases}
        materialData={
          currentRowId ? machineryData[currentRowId] : globalMachineryData
        }
        type="machinery"
        readonly={true}
        supplierList={suppliers}
        supplierData={currentRowId ? machinerySupplierData[currentRowId] : {}}
      />
      <MaterialModal
        open={laborModalOpen}
        onCancel={() => setLaborModalOpen(false)}
        phases={selectedPhases}
        materialData={currentRowId ? laborData[currentRowId] : globalLaborData}
        type="labor"
        readonly={true}
        supplierList={suppliers}
        supplierData={currentRowId ? laborSupplierData[currentRowId] : {}}
      />
      <MaterialModal
        open={costModalOpen}
        onCancel={() => setCostModalOpen(false)}
        phases={selectedPhases}
        materialData={currentRowId ? costData[currentRowId] : globalCostData}
        type="cost"
        readonly={true}
        supplierList={suppliers}
        supplierData={currentRowId ? costSupplierData[currentRowId] : {}}
      />
    </>
  );
};

export default ViewForm;
