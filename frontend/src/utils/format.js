/**
 * 日期字符串规范化（内部工具函数）
 * 统一处理 SQLite 无时区字符串 → UTC ISO 格式
 */
const normalizeDate = (str) => {
    if (!str) return null;
    if (typeof str !== 'string') return str;
    if (!str.includes('Z') && !str.includes('+')) {
        return str.includes('T') ? str + 'Z' : str.replace(' ', 'T') + 'Z';
    }
    return str;
};

/**
 * 日期格式化（相对时间 + 绝对时间）
 */
export const formatDate = (str) => {
    const s = normalizeDate(str);
    if (!s) return '-';
    const date = new Date(s);
    if (isNaN(date.getTime())) return '-';
    const diff = (Date.now() - date) / 1000;
    if (diff < 60) return '< 1m ago';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    try {
        return date.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return '-';
    }
};

/**
 * Admin 专用格式化（完整日期时间）
 */
export const formatDateFull = (str) => {
    const s = normalizeDate(str);
    if (!s) return '-';
    const date = new Date(s);
    if (isNaN(date.getTime())) return '-';
    try {
        return date.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        });
    } catch {
        return '-';
    }
};

/**
 * 证书/域名剩余天数
 */
export const getDaysRemaining = (dateStr) => {
    const s = normalizeDate(dateStr);
    if (!s) return null;
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400000);
};

/**
 * 到期时间 CSS 类
 */
export const getExpiryClass = (dateStr) => {
    const days = getDaysRemaining(dateStr);
    if (days === null) return 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60';
    if (days < 0)  return 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10';
    if (days < 7)  return 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10';
    if (days < 30) return 'text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-400/30 bg-yellow-50 dark:bg-yellow-400/10';
    return 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10';
};

/**
 * Admin 到期 CSS 类
 */
export const getExpiryClassAdmin = (dateStr) => {
    if (!dateStr) return 'text-green-600 dark:text-green-400';
    const days = getDaysRemaining(dateStr);
    if (days < 7)  return 'text-red-600 dark:text-red-400 font-bold';
    if (days < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
};

/**
 * 到期天数显示
 */
export const formatExpiry = (dateStr) => {
    const days = getDaysRemaining(dateStr);
    if (days === null) return '';
    if (days < 0) return 'Expired';
    return `${days}d`;
};

/**
 * 延迟颜色分级
 */
export const latencyClass = (ms) => {
    if (ms < 100) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/8 border-emerald-200 dark:border-emerald-500/20';
    if (ms < 300) return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/8 border-sky-200 dark:border-sky-500/20';
    if (ms < 800) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/8 border-yellow-200 dark:border-yellow-500/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/8 border-red-200 dark:border-red-500/20';
};
