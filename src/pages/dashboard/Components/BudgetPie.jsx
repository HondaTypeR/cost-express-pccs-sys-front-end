import { findProjectCostPie } from "@/services/business";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Chart } from "@antv/g2";
import { Card, Col, message, Row } from "antd";
import { useEffect, useRef, useState } from "react";
import { formatThousands } from "../helper";
import BudgetLine from "./BudgetLine";

const BudgetPie = () => {
  // 图表容器引用
  const chartRef = useRef(null);
  // 图表实例引用
  const instanceRef = useRef(null);
  const [data, setData] = useState();
  const [summary, setSummary] = useState();
  const HEIGHT = 360;

  useEffect(() => {
    findProjectCostPie({ params: { project_id: 1 } }).then((res) => {
      if (res?.code === 200) {
        const newData = [];
        res?.data?.items?.forEach((item) => {
          newData.push({
            item: item.label,
            percent: item.percent,
            actual_total: item.actual_total,
            budget_total: item.budget_total,
            variance: item.variance,
          });
        });
        setData(newData);
        setSummary(res?.data?.summary);
      } else {
        message.error("获取预算分布数据失败");
      }
    });
  }, []);

  useEffect(() => {
    // 初始化图表（仅一次）
    if (!instanceRef.current) {
      const chart = new Chart({
        container: chartRef.current,
        autoFit: true,
        height: HEIGHT,
      });

      chart.options({
        type: "interval",
        height: HEIGHT,
        data: [],
        coordinate: { type: "theta", innerRadius: 0.5, outerRadius: 0.8 },
        transform: [{ type: "stackY" }],
        encode: { y: "percent", color: "item" },
        legend: { color: { position: "right" } },
        tooltip: {
          title: (d) => d.item,
          items: [
            {
              channel: "y",
              name: "占比",
              valueFormatter: (v) => `${(v * 100).toFixed(2)}%`,
            },
          ],
        },
        labels: [
          {
            text: (d) =>
              Number(d.percent) > 0
                ? `${d.item} ${(d.percent * 100).toFixed(2)}%`
                : "",
            position: "spider",
            fontSize: 12,
          },
        ],
        interaction: {
          elementHoverScale: {
            scale: 1.08,
            shadow: true,
            shadowColor: "rgba(0, 0, 0, 0.5)",
            shadowBlur: 15,
          },
        },
      });

      chart.render();
      instanceRef.current = chart;
    }

    // 组件销毁时销毁图表（重要！防止内存泄漏）
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, []);

  // 数据更新时刷新图表数据
  useEffect(() => {
    if (!instanceRef.current) return;
    const finalData = Array.isArray(data) ? data : [];
    if (instanceRef.current.changeData) {
      instanceRef.current.changeData(finalData);
    } else {
      instanceRef.current.options({ data: finalData });
      instanceRef.current.render();
    }
  }, [data]);

  return (
    <Card
      title="预算分布"
      extra={
        <div style={{ display: "flex", fontWeight: "bold" }}>
          实际总额:{formatThousands(summary?.actual_grand_total || 0)}
          <span style={{ margin: "0 10px" }}></span>
          预算总额:{formatThousands(summary?.budget_grand_total || 0)}
          <span style={{ margin: "0 10px" }}></span>
          偏差:{" "}
          <span
            style={{
              color:
                summary?.actual_grand_total - summary?.budget_grand_total > 0
                  ? "red"
                  : "green",
            }}
          >
            {summary?.actual_grand_total - summary?.budget_grand_total > 0 ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )}
            {formatThousands(summary?.variance_total || 0)}
          </span>
        </div>
      }
    >
      <Row gutter={16} align="middle">
        <Col xs={24} md={12}>
          <div ref={chartRef} style={{ width: "100%", height: HEIGHT }} />
        </Col>
        <Col xs={24} md={12}>
          <BudgetLine data={data} height={HEIGHT} />
        </Col>
      </Row>
    </Card>
  );
};

export default BudgetPie;
