import { Language } from '../../hooks/useLanguage';

export interface AdminCampaignManagementCopy {
  title: string;
  backToSardis: string;
  common: {
    loading: string;
    loadingMore: string;
    retry: string;
    cancel: string;
    unknown: string;
    notAvailable: string;
  };
  filters: {
    titleLabel: string;
    titlePlaceholder: string;
    statusLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    apply: string;
    all: string;
    statuses: {
      initiated: string;
      inProgress: string;
      waitingForApproval: string;
      approved: string;
      rejected: string;
      running: string;
      cancelled: string;
      cancelledByAdmin: string;
      expired: string;
      executed: string;
    };
  };
  table: {
    noData: string;
    headers: {
      row: string;
      id: string;
      customerFullName: string;
      scheduleAt: string;
      status: string;
      platform: string;
      numAudience: string;
      costPerMessage: string;
      actions: string;
      reschedule: string;
      details: string;
      content: string;
      adLink: string;
      title: string;
      level3s: string;
      tags: string;
      updatedAt: string;
      lineNumber: string;
      comment: string;
      agencyName: string;
      createdAt: string;
      segment: string;
      subsegment: string;
      sex: string;
      city: string;
      budget: string;
    };
    actions: {
      approve: string;
      reject: string;
      cancel: string;
      details: string;
      reschedule: string;
    };
  };
  modal: {
    approveTitle: string;
    rejectTitle: string;
    cancelTitle: string;
    detailsTitle: string;
    uuid: string;
    title: string;
    currentStatus: string;
    platform: string;
    platformSettingsId: string;
    mediaUuid: string;
    commentLabelOptional: string;
    commentLabelRequired: string;
    maxChars: string;
    approve: string;
    reject: string;
    cancel: string;
    submitting: string;
    closeLabel: string;
    rescheduleTitle: string;
    rescheduleDateLabel: string;
    rescheduleDateHint: string;
    rescheduleConfirmTitle: string;
    rescheduleConfirmMessage: string;
    rescheduleApply: string;
    rescheduleApplying: string;
    rescheduleSuccess: string;
    sections: {
      overview: string;
      audience: string;
      content: string;
      performance: string;
      technical: string;
    };
    detailFields: {
      level3s: string;
      tags: string;
      totalClicks: string;
      clickRate: string;
      segmentPriceFactor: string;
      lineNumberPriceFactor: string;
      shortLinkDomain: string;
      jobCategory: string;
      job: string;
      statistics: string;
    };
  };
  errors: {
    listFailed: string;
    approveFailed: string;
    rejectFailed: string;
    cancelFailed: string;
    missingNumericId: string;
    invalidStartDate: string;
    invalidEndDate: string;
    invalidDateRange: string;
    commentRequired: string;
    rescheduleFailed: string;
    rescheduleNotAllowed: string;
    rescheduleDateRequired: string;
    rescheduleDateInvalid: string;
    rescheduleDateTooSoon: string;
    rescheduleOutsideAllowedHours: string;
    rescheduleCampaignNotFound: string;
    rescheduleInvalidState: string;
    rescheduleUtcRequired: string;
    rescheduleValidationFailed: string;
    unauthorized: string;
    network: string;
  };
}

