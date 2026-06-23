import { useEffect } from 'react';
import { Modal } from 'antd';

const POLL_INTERVAL = 5 * 60 * 1000;
const SNOOZE_DURATION = 5 * 60 * 1000;
const CURRENT_VERSION = APP_BUILD_VERSION;
const REFRESHED_VERSION_KEY = 'refreshed_update_version';

let modalVisible = false;
let snoozeUntil = 0;

const getRefreshedVersion = () => {
  try {
    return window.sessionStorage.getItem(REFRESHED_VERSION_KEY);
  } catch {
    return null;
  }
};

const setRefreshedVersion = (version) => {
  try {
    window.sessionStorage.setItem(REFRESHED_VERSION_KEY, version);
  } catch {
    // storage can be unavailable in private mode; refreshing should still work
  }
};

const clearRefreshedVersion = () => {
  try {
    window.sessionStorage.removeItem(REFRESHED_VERSION_KEY);
  } catch {
    // ignore storage errors
  }
};

const clearBrowserCaches = async () => {
  if (!window.caches) {
    return;
  }
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
};

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

const getCacheBustedUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('_update', Date.now().toString());
  return url.toString();
};

const reloadForUpdate = async (targetVersion) => {
  setRefreshedVersion(targetVersion);

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        await skipWaitingWorker(registration.waiting);
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    await clearBrowserCaches();
  } catch {
    // still reload even if cache/SW cleanup fails
  }

  window.location.replace(getCacheBustedUrl());
};

const showUpdateModal = (targetVersion) => {
  if (modalVisible || Date.now() < snoozeUntil) {
    return;
  }

  modalVisible = true;
  Modal.confirm({
    title: '系统已更新',
    content:
      '检测到新版本已发布，请刷新页面以使用最新功能。未保存的数据可能丢失，请先保存。',
    okText: '立即刷新',
    cancelText: '稍后提醒',
    centered: true,
    onOk: () => reloadForUpdate(targetVersion),
    onCancel: () => {
      snoozeUntil = Date.now() + SNOOZE_DURATION;
    },
    afterClose: () => {
      modalVisible = false;
    },
  });
};

const checkVersion = async () => {
  if (process.env.NODE_ENV === 'development' || CURRENT_VERSION === 'dev') {
    return;
  }

  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const latestVersion = data?.version;
    if (!latestVersion) {
      return;
    }

    if (latestVersion === CURRENT_VERSION) {
      clearRefreshedVersion();
      return;
    }

    if (latestVersion === getRefreshedVersion()) {
      return;
    }

    if (latestVersion !== CURRENT_VERSION) {
      showUpdateModal(latestVersion);
    }
  } catch {
    // ignore network errors during polling
  }
};

const VersionUpdateNotifier = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || CURRENT_VERSION === 'dev') {
      return undefined;
    }

    checkVersion();

    const timer = window.setInterval(checkVersion, POLL_INTERVAL);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};

export default VersionUpdateNotifier;
