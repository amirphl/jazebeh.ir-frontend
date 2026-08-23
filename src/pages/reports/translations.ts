export interface ReportsTranslations {
  title: string;
  campaignFilterPlaceholder: string;
  filterByBundle: string;
  filterByCampaign: string;
  filterByPhase: string;
  filterByPlatform: string;
  filterByStartDate: string;
  filterByEndDate: string;
  bundleAll: string;
  phaseAll: string;
  phaseTest: string;
  phaseExecution: string;
  bundleLoading: string;
  platformAll: string;
  orderBy: string;
  startDatePlaceholder: string;
  endDatePlaceholder: string;
  loadMore: string;
  noMore: string;
  loading: string;
  invalidDateRange: string;
  platforms: {
    sms: string;
    rubika: string;
    bale: string;
    splus: string;
  };
  orderOptions: {
    newest: string;
    oldest: string;
    phaseTestFirst: string;
    phaseExecutionFirst: string;
    highestClickRate: string;
    lowestClickRate: string;
  };
  bulkHide: {
    modeToggle: string;
    modeHint: string;
    selectionColumn: string;
    selectionCount: (count: number) => string;
    button: string;
    submitting: string;
    confirm: (count: number) => string;
    success: (count: number) => string;
    errors: {
      emptySelection: string;
      fallback: string;
      unauthorized: string;
    };
  };
  bulkUnhide: {
    modeToggle: string;
    modeHint: string;
    selectionColumn: string;
    selectionCount: (count: number) => string;
    button: string;
    submitting: string;
    confirm: (count: number) => string;
    success: (count: number) => string;
    errors: {
      emptySelection: string;
      fallback: string;
      unauthorized: string;
      notFound: string;
    };
  };
  bulkClickReport: {
    modeToggle: string;
    modeHint: string;
    selectionColumn: string;
    selectionCount: (count: number) => string;
    button: string;
    submitting: string;
    success: string;
    ineligible: string;
    errors: {
      emptySelection: string;
      fallback: string;
      unauthorized: string;
      forbidden: string;
      invalidSelection: string;
      notFound: string;
      tooLarge: string;
      timeout: string;
      network: string;
      invalidResponse: string;
    };
  };
  showHiddenCampaigns: {
    toggle: string;
    hint: string;
  };
  table: {
    bundleTitle: string;
    campaignTitle: string;
    text: string;
    lineNumber: string;
    platform: string;
    segment: string;
    level3: string;
    aggregatedTotalSent: string;
    clickRate: string;
    status: string;
    numAudience: string;
    createdAt: string;
    scheduledAt: string;
    details: string;
    subsegments: string;
    sex: string;
    cities: string;
    adlink: string;
    updatedAt: string;
    actions: string;
    bundle: string;
    phase: string;
  };
  statuses: {
    initiated: string;
    'in-progress': string;
    'waiting-for-approval': string;
    approved: string;
    rejected: string;
    running: string;
    cancelled: string;
    'cancelled-by-admin': string;
    expired: string;
    executed: string;
    [key: string]: string;
  };
  clone: {
    button: string;
    confirm: string;
    success: string;
    error: string;
    notAllowed: string;
    modalTitle: string;
    modalBody: string;
    close: string;
  };
  resume: {
    button: string;
    confirm: string;
    success: string;
    error: string;
    notAllowed: string;
  };
  modal: {
    details: string;
    rejected: string;
    close: string;
    fixAndRestart: string;
    bundleSection: string;
    bundleLoading: string;
    bundleObjective: string;
    bundlePersona: string;
    bundleTargetCustomerName: string;
    bundleCategory: string;
    bundleJob: string;
    campaignSection: string;
    segmentationSection: string;
    segmentationMethod: string;
    segmentationMethodLevels: string;
    segmentationMethodSmartTargeting: string;
    segmentationMethodExcelFile: string;
    selectedTagCount: string;
    selectedRawCapacity: string;
    audienceGrades: string;
    excelFileUuid: string;
    platformSection: string;
    platformSettingsName: string;
    platformBasePrice: string;
    contentSection: string;
    attachedMedia: string;
    mediaPreviewLoading: string;
    mediaPreviewEmpty: string;
    mediaPreviewFailed: string;
    shortLinkDomain: string;
    budgetSection: string;
    campaignCost: string;
    refund: string;
    performanceSection: string;
    bundleTitle: string;
    phase: string;
    lineNumber: string;
    platform: string;
    subsegments: string;
    sex: string;
    cities: string;
    adlink: string;
    scheduleAt: string;
    updatedAt: string;
    level1: string;
    level2: string;
    level3: string;
    level3v2: string;
    linePriceFactor: string;
    segmentPriceFactor: string;
    pricing: string;
    budget: string;
    comment: string;
    statistics: string;
    clickRate: string;
    totalClicks: string;
    totalSentSuccessfully: string;
    totalSentRecords: string;
    totalFailedRecords: string;
    estimatedDeliveredCost: string;
    estimatedDeliveredCostNote: string;
    inactiveChannelNumbers: string;
    numAudience: string;
    linkShortener: string;
    cancelCampaign: string;
    cancelCommentPlaceholder: string;
    cancel: string;
    cancelling: string;
    cancelled: string;
    cancelSuccess: string;
    cancelError: string;
    cancelNotAllowed: string;
    cancelConfirm: string;
    exportReport: string;
    exportingReport: string;
    exportError: string;
    exportMissingCampaignUuid: string;
    exportInvalidCampaignUuid: string;
    exportUnauthorized: string;
    exportForbidden: string;
    exportNotFound: string;
    actionAtr: string;
    actionCount: string;
    eligibleDelivered: string;
    campaignAtr: string;
    exportClickReport: string;
    exportingClickReport: string;
    clickReportError: string;
    clickReportNotFound: string;
    clickReportTimeout: string;
    clickReportNetworkError: string;
    clickReportInvalidResponse: string;
  };
}

