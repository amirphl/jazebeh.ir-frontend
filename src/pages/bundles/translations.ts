export interface BundlesCopy {
  title: string;
  subtitle: string;
  create: string;
  breadcrumbs: {
    dashboard: string;
    bundles: string;
    create: string;
    detail: string;
  };
  filters: {
    titleLabel: string;
    titlePlaceholder: string;
    customerLabel: string;
    allCustomers: string;
    clear: string;
  };
  table: {
    title: string;
    customer: string;
    category: string;
    totalCampaigns: string;
    delivered: string;
    averageClickRate: string;
    actions: string;
    bundleId: string;
    empty: string;
  };
  actions: {
    view: string;
    reports: string;
    campaignsWithPhaseAsExecution: string;
    campaignsWithPhaseAsTest: string;
    new: string;
  };
  pagination: {
    previous: string;
    next: string;
    rowsPerPage: string;
    showing: string;
  };
  states: {
    loading: string;
    loadingDescription: string;
    retry: string;
    unknown: string;
    noClickRate: string;
  };
  messages: {
    listLoadFailed: string;
    createLoadFailed: string;
    detailLoadFailed: string;
    updateLoadFailed: string;
    actionTodo: string;
    creatingCampaignFromBundle: string;
    createSuccess: string;
    updateSuccessWarning: string;
    authRequired: string;
    missingBundleId: string;
    redirectingToReports: string;
  };
  createPage: {
    title: string;
    subtitle: string;
    back: string;
    sections: {
      bundleInfo: string;
      testCustomer: string;
    };
    optional: string;
    fields: {
      title: string;
      objective: string;
      persona: string;
      description: string;
      customerName: string;
      jobCategory: string;
      job: string;
    };
    placeholders: {
      title: string;
      objective: string;
      persona: string;
      description: string;
      customerName: string;
      jobCategory: string;
      job: string;
    };
    helper: {
      testCustomer: string;
    };
    actions: {
      cancel: string;
      save: string;
      saveAndCreateCampaign: string;
      update: string;
      updating: string;
      saving: string;
    };
    validation: {
      titleRequired: string;
      objectiveRequired: string;
      personaRequired: string;
      linkRequired: string;
      descriptionTooLong: string;
    };
  };
  detailPage: {
    titleFallback: string;
    back: string;
    sections: {
      overview: string;
      performance: string;
      link: string;
      quickAccess: string;
    };
    subtitles: {
      performance: string;
    };
    fields: {
      title: string;
      objective: string;
      persona: string;
      customerName: string;
      category: string;
      job: string;
      description: string;
      link: string;
      shortLinkDomain: string;
      trackingPlaceholder: string;
      linkTracking: string;
    };
    stats: {
      totalCampaigns: string;
      testCampaigns: string;
      executionCampaigns: string;
      totalSent: string;
      totalClicks: string;
    };
    actions: {
      edit: string;
      createCampaign: string;
      viewCampaignsWithPhaseAsTest: string;
      viewCampaignsWithPhaseAsExecution: string;
      createTestCampaign: string;
      createExecutionCampaign: string;
      viewTestReports: string;
      viewExecutionReports: string;
    };
    values: {
      enabled: string;
      disabled: string;
      notAvailable: string;
    };
    tagEvaluation: {
      title: string;
      description: string;
      evaluateButton: string;
      lastEvaluated: string;
      evaluatingNotice: string;
      staleNotice: string;
      evaluationError: string;
      statuses: {
        notEvaluated: string;
        evaluating: string;
        evaluated: string;
        updateRequired: string;
        error: string;
      };
      table: {
        tag: string;
        score: string;
        audience: string;
        fitLevel: string;
        relation: string;
        reason: string;
        empty: string;
      };
      pagination: {
        previous: string;
        next: string;
        rowsPerPage: string;
        showing: string;
      };
      messages: {
        requestAccepted: string;
        requestFailed: string;
        statusLoadFailed: string;
        scoresLoadFailed: string;
      };
    };
  };
}