const en: AdminCampaignManagementCopy = {
  title: 'Admin Campaigns',
  backToSardis: 'Back to Sardis',
  common: {
    loading: 'Loading...',
    loadingMore: 'Loading more...',
    retry: 'Retry',
    cancel: 'Cancel',
    unknown: 'Unknown',
    notAvailable: '-',
  },
  filters: {
    titleLabel: 'Title',
    titlePlaceholder: 'Search by title',
    statusLabel: 'Status',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    apply: 'Apply',
    all: 'All',
    statuses: {
      initiated: 'Initiated',
      inProgress: 'In Progress',
      waitingForApproval: 'Waiting for Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      running: 'Running',
      cancelled: 'Cancelled',
      cancelledByAdmin: 'Cancelled by Admin',
      expired: 'Expired',
      executed: 'Executed',
    },
  },
  table: {
    noData: 'No campaigns found',
    headers: {
      row: '#',
      id: 'Campaign ID',
      customerFullName: 'Customer Full Name',
      scheduleAt: 'Schedule At',
      status: 'Status',
      platform: 'Platform',
      numAudience: 'Audience Count',
      costPerMessage: 'Cost / Message',
      actions: 'Actions',
      reschedule: 'Reschedule',
      details: 'Details',
      content: 'Content',
      adLink: 'Ad Link',
      title: 'Title',
      level3s: 'Level 3(s)',
      tags: 'Tags',
      updatedAt: 'Updated At',
      lineNumber: 'Line Number / Platform Settings',
      comment: 'Admin Comment',
      agencyName: 'Agency Name',
      createdAt: 'Created At',
      segment: 'Segment',
      subsegment: 'Subsegment',
      sex: 'Sex',
      city: 'City',
      budget: 'Budget',
    },
    actions: {
      approve: 'Approved',
      reject: 'Reject',
      cancel: 'Cancel',
      details: 'View details',
      reschedule: 'Reschedule',
    },
  },
  modal: {
    approveTitle: 'Approve Campaign',
    rejectTitle: 'Reject Campaign',
    cancelTitle: 'Cancel Campaign',
    detailsTitle: 'Campaign Details',
    uuid: 'UUID',
    title: 'Title',
    currentStatus: 'Current Status',
    platform: 'Platform',
    platformSettingsId: 'Platform Settings ID',
    mediaUuid: 'Media UUID',
    commentLabelOptional: 'Comment (optional)',
    commentLabelRequired: 'Comment (required)',
    maxChars: 'Max 1000 chars',
    approve: 'Approved',
    reject: 'Reject',
    cancel: 'Cancel',
    submitting: 'Submitting…',
    closeLabel: 'Close',
    rescheduleTitle: 'Reschedule Campaign',
    rescheduleDateLabel: 'New Schedule Time',
    rescheduleDateHint:
      'Select a future time between 08:00 and 21:00 (Tehran local time).',
    rescheduleConfirmTitle: 'Confirm Reschedule',
    rescheduleConfirmMessage:
      'Are you sure you want to reschedule this campaign?',
    rescheduleApply: 'Continue',
    rescheduleApplying: 'Rescheduling…',
    rescheduleSuccess: 'Campaign rescheduled successfully.',
    sections: {
      overview: 'Overview',
      audience: 'Audience & Targeting',
      content: 'Content & Delivery',
      performance: 'Performance & Pricing',
      technical: 'Technical Metadata',
    },
    detailFields: {
      level3s: 'Level 3',
      tags: 'Tags',
      totalClicks: 'Clicks',
      clickRate: 'Click Rate',
      segmentPriceFactor: 'Segment Price Factor',
      lineNumberPriceFactor: 'Line Number Price Factor',
      shortLinkDomain: 'Short Link Domain',
      jobCategory: 'Job Category',
      job: 'Job',
      statistics: 'Statistics',
    },
  },
  errors: {
    listFailed: 'Failed to list campaigns',
    approveFailed: 'Approve failed',
    rejectFailed: 'Reject failed',
    cancelFailed: 'Cancel failed',
    missingNumericId: 'Campaign numeric id not available',
    invalidStartDate: 'Start date is invalid',
    invalidEndDate: 'End date is invalid',
    invalidDateRange: 'Start date must be before end date',
    commentRequired: 'Comment is required',
    rescheduleFailed: 'Failed to reschedule campaign',
    rescheduleNotAllowed:
      'Campaign cannot be rescheduled in its current status',
    rescheduleDateRequired: 'Please select a schedule time',
    rescheduleDateInvalid: 'Selected schedule time is invalid',
    rescheduleDateTooSoon:
      'Schedule time must be at least 7 minutes in the future',
    rescheduleOutsideAllowedHours:
      'Schedule time must be between 08:00 and 21:00',
    rescheduleCampaignNotFound: 'Campaign not found',
    rescheduleInvalidState:
      'Campaign cannot be rescheduled in its current status',
    rescheduleUtcRequired: 'Schedule time must be in UTC',
    rescheduleValidationFailed: 'Validation failed for reschedule request',
    unauthorized: 'Unauthorized',
    network: 'Network error',
  },
};