export const reportsTranslations: Record<'en' | 'fa', ReportsTranslations> = {
  en: {
    title: 'Reports',
    campaignFilterPlaceholder: 'Enter campaign title',
    filterByBundle: 'Bundle Title',
    filterByCampaign: 'Campaign Title',
    filterByPhase: 'Phase',
    filterByPlatform: 'Platform',
    filterByStartDate: 'Start Date',
    filterByEndDate: 'End Date',
    bundleAll: 'All bundles',
    phaseAll: 'All phases',
    phaseTest: 'Test',
    phaseExecution: 'Execution',
    bundleLoading: 'Loading bundles...',
    platformAll: 'All platforms',
    orderBy: 'Order By',
    startDatePlaceholder: 'Select start date',
    endDatePlaceholder: 'Select end date',
    loadMore: 'Load more',
    noMore: 'No more campaigns',
    loading: 'Loading...',
    invalidDateRange: 'Start date must be earlier than end date.',
    platforms: {
      sms: 'SMS',
      rubika: 'Rubika',
      bale: 'Bale',
      splus: 'S+',
    },
    orderOptions: {
      newest: 'Newest',
      oldest: 'Oldest',
      phaseTestFirst: 'Phase: Test First',
      phaseExecutionFirst: 'Phase: Execution First',
      highestClickRate: 'Highest Click Rate',
      lowestClickRate: 'Lowest Click Rate',
    },
    bulkHide: {
      modeToggle: 'Hide campaigns',
      modeHint: '',
      selectionColumn: 'Select',
      selectionCount: (count: number) =>
        `${count} campaign${count === 1 ? '' : 's'} selected`,
      button: 'Hide selected campaigns',
      submitting: 'Hiding...',
      confirm: (count: number) =>
        `Hide ${count} selected campaign${count === 1 ? '' : 's'} from your reports list?`,
      success: (count: number) =>
        `${count} campaign${count === 1 ? '' : 's'} hidden successfully.`,
      errors: {
        emptySelection: 'Select at least one campaign to hide.',
        fallback: 'Failed to hide selected campaigns.',
        unauthorized: 'You are not authorized. Please log in again.',
      },
    },
    bulkUnhide: {
      modeToggle: 'Unhide campaigns',
      modeHint: '',
      selectionColumn: 'Select',
      selectionCount: (count: number) =>
        `${count} campaign${count === 1 ? '' : 's'} selected`,
      button: 'Unhide selected campaigns',
      submitting: 'Unhiding...',
      confirm: (count: number) =>
        `Restore ${count} hidden campaign${count === 1 ? '' : 's'} to your reports list?`,
      success: (count: number) =>
        `${count} campaign${count === 1 ? '' : 's'} restored successfully.`,
      errors: {
        emptySelection: 'Select at least one campaign to unhide.',
        fallback: 'Failed to unhide selected campaigns.',
        unauthorized: 'You are not authorized. Please log in again.',
        notFound: 'One or more campaigns were not found.',
      },
    },
    bulkClickReport: {
      modeToggle: 'Download click reports',
      modeHint:
        'Select campaigns with an ad link to download one combined report.',
      selectionColumn: 'Select',
      selectionCount: (count: number) =>
        `${count} campaign${count === 1 ? '' : 's'} selected`,
      button: 'Download Campaign Audience Report',
      submitting: 'Preparing click report...',
      success: 'Click report download started.',
      ineligible:
        'A click report is available only for campaigns with an ad link.',
      errors: {
        emptySelection: 'Select at least one eligible campaign.',
        fallback: "Failed to download the selected campaigns' click report.",
        unauthorized: 'You are not authorized. Please log in again.',
        forbidden: 'You do not have access to export these campaign reports.',
        invalidSelection:
          'The selected campaigns are invalid. Please select them again.',
        notFound:
          'A click report is not available for one or more selected campaigns.',
        tooLarge: 'The selected click report is too large for one worksheet.',
        timeout: 'The click report request timed out. Please try again.',
        network:
          'Network error while downloading the click report. Please check your connection and try again.',
        invalidResponse:
          'The server returned an invalid click report response.',
      },
    },
    showHiddenCampaigns: {
      toggle: 'Show hidden campaigns',
      hint: 'Display campaigns that have been hidden from your reports list.',
    },
    table: {
      bundleTitle: 'Bundle Title',
      campaignTitle: 'Campaign Title',
      text: 'Text',
      lineNumber: 'Line Number/Service',
      platform: 'Platform',
      segment: 'Segment',
      level3: 'Target Audience',
      aggregatedTotalSent: 'Aggregated Total Sent',
      clickRate: 'Click Rate',
      status: 'Status',
      numAudience: 'Total',
      createdAt: 'Created At',
      scheduledAt: 'Scheduled At',
      details: 'Details',
      subsegments: 'Subsegments',
      sex: 'Sex',
      cities: 'Cities',
      adlink: 'Ad Link',
      updatedAt: 'Updated At',
      actions: 'Actions',
      bundle: 'Bundle',
      phase: 'Phase',
    },
    statuses: {
      initiated: 'Initiated',
      'in-progress': 'In Progress',
      'waiting-for-approval': 'Waiting for Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      running: 'Running',
      cancelled: 'Cancelled',
      'cancelled-by-admin': 'Cancelled by Admin',
      expired: 'Expired',
      executed: 'Executed',
    },
    clone: {
      button: 'Clone',
      confirm: 'Cloning will replace your current in-progress draft. Continue?',
      success: 'Campaign cloned. Loading draft...',
      error: 'Failed to clone campaign.',
      notAllowed: 'This campaign cannot be cloned right now.',
      modalTitle: 'Campaign cloned',
      modalBody:
        'Your campaign was cloned. When you open the Segment page, the latest draft will be loaded automatically.',
      close: 'Close',
    },
    resume: {
      button: 'Resume',
      confirm: 'Resume this campaign? It will replace the current draft.',
      success: 'Campaign loaded. Redirecting to editor...',
      error: 'Failed to resume campaign.',
      notAllowed: 'This campaign cannot be resumed right now.',
    },
    modal: {
      details: 'Details',
      rejected: 'Rejected',
      close: 'Close',
      fixAndRestart: 'Fix and restart the campaign?',
      bundleSection: 'Bundle',
      bundleLoading: 'Loading bundle details...',
      bundleObjective: 'Objective',
      bundlePersona: 'Persona',
      bundleTargetCustomerName: 'Target Customer Name',
      bundleCategory: 'Category',
      bundleJob: 'Job',
      campaignSection: 'Campaign',
      segmentationSection: 'Segmentation Method',
      segmentationMethod: 'Method',
      segmentationMethodLevels: 'Levels',
      segmentationMethodSmartTargeting: 'Smart Targeting',
      segmentationMethodExcelFile: 'Excel File',
      selectedTagCount: 'Selected Tags',
      selectedRawCapacity: 'Selected Raw Capacity',
      audienceGrades: 'Audience Grades',
      excelFileUuid: 'Excel File UUID',
      platformSection: 'Platform',
      platformSettingsName: 'Platform Settings Name',
      platformBasePrice: 'Platform Base Price',
      contentSection: 'Content',
      attachedMedia: 'Attached Media',
      mediaPreviewLoading: 'Loading media preview...',
      mediaPreviewEmpty: 'No attached media',
      mediaPreviewFailed: 'Failed to load media preview',
      shortLinkDomain: 'Short Link Domain',
      budgetSection: 'Budget',
      campaignCost: 'Campaign Cost',
      refund: 'Refund',
      performanceSection: 'Performance',
      bundleTitle: 'Bundle Title',
      phase: 'Phase',
      lineNumber: 'Line Number/Service',
      platform: 'Platform',
      subsegments: 'Subsegments',
      sex: 'Sex',
      cities: 'Cities',
      adlink: 'Ad Link',
      scheduleAt: 'Schedule At',
      updatedAt: 'Updated At',
      level1: 'Level 1',
      level2: 'Level 2',
      level3: 'Level 3',
      level3v2: 'Level 3',
      linePriceFactor: 'Line Price Factor',
      segmentPriceFactor: 'Segment Price Factor',
      pricing: 'Pricing & Budget',
      budget: 'Budget',
      comment: 'Comment',
      statistics: 'Statistics',
      clickRate: 'Click Rate',
      totalClicks: 'Total Clicks',
      totalSentSuccessfully: 'Total Sent Successfully',
      totalSentRecords: 'Total Sent Records',
      totalFailedRecords: 'Total Failed Records',
      estimatedDeliveredCost: 'Estimated Cost of Delivered Messages',
      estimatedDeliveredCostNote:
        'This estimate is considered reliable 48 hours after the campaign is sent.',
      inactiveChannelNumbers: 'Inactive numbers for this channel',
      numAudience: 'Total',
      linkShortener: 'Link Shortener',
      cancelCampaign: 'Cancel Campaign',
      cancelCommentPlaceholder: 'Optional comment (max 500 chars)',
      cancel: 'Cancel campaign',
      cancelling: 'Cancelling...',
      cancelled: 'Campaign cancelled',
      cancelSuccess: 'Campaign cancelled successfully',
      cancelError: 'Failed to cancel campaign',
      cancelNotAllowed: 'Only campaigns waiting for approval can be cancelled',
      cancelConfirm: 'Are you sure you want to cancel this campaign?',
      exportReport: 'Export report',
      exportingReport: 'Exporting...',
      exportError: 'Failed to export campaign report',
      exportMissingCampaignUuid: 'Campaign UUID is required',
      exportInvalidCampaignUuid: 'Campaign UUID is invalid',
      exportUnauthorized: 'You are not authorized. Please log in again.',
      exportForbidden: 'You do not have access to export this campaign report.',
      exportNotFound: 'Campaign report was not found.',
      actionAtr: 'Campaign ATR',
      actionCount: 'Action count',
      eligibleDelivered: 'Eligible delivered',
      campaignAtr: 'Campaign ATR',
      exportClickReport: 'Download Campaign Audience Report',
      exportingClickReport: 'Preparing Campaign Audience Report...',
      clickReportError: 'Failed to download campaign click report.',
      clickReportNotFound: 'Campaign click report is not available.',
      clickReportTimeout:
        'The click report request timed out. Please try again.',
      clickReportNetworkError:
        'Network error while downloading the click report. Please check your connection and try again.',
      clickReportInvalidResponse:
        'The server returned an invalid click report response.',
    },
  },
  fa: {
    title: 'گزارش و تحلیل',
    campaignFilterPlaceholder: 'عنوان ارسال را وارد کنید',
    filterByBundle: 'عنوان کمپین',
    filterByCampaign: 'عنوان ارسال',
    filterByPhase: 'فاز',
    filterByPlatform: 'کانال ارسال',
    filterByStartDate: 'از تاریخ',
    filterByEndDate: 'تا تاریخ',
    bundleAll: 'همه کمپین‌ها',
    phaseAll: 'همه فازها',
    phaseTest: 'تست',
    phaseExecution: 'اجرا',
    bundleLoading: 'در حال بارگذاری کمپین‌ها...',
    platformAll: 'همه کانال‌ها',
    orderBy: 'مرتب‌سازی',
    startDatePlaceholder: 'انتخاب تاریخ شروع',
    endDatePlaceholder: 'انتخاب تاریخ پایان',
    loadMore: 'نمایش بیشتر',
    noMore: 'کمپین دیگری وجود ندارد',
    loading: 'در حال بارگذاری...',
    invalidDateRange: 'تاریخ شروع باید قبل از تاریخ پایان باشد.',
    platforms: {
      sms: 'پیامک',
      rubika: 'روبیکا',
      bale: 'بله',
      splus: 'سروش پلاس',
    },
    orderOptions: {
      newest: 'جدیدترین',
      oldest: 'قدیمی‌ترین',
      phaseTestFirst: 'فاز تست در ابتدا',
      phaseExecutionFirst: 'فاز اجرا در ابتدا',
      highestClickRate: 'بیشترین نرخ کلیک',
      lowestClickRate: 'کمترین نرخ کلیک',
    },
    bulkHide: {
      modeToggle: 'مخفی کردن ارسال‌ها',
      modeHint: '',
      selectionColumn: 'انتخاب',
      selectionCount: (count: number) => `${count} ارسال انتخاب شده`,
      button: 'مخفی کردن ارسال‌های انتخاب‌شده',
      submitting: 'در حال مخفی‌سازی...',
      confirm: (count: number) =>
        `آیا از مخفی کردن ${count} ارسال انتخاب‌شده از فهرست گزارش‌ها مطمئن هستید؟`,
      success: (count: number) => `${count} ارسال با موفقیت مخفی شد.`,
      errors: {
        emptySelection: 'حداقل یک ارسال را برای مخفی‌سازی انتخاب کنید.',
        fallback: 'مخفی‌سازی ارسال‌های انتخاب‌شده ناموفق بود.',
        unauthorized: 'احراز هویت ناموفق بود. لطفاً دوباره وارد شوید.',
      },
    },
    bulkUnhide: {
      modeToggle: 'نمایش مجدد ارسال‌ها',
      modeHint: '',
      selectionColumn: 'انتخاب',
      selectionCount: (count: number) => `${count} ارسال انتخاب شده`,
      button: 'نمایش مجدد ارسال‌های انتخاب‌شده',
      submitting: 'در حال بازیابی...',
      confirm: (count: number) =>
        `آیا از نمایش مجدد ${count} ارسال مخفی‌شده در فهرست گزارش‌ها مطمئن هستید؟`,
      success: (count: number) => `${count} ارسال با موفقیت بازیابی شد.`,
      errors: {
        emptySelection: 'حداقل یک ارسال را برای نمایش مجدد انتخاب کنید.',
        fallback: 'بازیابی ارسال‌های انتخاب‌شده ناموفق بود.',
        unauthorized: 'احراز هویت ناموفق بود. لطفاً دوباره وارد شوید.',
        notFound: 'یک یا چند ارسال یافت نشد.',
      },
    },
    bulkClickReport: {
      modeToggle: 'دانلود گزارش کلیک',
      modeHint:
        'ارسال‌های دارای لینک ضمیمه‌شده را برای دریافت یک گزارش یکپارچه انتخاب کنید.',
      selectionColumn: 'انتخاب',
      selectionCount: (count: number) => `${count} ارسال انتخاب شده`,
      button: 'دانلود گزارش مخاطبان ارسال',
      submitting: 'در حال آماده‌سازی گزارش کلیک...',
      success: 'دانلود گزارش کلیک آغاز شد.',
      ineligible:
        'گزارش کلیک فقط برای ارسال‌های دارای لینک ضمیمه‌شده در دسترس است.',
      errors: {
        emptySelection: 'حداقل یک ارسال دارای لینک را انتخاب کنید.',
        fallback: 'دانلود گزارش کلیک ارسال‌های انتخاب‌شده ناموفق بود.',
        unauthorized: 'احراز هویت ناموفق بود. لطفاً دوباره وارد شوید.',
        forbidden: 'شما دسترسی لازم برای دریافت این گزارش‌ها را ندارید.',
        invalidSelection:
          'ارسال‌های انتخاب‌شده نامعتبر هستند. لطفاً دوباره انتخاب کنید.',
        notFound: 'گزارش کلیک یک یا چند ارسال انتخاب‌شده در دسترس نیست.',
        tooLarge: 'گزارش کلیک انتخاب‌شده برای یک کاربرگ بیش از حد بزرگ است.',
        timeout:
          'مهلت دریافت گزارش کلیک به پایان رسید. لطفاً دوباره تلاش کنید.',
        network:
          'هنگام دانلود گزارش کلیک خطای شبکه رخ داد. اتصال خود را بررسی کرده و دوباره تلاش کنید.',
        invalidResponse: 'پاسخ سرور برای گزارش کلیک نامعتبر بود.',
      },
    },
    showHiddenCampaigns: {
      toggle: 'نمایش ارسال‌های مخفی',
      hint: 'ارسال‌هایی را که از فهرست گزارش‌ها مخفی شده‌اند نمایش دهید.',
    },
    table: {
      bundleTitle: 'عنوان کمپین',
      campaignTitle: 'عنوان ارسال',
      text: 'متن',
      lineNumber: 'سر شماره/سرویس',
      platform: 'کانال ارسال',
      segment: 'مخاطبان هدف',
      level3: 'مخاطبان هدف',
      aggregatedTotalSent: 'تعداد پیام‌های رسیده',
      clickRate: 'نرخ کلیک',
      status: 'وضعیت',
      numAudience: 'تعداد پیام های ارسالی',
      createdAt: 'ایجاد شده',
      scheduledAt: 'زمان‌بندی ارسال',
      details: 'جزئیات',
      subsegments: 'زیربخش‌ها',
      sex: 'جنسیت',
      cities: 'شهرها',
      adlink: 'لینک ضمیمه شده',
      updatedAt: 'به‌روزرسانی',
      actions: 'اقدامات',
      bundle: 'عنوان کمپین',
      phase: 'فاز ارسال',
    },
    statuses: {
      initiated: 'آغاز شده',
      'in-progress': 'در حال انجام',
      'waiting-for-approval': 'در انتظار تأیید',
      approved: 'تأیید شده',
      rejected: 'رد شده',
      running: 'در حال اجرا',
      cancelled: 'لغو شده',
      'cancelled-by-admin': 'لغو شده توسط ادمین',
      expired: 'منقضی شده',
      executed: 'اجرا شده',
    },
    clone: {
      button: 'کپی',
      confirm: 'با کپی، پیش‌نویس فعلی شما جایگزین می‌شود. ادامه می‌دهید؟',
      success: 'ارسال کپی شد. در حال بارگذاری پیش‌نویس...',
      error: 'کپی ارسال ناموفق بود.',
      notAllowed: 'این ارسال قابل کپی نیست.',
      modalTitle: 'ارسال کپی شد',
      modalBody:
        'ارسال شما کپی شد. با ورود به بخش مدیریت ارسال‌ها، پیش‌نویس جدید به صورت خودکار بارگذاری می‌شود.',
      close: 'بستن',
    },
    resume: {
      button: 'ادامه',
      confirm: 'این ارسال جایگزین پیش‌نویس فعلی می‌شود. ادامه می‌دهید؟',
      success: 'ارسال بارگذاری شد. در حال هدایت به ویرایش...',
      error: 'ادامه ارسال ناموفق بود.',
      notAllowed: 'امکان ادامه این ارسال وجود ندارد.',
    },
    modal: {
      details: 'جزئیات',
      rejected: 'رد شده',
      close: 'بستن',
      fixAndRestart: 'اصلاح و شروع مجدد کمپین؟',
      bundleSection: 'اطلاعات کمپین',
      bundleLoading: 'در حال بارگذاری جزئیات کمپین...',
      bundleObjective: 'هدف',
      bundlePersona: 'پرسونا مخاطبان هدف',
      bundleTargetCustomerName: 'نام مشتری',
      bundleCategory: 'دسته‌بندی',
      bundleJob: 'شغل',
      campaignSection: 'اطلاعات ارسال',
      segmentationSection: 'مخاطبان هدف',
      segmentationMethod: 'روش',
      segmentationMethodLevels: 'دسته‌بندی عادی',
      segmentationMethodSmartTargeting: 'هدف‌گیری هوشمند',
      segmentationMethodExcelFile: 'مخاطبان مشخص',
      selectedTagCount: 'تعداد برچسب‌های انتخاب‌شده',
      selectedRawCapacity: 'ظرفیت خام انتخاب‌شده',
      audienceGrades: 'کلاس امتیازی',
      excelFileUuid: 'شناسه فایل اکسل',
      platformSection: 'اطلاعات کانال ارسال',
      platformSettingsName: 'نام سرویس',
      platformBasePrice: 'قیمت پایه کانال',
      contentSection: 'اطلاعات متن',
      attachedMedia: 'فایل ضمیمه شده',
      mediaPreviewLoading: 'در حال بارگذاری پیش‌نمایش فایل...',
      mediaPreviewEmpty: 'فایلی ضمیمه نشده است',
      mediaPreviewFailed: 'بارگذاری پیش‌نمایش فایل ناموفق بود',
      shortLinkDomain: 'کوتاه‌کننده',
      budgetSection: 'بودجه',
      campaignCost: 'هزینه پیام‌های رسیده',
      refund: 'هزینه عودت شده',
      performanceSection: 'عملکرد',
      bundleTitle: 'عنوان کمپین',
      phase: 'فاز ارسال',
      lineNumber: 'سر شماره/سرویس',
      platform: 'کانال ارسال',
      subsegments: 'زیربخش‌ها',
      sex: 'جنسیت',
      cities: 'شهرها',
      adlink: 'لینک ضمیمه شده',
      scheduleAt: 'زمان‌بندی ارسال',
      updatedAt: 'به‌روزرسانی',
      level1: 'سطح ۱',
      level2: 'سطح ۲',
      level3: 'سطح ۳',
      level3v2: 'مخاطبان هدف',
      linePriceFactor: 'ضریب قیمت سرشماره',
      segmentPriceFactor: 'ضریب قیمت مخاطبان',
      pricing: 'قیمت و بودجه',
      budget: 'هزینه ارسال',
      comment: 'پیام ادمین',
      statistics: 'آمار',
      clickRate: 'نرخ کلیک (تعداد کلیک / تعداد پیام های رسیده)',
      totalClicks: 'تعداد کلیک',
      totalSentSuccessfully: 'تعداد پیام‌های رسیده',
      totalSentRecords: 'تعداد پیام‌های ارسالی',
      totalFailedRecords: 'تعداد پیام‌های خطا خورده',
      estimatedDeliveredCost: 'هزینه نهایی',
      estimatedDeliveredCostNote: 'این مقدار ۴۸ ساعت پس از ارسال معتبر است.',
      inactiveChannelNumbers: 'تعداد شماره‌های غیرفعال برای این کانال',
      numAudience: 'تعداد پیام های ارسالی',
      linkShortener: 'کوتاه کننده لینک',
      cancelCampaign: 'لغو',
      cancelCommentPlaceholder: 'توضیح اختیاری (حداکثر ۵۰۰ کاراکتر)',
      cancel: 'لغو',
      cancelling: 'در حال لغو...',
      cancelled: 'ارسال لغو شد',
      cancelSuccess: 'ارسال با موفقیت لغو شد',
      cancelError: 'لغو ارسال ناموفق بود',
      cancelNotAllowed: 'فقط ارسال‌های در انتظار تایید قابل لغو هستند',
      cancelConfirm: 'آیا از لغو این ارسال مطمئن هستید؟',
      exportReport: 'خروجی گزارش',
      exportingReport: 'در حال دریافت خروجی...',
      exportError: 'دریافت خروجی گزارش ارسال ناموفق بود',
      exportMissingCampaignUuid: 'شناسه ارسال الزامی است',
      exportInvalidCampaignUuid: 'شناسه ارسال نامعتبر است',
      exportUnauthorized: 'احراز هویت ناموفق بود. لطفا دوباره وارد شوید.',
      exportForbidden: 'شما دسترسی لازم برای دریافت خروجی این گزارش را ندارید.',
      exportNotFound: 'گزارش ارسال پیدا نشد.',
      actionAtr: 'ATR ارسال',
      actionCount: 'تعداد اقدام',
      eligibleDelivered: 'تحویل‌شده واجد شرایط',
      campaignAtr: 'ATR ارسال',
      exportClickReport: 'دانلود گزارش مخاطبان ارسال',
      exportingClickReport: 'در حال آماده‌سازی گزارش مخاطبان ارسال...',
      clickReportError: 'دانلود گزارش کلیک ارسال ناموفق بود.',
      clickReportNotFound: 'گزارش کلیک این ارسال در دسترس نیست.',
      clickReportTimeout:
        'مهلت دریافت گزارش کلیک به پایان رسید. لطفاً دوباره تلاش کنید.',
      clickReportNetworkError:
        'هنگام دانلود گزارش کلیک خطای شبکه رخ داد. اتصال خود را بررسی کرده و دوباره تلاش کنید.',
      clickReportInvalidResponse: 'پاسخ سرور برای گزارش کلیک نامعتبر بود.',
    },
  },
};

export type ReportsLocale = keyof typeof reportsTranslations;

export const getReportsCopy = (language: string): ReportsTranslations =>
  reportsTranslations[language as ReportsLocale] || reportsTranslations.en;

export type ReportsCopy = ReportsTranslations;