const bundlesEn: BundlesCopy = {
  title: 'Bundles',
  subtitle: 'Review and manage all of your bundles.',
  create: 'Create new bundle',
  breadcrumbs: {
    dashboard: 'Dashboard',
    bundles: 'Bundles',
    create: 'Create new bundle',
    detail: 'Bundle details',
  },
  filters: {
    titleLabel: 'Filter by bundle title',
    titlePlaceholder: 'Search by bundle title...',
    customerLabel: 'Customer name',
    allCustomers: 'All customers',
    clear: 'Clear filters',
  },
  table: {
    title: 'Bundle title',
    customer: 'Customer name',
    category: 'Category',
    totalCampaigns: 'Total Campaigns',
    delivered: '#Delivered messages',
    averageClickRate: 'Average Click Rate',
    actions: 'Actions',
    bundleId: 'Bundle ID',
    empty: 'No bundles found.',
  },
  actions: {
    view: 'View',
    reports: 'Reports',
    campaignsWithPhaseAsExecution: 'Execution phase',
    campaignsWithPhaseAsTest: 'Test phase',
    new: 'New',
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    rowsPerPage: 'Rows per page',
    showing: 'Showing {from} to {to} of {total} bundles',
  },
  states: {
    loading: 'Loading bundles...',
    loadingDescription: 'Fetching the latest bundle list.',
    retry: 'Retry',
    unknown: 'Unknown',
    noClickRate: '-',
  },
  messages: {
    listLoadFailed: 'Failed to load bundles.',
    createLoadFailed: 'Failed to create the bundle.',
    detailLoadFailed: 'Failed to load bundle details.',
    updateLoadFailed: 'Failed to update the bundle.',
    actionTodo: 'TODO: implement bundle action behavior.',
    creatingCampaignFromBundle:
      'Opening a new campaign draft for this bundle...',
    createSuccess: 'Bundle created successfully.',
    updateSuccessWarning:
      'Warning: Editing campaign information may make previous delivery data suitable only for analytical reference. Please consider this in your analysis.',
    authRequired: 'Please sign in again to continue.',
    missingBundleId: 'Bundle ID is missing or invalid.',
    redirectingToReports: 'Redirecting to reports...',
  },
  createPage: {
    title: 'Create new bundle',
    subtitle: '',
    back: 'Back to bundles',
    sections: {
      bundleInfo: 'Bundle information',
      testCustomer: 'Test account customer information',
    },
    optional: 'Optional',
    fields: {
      title: 'Bundle title',
      objective: 'Bundle objective',
      persona: 'Audience persona',
      description: 'Additional description',
      customerName: 'Customer name',
      jobCategory: 'Main business category',
      job: 'Sub business category',
    },
    placeholders: {
      title: 'Enter the bundle title',
      objective: 'Summarize the bundle objective clearly',
      persona:
        'Describe your target audience traits such as age, gender, interests, and behavior',
      description: 'Enter any additional notes about this bundle',
      customerName: 'Enter customer name (optional)',
      jobCategory: 'Select main business category (optional)',
      job: 'Select sub business category (optional)',
    },
    helper: {
      testCustomer:
        'If you are creating a test bundle, enter the customer information below.',
    },
    actions: {
      cancel: 'Cancel',
      save: 'Save bundle',
      saveAndCreateCampaign: 'Save and create campaign',
      update: 'Update bundle',
      updating: 'Updating...',
      saving: 'Saving...',
    },
    validation: {
      titleRequired: 'Bundle title is required.',
      objectiveRequired: 'Bundle objective is required.',
      personaRequired: 'Audience persona is required.',
      linkRequired: 'Bundle link is required.',
      descriptionTooLong: 'Description must be at most 2000 characters.',
    },
  },
  detailPage: {
    titleFallback: 'Bundle details',
    back: 'Back to bundles',
    sections: {
      overview: 'Bundle information',
      performance: 'Bundle performance summary',
      link: 'Link details',
      quickAccess: 'Quick Access',
    },
    subtitles: {
      performance: 'Overview of all bundle campaigns performance.',
    },
    fields: {
      title: 'Bundle title',
      objective: 'Bundle objective',
      persona: 'Audience persona',
      customerName: 'Customer name',
      category: 'Main business category',
      job: 'Sub business category',
      description: 'Additional description',
      link: 'Bundle link',
      shortLinkDomain: 'Short link domain',
      trackingPlaceholder: 'Tracking placeholder',
      linkTracking: 'Link tracking',
    },
    stats: {
      totalCampaigns: 'Total campaigns',
      testCampaigns: 'Total campaigns (phase = Test)',
      executionCampaigns: 'Total campaigns (phase = Execution)',
      totalSent: 'Total delivered messages',
      totalClicks: 'Total clicks',
    },
    actions: {
      edit: 'Edit',
      createCampaign: 'Create campaign',
      viewCampaignsWithPhaseAsTest: 'View phase = Test',
      viewCampaignsWithPhaseAsExecution: 'View phase = Execution',
      createTestCampaign: 'New Test Campaign',
      createExecutionCampaign: 'New Execution Campaign',
      viewTestReports: 'Test Campaign Reports',
      viewExecutionReports: 'Execution Campaign Reports',
    },
    values: {
      enabled: 'Enabled',
      disabled: 'Disabled',
      notAvailable: 'Not available',
    },
    tagEvaluation: {
      title: 'Smart Tag Evaluation',
      description:
        'Evaluate available tags against this bundle’s target audience persona.',
      evaluateButton: 'Evaluate Tags',
      lastEvaluated: 'Last evaluated: {date}',
      evaluatingNotice:
        'Evaluation is running. The latest successful scores remain available below.',
      staleNotice:
        'The target audience persona has changed. These scores remain available until you evaluate again.',
      evaluationError: 'The latest evaluation failed.',
      statuses: {
        notEvaluated: 'Not Evaluated',
        evaluating: 'Evaluating',
        evaluated: 'Evaluated',
        updateRequired: 'Update Required',
        error: 'Error',
      },
      table: {
        tag: 'Tag',
        score: 'Bundle Fit Score',
        audience: 'Audience Count',
        fitLevel: 'Fit Level',
        relation: 'Relation',
        reason: 'Reason',
        empty: 'No evaluated tag scores are available yet.',
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        rowsPerPage: 'Rows per page',
        showing: 'Showing {from} to {to} of {total} tags',
      },
      messages: {
        requestAccepted: 'Tag evaluation started.',
        requestFailed: 'Failed to start tag evaluation.',
        statusLoadFailed: 'Failed to load the tag evaluation status.',
        scoresLoadFailed: 'Failed to load evaluated tag scores.',
      },
    },
  },
};

