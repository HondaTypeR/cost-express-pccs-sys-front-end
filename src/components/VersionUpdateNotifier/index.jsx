import { useEffect } from 'react';
import { Modal } from 'antd';

// 1. 轮询间隔：5分钟
const POLL_INTERVAL = 5 * 60 * 1000;
// 2. 稍后提醒的冷却时间：30分钟
const SNOOZE_DURATION = 30 * 60 * 1000;

// 假设 APP_BUILD_VERSION 是通过 Webpack/Vite 在构建时注入的全局变量
const CURRENT_VERSION = APP_BUILD_VERSION;

// 持久化存储的 Key
const REFRESHED_VERSION_KEY = 'refreshed_update_version';
const SNOOZE_UNTIL_KEY = 'update_snooze_until';

// 模块级变量：记录当前会话的“基准版本”，防止首次加载就弹窗
let baseVersion = null;
// 模块级变量：防止 Modal 重复弹出
let modalVisible = false;

// ================= 存储操作封装 =================
const getRefreshedVersion = () => {
  try { return window.localStorage.getItem(REFRESHED_VERSION_KEY); } catch { return null; }
};
const setRefreshedVersion = (version) => {
  try { window.localStorage.setItem(REFRESHED_VERSION_KEY, version); } catch { }
};
const clearRefreshedVersion = () => {
  try { window.localStorage.removeItem(REFRESHED_VERSION_KEY); } catch { }
};
const getSnoozeUntil = () => {
  try { return Number(window.localStorage.getItem(SNOOZE_UNTIL_KEY)) || 0; } catch { return 0; }
};
const setSnoozeUntil = (timestamp) => {
  try { window.localStorage.setItem(SNOOZE_UNTIL_KEY, String(timestamp)); } catch { }
};

// ================= 核心清理与刷新逻辑 =================

// 清理浏览器 Cache Storage (主要针对 PWA/Service Worker 缓存)
const clearBrowserCaches = async () => {
  if (!window.caches) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch (e) {
    console.warn('清理浏览器缓存失败:', e);
  }
};

// 强制 Service Worker 跳过等待
const skipWaitingWorker = (worker) =>
  new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (msgEvent) => {
      if (msgEvent.data.error) {
        reject(msgEvent.data.error);
      } else {
        resolve(msgEvent.data);
      }
    };
    worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
  });

// 生成带时间戳的 URL，防止 CDN/代理 缓存 index.html
const getCacheBustedUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('_update', Date.now().toString());
  return url.toString();
};

// 执行强制刷新
const reloadForUpdate = async (targetVersion) => {
  // 1. 记录已刷新的版本，防止刷新后再次弹窗
  setRefreshedVersion(targetVersion);

  try {
    // 2. 处理 Service Worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      // 如果有等待中的 SW，强制其激活
      if (registration?.waiting) {
        await skipWaitingWorker(registration.waiting);
      }
      // 注销所有旧的 SW
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    // 3. 清理浏览器缓存
    await clearBrowserCaches();
  } catch (e) {
    // 即使清理失败，也必须执行刷新
    console.warn('更新清理过程出现异常，但仍将执行刷新:', e);
  }

  // 4. 强制刷新页面（使用 replace 避免产生多余的历史记录）
  window.location.replace(getCacheBustedUrl());
};

// ================= 弹窗与检测逻辑 =================

// 展示更新弹窗
const showUpdateModal = (targetVersion) => {
  // 如果弹窗已打开，或者在“稍后提醒”的冷却期内，直接返回
  if (modalVisible || Date.now() < getSnoozeUntil()) {
    return;
  }

  modalVisible = true;
  Modal.confirm({
    title: '系统已更新',
    content: '检测到新版本已发布，请刷新页面以使用最新功能。未保存的数据可能丢失，请先保存。',
    okText: '立即刷新',
    cancelText: '稍后提醒',
    centered: true,
    onOk: () => reloadForUpdate(targetVersion),
    onCancel: () => {
      // 记录稍后提醒的时间戳到 localStorage
      setSnoozeUntil(Date.now() + SNOOZE_DURATION);
    },
    afterClose: () => {
      modalVisible = false;
    },
  });
};

// 检查版本的核心函数
const checkVersion = async () => {
  // 开发环境或版本未定义时跳过
  if (process.env.NODE_ENV === 'development' || CURRENT_VERSION === 'dev') {
    return;
  }

  try {
    // 发起请求，强制绕过浏览器缓存
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();
    const latestVersion = data?.version;
    if (!latestVersion) return;

    // 【核心修复点 1】：首次加载只同步基准版本，绝不弹窗！
    if (baseVersion === null) {
      baseVersion = latestVersion;
      return;
    }

    // 如果服务器版本和当前代码版本一致，说明没有更新
    if (latestVersion === CURRENT_VERSION) {
      clearRefreshedVersion();
      return;
    }

    // 如果服务器版本等于用户上次刷新后的版本，说明已经是最新，不弹窗
    if (latestVersion === getRefreshedVersion()) {
      return;
    }

    // 【核心修复点 2】：只有当 服务器版本 !== 当前代码版本 时，才弹窗
    if (latestVersion !== CURRENT_VERSION) {
      showUpdateModal(latestVersion);
    }
  } catch {
    // 忽略网络错误（如断网时），避免控制台报错
  }
};

// ================= React 组件 =================
const VersionUpdateNotifier = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || CURRENT_VERSION === 'dev') {
      return undefined;
    }

    // 初始化时立即检查一次（用于同步 baseVersion）
    checkVersion();

    // 启动定时轮询
    const timer = window.setInterval(checkVersion, POLL_INTERVAL);

    // 监听页面可见性变化：用户切回浏览器时立即检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 组件卸载时清理定时器和事件监听
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 这是一个纯逻辑组件，不渲染任何 UI
  return null;
};

export default VersionUpdateNotifier;