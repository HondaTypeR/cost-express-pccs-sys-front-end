/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    name: '欢迎页',
    icon: 'SmileOutlined',
    path: '/welcome',
    component: './welcome',
  },
  {
    name: '数据看板',
    icon: 'DashboardOutlined',
    path: '/dashboard',
    component: './dashboard',
  },
  {
    name: '人员管理',
    icon: 'TeamOutlined',
    path: '/personnel',
    component: './personnel',
  },
  {
    name: '公司管理',
    icon: 'TableOutlined',
    path: '/company',
    component: './company',
  },
  {
    name: '供应商管理',
    icon: 'TransactionOutlined',
    path: '/supplier',
    component: './supplier',
  },
  {
    name: '权限管理',
    icon: 'SafetyOutlined',
    path: '/power',
    component: './power',
  },
   {
    name: '项目管理',
    icon: 'SnippetsOutlined',
    path: '/project',
    component: './project',
  },
   {
    name: '合同管理',
    icon: 'DiffOutlined',
    path: '/contract',
    component: './contract',
  },
  {
    name: '补充合同管理',
    icon: 'DiffOutlined',
    path: '/sub-contract-list',
    hideInMenu: true,
    component: './sub-contract',
  },
   {
    name: '预算管理',
    icon: 'HighlightOutlined',
    path: '/comprehensive',
    component: './comprehensive',
  },
    {
    name: '材料管理',
    icon: 'DropboxOutlined',
    path: '/materialManagement',
    component: './materialManagement',
  },
    {
    name: '机械管理',
    icon: 'DeploymentUnitOutlined',
    path: '//mechanicalManagement',
    component: './mechanicalManagement',
  },
  {
    name: '人工管理',
    icon: 'UsergroupDeleteOutlined',
    path: '/artificialManagement',
    component: './artificialManagement',
  },
  {
    name: '财务管理',
    icon: 'PropertySafetyOutlined',
    path: '/financeManagement',
    component: './financeManagement',
  },
  
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/403',
    layout: false,
    component: './403',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
