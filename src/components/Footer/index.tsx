import { DefaultFooter } from "@ant-design/pro-components";
import React from "react";

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: "none",
        userSelect: "none",
      }}
      copyright="2026 贵州久益建筑"
      links={
        [
          // {
          //   key: "Ant Design",
          //   title: "Ant Design",
          //   href: "https://ant.design",
          //   blankTarget: true,
          // },
        ]
      }
    />
  );
};

export default Footer;
