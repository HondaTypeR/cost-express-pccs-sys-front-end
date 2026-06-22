import { useEffect } from 'react';
import { Modal } from 'antd';

const POLL_INTERVAL = 5 * 60 * 1000;
const SNOOZE_DURATION = 30 * 60 * 1000;
const CURRENT_VERSION = APP_BUILD_VERSION;

let modalVisible = false;
let snoozeUntil = 0;

const showUpdateModal = () => {
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
    onOk: () => {
      window.location.reload();
    },
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
    if (data?.version && data.version !== CURRENT_VERSION) {
      showUpdateModal();
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
