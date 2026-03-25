import { Chart } from "@antv/g2";
import { useEffect, useRef } from "react";
import { formatThousands } from "../helper";

const BudgetLine = ({ data: propData, height = 360 }) => {
  // 图表容器引用
  const chartRef2 = useRef(null);
  // 图表实例引用（用于销毁，防止内存泄漏）
  const chartInstanceRef2 = useRef(null);

  // 将 [{ item, actual_total, budget_total, variance }] 展平为分组柱状图需要的结构
  const prepareData = (arr) => {
    if (!Array.isArray(arr)) return null;
    const res = [];
    for (const it of arr) {
      const name = it?.item ?? "";
      res.push({
        item: name,
        type: "实际",
        value: Number(it?.actual_total) || 0,
      });
      res.push({
        item: name,
        type: "预算",
        value: Number(it?.budget_total) || 0,
      });
      res.push({ item: name, type: "偏差", value: Number(it?.variance) || 0 });
    }
    return res;
  };

  useEffect(() => {
    // 防止重复创建实例
    if (chartInstanceRef2.current) return;

    // 初始化图表
    const chart = new Chart({
      container: chartRef2.current,
      autoFit: true,
      height,
    });

    // 转换数据：使用传入数据，否则回退示例数据
    const seriesData = prepareData(propData);
    const finalData = seriesData && seriesData.length ? seriesData : [];

    // 图表配置（分组柱状图：x=分类，颜色=类型，y=金额）
    chart.options({
      type: "interval",
      data: finalData,
      encode: {
        x: "item",
        y: "value",
        color: "type",
      },
      transform: [{ type: "dodgeX" }],
      axis: {
        y: { title: "金额", labelFormatter: (v) => formatThousands(Number(v)) },
        x: { title: "分类" },
      },
      tooltip: {
        items: [
          {
            channel: "y",
            name: "金额",
            valueFormatter: (v) => formatThousands(v),
          },
        ],
      },
    });

    // 渲染图表
    chart.render();
    chartInstanceRef2.current = chart;

    // 组件卸载时销毁图表（非常重要！）
    return () => {
      if (chartInstanceRef2.current) {
        chartInstanceRef2.current.destroy();
        chartInstanceRef2.current = null;
      }
    };
  }, []);

  // 数据更新时刷新图表数据
  useEffect(() => {
    if (!chartInstanceRef2.current) return;
    const seriesData = prepareData(propData);
    const finalData = seriesData && seriesData.length ? seriesData : [];
    if (chartInstanceRef2.current.changeData) {
      chartInstanceRef2.current.changeData(finalData);
    } else {
      chartInstanceRef2.current.options({ data: finalData });
      chartInstanceRef2.current.render();
    }
  }, [propData]);

  return <div ref={chartRef2} style={{ width: "100%", height }} />;
};

export default BudgetLine;