const fa: AdminCampaignManagementCopy = {
  title: 'ارسال‌های ادمین',
  backToSardis: 'بازگشت به ساردیس',
  common: {
    loading: 'در حال بارگذاری...',
    loadingMore: 'در حال بارگذاری...',
    retry: 'تلاش مجدد',
    cancel: 'انصراف',
    unknown: 'نامشخص',
    notAvailable: '-',
  },
  filters: {
    titleLabel: 'عنوان/نام مشتری',
    titlePlaceholder: 'جستجو بر اساس عنوان/نام مشتری',
    statusLabel: 'وضعیت',
    startDateLabel: 'تاریخ شروع',
    endDateLabel: 'تاریخ پایان',
    apply: 'اعمال',
    all: 'همه',
    statuses: {
      initiated: 'آغاز شده',
      inProgress: 'در حال انجام',
      waitingForApproval: 'در انتظار تأیید',
      approved: 'تأیید شده',
      rejected: 'رد شده',
      running: 'در حال اجرا',
      cancelled: 'لغو شده',
      cancelledByAdmin: 'لغو شده توسط ادمین',
      expired: 'منقضی شده',
      executed: 'اجرا شده',
    },
  },
  table: {
    noData: 'کمپینی یافت نشد',
    headers: {
      row: '#',
      id: 'شناسه کمپین',
      customerFullName: 'نام کامل مشتری',
      scheduleAt: 'زمان‌بندی',
      status: 'وضعیت',
      platform: 'پلتفرم',
      numAudience: 'تعداد مخاطبان',
      costPerMessage: 'تعرفه ارسال',
      actions: 'اقدامات',
      reschedule: 'زمان‌بندی مجدد',
      details: 'جزئیات',
      content: 'محتوا',
      adLink: 'لینک تبلیغ',
      title: 'عنوان',
      level3s: 'سطح ۳',
      tags: 'برچسب‌ها',
      updatedAt: 'به‌روزرسانی در',
      lineNumber: 'سرشماره / تنظیمات کانال',
      comment: 'توضیح ادمین',
      agencyName: 'نام آژانس',
      createdAt: 'ایجاد شده در',
      segment: 'بخش',
      subsegment: 'زیر‌بخش',
      sex: 'جنسیت',
      city: 'شهر',
      budget: 'بودجه',
    },
    actions: {
      approve: 'تأیید شد',
      reject: 'رد',
      cancel: 'لغو',
      details: 'مشاهده جزئیات',
      reschedule: 'زمان‌بندی مجدد',
    },
  },
  modal: {
    approveTitle: 'تأیید کمپین',
    rejectTitle: 'رد کمپین',
    cancelTitle: 'لغو کمپین',
    detailsTitle: 'جزئیات کمپین',
    uuid: 'UUID',
    title: 'عنوان',
    currentStatus: 'وضعیت فعلی',
    platform: 'کانال',
    platformSettingsId: 'شناسه تنظیمات کانال',
    mediaUuid: 'شناسه رسانه',
    commentLabelOptional: 'توضیح (اختیاری)',
    commentLabelRequired: 'توضیح (الزامی)',
    maxChars: 'حداکثر ۱۰۰۰ کاراکتر',
    approve: 'تأیید شد',
    reject: 'رد',
    cancel: 'لغو',
    submitting: 'در حال ارسال…',
    closeLabel: 'بستن',
    rescheduleTitle: 'زمان‌بندی مجدد کمپین',
    rescheduleDateLabel: 'زمان جدید ارسال',
    rescheduleDateHint:
      'یک زمان آینده بین ۰۸:۰۰ تا ۲۱:۰۰ انتخاب کنید (بر اساس زمان تهران).',
    rescheduleConfirmTitle: 'تأیید زمان‌بندی مجدد',
    rescheduleConfirmMessage: 'آیا از زمان‌بندی مجدد این کمپین مطمئن هستید؟',
    rescheduleApply: 'ادامه',
    rescheduleApplying: 'در حال زمان‌بندی مجدد…',
    rescheduleSuccess: 'کمپین با موفقیت زمان‌بندی مجدد شد.',
    sections: {
      overview: 'نمای کلی',
      audience: 'مخاطب و هدف‌گیری',
      content: 'محتوا و ارسال',
      performance: 'عملکرد و قیمت‌گذاری',
      technical: 'فراداده فنی',
    },
    detailFields: {
      level3s: 'سطح ۳',
      tags: 'برچسب‌ها',
      totalClicks: 'کلیک‌ها',
      clickRate: 'نرخ کلیک',
      segmentPriceFactor: 'ضریب قیمت سگمنت',
      lineNumberPriceFactor: 'ضریب قیمت سرشماره',
      shortLinkDomain: 'دامنه لینک کوتاه',
      jobCategory: 'دسته‌بندی شغلی',
      job: 'شغل',
      statistics: 'آمار',
    },
  },
  errors: {
    listFailed: 'دریافت فهرست ارسال‌ها ناموفق بود',
    approveFailed: 'تأیید ناموفق بود',
    rejectFailed: 'رد ناموفق بود',
    cancelFailed: 'لغو ناموفق بود',
    missingNumericId: 'شناسه عددی کمپین در دسترس نیست',
    invalidStartDate: 'تاریخ شروع معتبر نیست',
    invalidEndDate: 'تاریخ پایان معتبر نیست',
    invalidDateRange: 'تاریخ شروع باید قبل از تاریخ پایان باشد',
    commentRequired: 'وارد کردن توضیح الزامی است',
    rescheduleFailed: 'زمان‌بندی مجدد کمپین ناموفق بود',
    rescheduleNotAllowed: 'در وضعیت فعلی امکان زمان‌بندی مجدد کمپین وجود ندارد',
    rescheduleDateRequired: 'لطفا زمان ارسال را انتخاب کنید',
    rescheduleDateInvalid: 'زمان انتخاب‌شده معتبر نیست',
    rescheduleDateTooSoon: 'زمان ارسال باید حداقل ۷ دقیقه در آینده باشد',
    rescheduleOutsideAllowedHours: 'زمان ارسال باید بین ۰۸:۰۰ تا ۲۱:۰۰ باشد',
    rescheduleCampaignNotFound: 'کمپین یافت نشد',
    rescheduleInvalidState:
      'در وضعیت فعلی امکان زمان‌بندی مجدد کمپین وجود ندارد',
    rescheduleUtcRequired: 'زمان ارسال باید به صورت UTC باشد',
    rescheduleValidationFailed: 'اعتبارسنجی درخواست زمان‌بندی مجدد ناموفق بود',
    unauthorized: 'عدم دسترسی',
    network: 'خطای شبکه',
  },
};

const map: Record<Language, AdminCampaignManagementCopy> = {
  en,
  fa,
};

export const getAdminCampaignManagementCopy = (
  language: Language
): AdminCampaignManagementCopy => map[language] || map.en;