const bundlesFa: BundlesCopy = {
  title: 'کمپین‌ها',
  subtitle: 'تمام کمپین‌های خود را مدیریت و بررسی کنید.',
  create: 'ساخت کمپین جدید',
  breadcrumbs: {
    dashboard: 'پیشخوان',
    bundles: 'کمپین‌ها',
    create: 'ساخت کمپین جدید',
    detail: 'جزئیات کمپین',
  },
  filters: {
    titleLabel: 'فیلتر بر اساس عنوان کمپین',
    titlePlaceholder: 'جستجو بر اساس عنوان کمپین...',
    customerLabel: 'نام مشتری',
    allCustomers: 'همه مشتریان',
    clear: 'پاک کردن فیلترها',
  },
  table: {
    title: 'عنوان کمپین',
    customer: 'نام مشتری',
    category: 'دسته‌بندی شغلی',
    totalCampaigns: 'تعداد کل ارسال‌ها',
    delivered: 'تعداد پیام‌های رسیده',
    averageClickRate: 'میانگین نرخ کلیک',
    actions: 'اقدامات',
    bundleId: 'شناسه کمپین',
    empty: 'کمپین‌ای پیدا نشد.',
  },
  actions: {
    view: 'جزئیات',
    reports: 'گزارش و تحلیل',
    campaignsWithPhaseAsExecution: 'ارسال‌های اجرا',
    campaignsWithPhaseAsTest: 'ارسال‌های تست',
    new: 'ارسال جدید',
  },
  pagination: {
    previous: 'قبلی',
    next: 'بعدی',
    rowsPerPage: 'نمایش',
    showing: 'نمایش {from} تا {to} از {total} کمپین',
  },
  states: {
    loading: 'در حال بارگذاری کمپین‌ها...',
    loadingDescription: 'فهرست جدید کمپین‌ها در حال دریافت است.',
    retry: 'تلاش دوباره',
    unknown: 'نامشخص',
    noClickRate: '-',
  },
  messages: {
    listLoadFailed: 'دریافت کمپین‌ها ناموفق بود.',
    createLoadFailed: 'ایجاد کمپین ناموفق بود.',
    detailLoadFailed: 'دریافت جزئیات کمپین ناموفق بود.',
    updateLoadFailed: 'ویرایش کمپین ناموفق بود.',
    actionTodo: 'TODO: رفتار این اقدام بعداً پیاده‌سازی شود.',
    creatingCampaignFromBundle:
      'پیش‌نویس یک ارسال جدید بر اساس این کمپین در حال باز شدن است...',
    createSuccess: 'کمپین با موفقیت ایجاد شد.',
    updateSuccessWarning:
      'هشدار: ویرایش اطلاعات کمپین می‌تواند باعث شود فقط از لحاظ تحلیلی اطلاعات ارسال‌های پیشین قابل استناد نباشد. این نکته را در تحلیل‌های خود در نظر بگیرید',
    authRequired: 'برای ادامه لطفاً دوباره وارد شوید.',
    missingBundleId: 'شناسه کمپین موجود نیست یا نامعتبر است.',
    redirectingToReports: 'در حال هدایت به گزارش و تحلیل...',
  },
  createPage: {
    title: 'ساخت کمپین جدید',
    subtitle: '',
    back: 'بازگشت به کمپین‌ها',
    sections: {
      bundleInfo: 'اطلاعات کمپین',
      testCustomer: 'اطلاعات مشتری برای حساب آژانس',
    },
    optional: 'اختیاری',
    fields: {
      title: 'عنوان کمپین',
      objective: 'هدف کمپین',
      persona: 'پرسونای مخاطب هدف',
      description: 'توضیحات تکمیلی',
      customerName: 'نام مشتری',
      jobCategory: 'دسته‌بندی اصلی کسب‌وکار',
      job: 'زیر‌دسته فعالیت',
    },
    placeholders: {
      title: 'عنوان کمپین خود را وارد کنید',
      objective:
        'هدف کمپین خود را به صورت خلاصه و شفاف وارد کنید مثل ثبت‌نام اولیه در لندینگ محصول، نصب اپلیکیشن، ثبت‌نام در وبینار',
      persona:
        'این کمپین چه محصول یا خدمتی را ارائه می‌کند؟\n\nمخاطب مناسب این کمپین را با زبان خودتان توصیف کنید.\n\nچه نیاز یا مسئله‌ای باعث می‌شود این افراد به محصول یا خدمت نیاز داشته باشند؟\n\nچه رفتارهای مصرف یا استفاده قبلی می‌تواند نشانه مناسبی برای این مخاطب باشد؟\n\nچه رفتارها یا ویژگی‌های غیرمستقیمی می‌تواند احتمال مناسب‌بودن مخاطب را افزایش دهد؟\n\nچه افرادی یا چه شرایطی باعث می‌شوند یک مخاطب برای این کمپین نامناسب باشد؟',
      description: 'توضیحات و نکات تکمیلی در مورد این کمپین را وارد کنید',
      customerName: 'نام مشتری را وارد کنید (اختیاری)',
      jobCategory: 'دسته‌بندی اصلی کسب‌وکار را انتخاب کنید (اختیاری)',
      job: 'زیر‌دسته فعالیت کسب‌وکار را انتخاب کنید (اختیاری)',
    },
    helper: {
      testCustomer: 'در صورت تست کمپین برای مشتری، اطلاعات زیر را وارد کنید.',
    },
    actions: {
      cancel: 'انصراف',
      save: 'ذخیره کمپین',
      saveAndCreateCampaign: 'ذخیره و ساخت ارسال',
      update: 'ویرایش کمپین',
      updating: 'در حال ویرایش...',
      saving: 'در حال ذخیره...',
    },
    validation: {
      titleRequired: 'عنوان کمپین الزامی است.',
      objectiveRequired: 'هدف کمپین الزامی است.',
      personaRequired: 'پرسونای مخاطب هدف الزامی است.',
      linkRequired: 'لینک کمپین الزامی است.',
      descriptionTooLong: 'توضیحات باید حداکثر ۲۰۰۰ کاراکتر باشد.',
    },
  },
  detailPage: {
    titleFallback: 'جزئیات کمپین',
    back: 'بازگشت به کمپین‌ها',
    sections: {
      overview: 'اطلاعات کمپین',
      performance: 'خلاصه عملکرد کمپین',
      link: 'لندینگ هدف',
      quickAccess: 'دسترسی سریع',
    },
    subtitles: {
      performance: 'نمای کلی عملکرد همه ارسال‌های این کمپین.',
    },
    fields: {
      title: 'عنوان کمپین',
      objective: 'هدف کمپین',
      persona: 'پرسونای مخاطب هدف',
      customerName: 'نام مشتری (در حالت نمایندگی)',
      category: 'دسته‌بندی اصلی کسب‌وکار',
      job: 'زیر‌دسته فعالیت',
      description: 'توضیحات تکمیلی',
      link: 'لینک کمپین',
      shortLinkDomain: 'دامنه لینک کوتاه',
      trackingPlaceholder: 'شناسه رهگیری',
      linkTracking: 'رهگیری لینک',
    },
    stats: {
      totalCampaigns: 'تعداد کل ارسال‌ها',
      testCampaigns: 'تعداد ارسال‌های تست',
      executionCampaigns: 'تعداد ارسال‌های اجرا',
      totalSent: 'مجموع پیام‌های رسیده',
      totalClicks: 'مجموع کلیک‌ها',
    },
    actions: {
      edit: 'ویرایش',
      createCampaign: 'ارسال جدید',
      viewCampaignsWithPhaseAsTest: 'مشاهده ارسال‌های تست',
      viewCampaignsWithPhaseAsExecution: 'مشاهده ارسال‌های اجرا',
      createTestCampaign: 'ارسال تست جدید',
      createExecutionCampaign: 'ارسال اجرا جدید',
      viewTestReports: 'گزارش ارسال‌های تست',
      viewExecutionReports: 'گزارش ارسال‌های اجرا',
    },
    values: {
      enabled: 'فعال',
      disabled: 'غیرفعال',
      notAvailable: 'موجود نیست',
    },
    tagEvaluation: {
      title: 'ارزیابی هوشمند برچسب‌ها',
      description:
        'برچسب‌های موجود را با پرسونای مخاطب هدف این کمپین ارزیابی کنید.',
      evaluateButton: 'ارزیابی برچسب‌ها',
      lastEvaluated: 'آخرین ارزیابی: {date}',
      evaluatingNotice:
        'ارزیابی در حال انجام است. آخرین امتیازهای موفق در زیر و همچنین در قسمت هدف‌گیری هوشمند قابل مشاهده هستند.',
      staleNotice:
        'پرسونای مخاطب هدف تغییر کرده است. این امتیازها تا ارزیابی دوباره در دسترس می‌مانند.',
      evaluationError: 'آخرین ارزیابی ناموفق بود.',
      statuses: {
        notEvaluated: 'ارزیابی نشده',
        evaluating: 'در حال ارزیابی',
        evaluated: 'ارزیابی شده',
        updateRequired: 'نیازمند به‌روزرسانی',
        error: 'خطا',
      },
      table: {
        tag: 'برچسب',
        score: 'امتیاز تناسب کمپین',
        audience: 'تعداد مخاطب',
        fitLevel: 'سطح تناسب',
        relation: 'نوع ارتباط',
        reason: 'دلیل',
        empty: 'هنوز امتیازی برای برچسب‌ها موجود نیست.',
      },
      pagination: {
        previous: 'قبلی',
        next: 'بعدی',
        rowsPerPage: 'تعداد در صفحه',
        showing: 'نمایش {from} تا {to} از {total} برچسب',
      },
      messages: {
        requestAccepted: 'ارزیابی برچسب‌ها آغاز شد.',
        requestFailed: 'شروع ارزیابی برچسب‌ها ناموفق بود.',
        statusLoadFailed: 'دریافت وضعیت ارزیابی برچسب‌ها ناموفق بود.',
        scoresLoadFailed: 'دریافت امتیازهای برچسب‌ها ناموفق بود.',
      },
    },
  },
};

export const getBundlesCopy = (language: string): BundlesCopy =>
  language === 'fa' ? bundlesFa : bundlesEn;
