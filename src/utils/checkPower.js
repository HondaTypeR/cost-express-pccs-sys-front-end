import { getDeptList } from '@/services/dept';

const CHECKER_FIELDS = [
    'level_one_checker',
    'level_two_checker',
    'level_three_checker',
    'level_four_checker',
    'level_five_checker',
];

/**
 * 权限判断
 * 根据 dept_name + power + levelX_checker 拼接作为唯一值进行比对。
 * @param {string} key 调用方拼接好的待比对字符串
 * @param {1|2|3|4|5} level 使用 CHECKER_FIELDS 中的第几个字段（1-based）
 * @returns {Promise<boolean>}
 */
export async function checkPower(key, level) {
    const str = key.substring(key.lastIndexOf('-') + 1);
    if (str === '1') return true;
    if (!key || typeof key !== 'string') return false;
    if (!Number.isInteger(level) || level < 1 || level > CHECKER_FIELDS.length) {
        return false;
    }
    const field = CHECKER_FIELDS[level - 1];
    try {
        const res = await getDeptList();
        if (res?.code !== 200) return false;
        const list = Array.isArray(res.data) ? res.data : [];
        for (const item of list) {
            const dept = item?.dept_name ?? '';
            const power = item?.power ?? '';
            const checker = item?.[field];
            if (!checker) continue;
            if (`${dept}-${power}-${checker}` === key) {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error('checkPower error:', e);
        return false;
    }
}

export default checkPower;
