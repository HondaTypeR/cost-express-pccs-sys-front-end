import { AvatarDropdown, AvatarName, Footer } from "@/components";
import { getUserMenus } from "@/services/menu.js";
import { currentUser as queryCurrentUser } from "@/services/userInfo.js";
import {
  DashboardOutlined,
  DeploymentUnitOutlined,
  DiffOutlined,
  DropboxOutlined,
  HighlightOutlined,
  PropertySafetyOutlined,
  SafetyOutlined,
  SmileOutlined,
  SnippetsOutlined,
  TableOutlined,
  TeamOutlined,
  TransactionOutlined,
  UsergroupDeleteOutlined,
} from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { history } from "@umijs/max";
import defaultSettings from "../config/defaultSettings";
import { errorConfig } from "./requestErrorConfig";

const isDev = process.env.NODE_ENV === "development";
const loginPath = "/user/login";

// 图标映射表
const iconMap = {
  TeamOutlined: <TeamOutlined />,
  TableOutlined: <TableOutlined />,
  TransactionOutlined: <TransactionOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  SnippetsOutlined: <SnippetsOutlined />,
  DiffOutlined: <DiffOutlined />,
  HighlightOutlined: <HighlightOutlined />,
  UsergroupDeleteOutlined: <UsergroupDeleteOutlined />,
  DeploymentUnitOutlined: <DeploymentUnitOutlined />,
  DropboxOutlined: <DropboxOutlined />,
  PropertySafetyOutlined: <PropertySafetyOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  SmileOutlined: <SmileOutlined />,
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState() {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (_error) {
      history.push(loginPath);
    }
    return undefined;
  };

  const fetchMenuData = async () => {
    try {
      const msg = await getUserMenus({
        skipErrorHandler: true,
      });
      // 转换菜单数据，将 icon 字符串映射到实际的图标组件
      const menuData = msg.data || [];
      return menuData.map((item) => ({
        ...item,
        icon: iconMap[item.icon] || null,
      }));
    } catch (_error) {
      console.error("Failed to fetch menu data:", _error);
    }
    return [];
  };

  // 如果不是登录页面，执行
  const { location } = history;
  if (
    ![loginPath, "/user/register", "/user/register-result"].includes(
      location.pathname
    )
  ) {
    const currentUser = await fetchUserInfo();
    const menuData = await fetchMenuData();
    return {
      fetchUserInfo,
      currentUser,
      menuData: menuData?.filter((item) => !["/power"].includes(item.path)),
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout = ({ initialState, setInitialState }) => {
  return {
    // 使用服务端返回的菜单数据
    menu: {
      params: initialState,
      request: async () => {
        return (
          initialState?.menuData?.filter(
            (item) => item?.path !== "/sub-contract-list"
          ) || []
        );
      },
      locale: false, // 禁用国际化
    },
    actionsRender: () => [],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
        return;
      }

      // 检查路由权限
      if (initialState?.currentUser && initialState?.menuData) {
        const currentPath = location.pathname;
        // 白名单路由，不需要权限检查
        const whiteList = [
          loginPath,
          "/user/register",
          "/user/register-result",
          "/",
          "/403",
        ];

        if (!whiteList.includes(currentPath)) {
          // 获取所有允许访问的路径
          const allowedPaths = initialState.menuData.map((item) => item.path);

          // 检查当前路径是否在允许的路径中
          const hasPermission = allowedPaths.some((path) => {
            // 精确匹配或者前缀匹配（支持子路由）
            return currentPath === path || currentPath.startsWith(path + "/");
          });

          if (!hasPermission) {
            // 没有权限，重定向到 403 页面
            history.push("/403");
          }
        }
      }
    },
    breadcrumbRender: (routers = []) => [
      {
        path: "/",
        breadcrumbName: "首页",
      },
      ...routers,
    ],
    bgLayoutImgList: [
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr",
        left: 85,
        bottom: 100,
        height: "303px",
      },
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr",
        bottom: -68,
        right: -45,
        height: "303px",
      },
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr",
        bottom: 0,
        left: 0,
        width: "331px",
      },
    ],
    links: [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {/* {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )} */}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
