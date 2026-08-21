export const translations = {
  en: {
    // --- Admin (new) ---
    adminCommon: {
      backToSardis: 'Back to Sardis',
      sessionExpired: 'your session has expired, redirecting to login page.',
    },
    adminSardis: {
      title: 'Sardis (Admin)',
      subtitle: 'Admin landing page. Use the menu to navigate to sections.',
      cards: {
        lineNumbers: {
          description: 'Create, manage, update and report line numbers',
        },
        campaigns: {
          title: 'Campaigns',
          description: 'Admin campaign management',
        },
        customers: {
          title: 'Customer Management',
          description: 'Customers shares and performance report',
        },
        segmentPriceFactors: {
          title: 'Segment Price Factors',
          description: 'Manage Level 3 price factors',
        },
        shortLinks: {
          title: 'Short Link Management',
          description: 'Upload CSV to create short links',
        },
        platformSettings: {
          title: 'Platform Settings',
          description: 'Review and manage platform settings statuses',
        },
        payments: {
          title: 'Payments',
          description: 'Directly charge customer wallets',
        },
        support: {
          title: 'Tickets & Support',
          description: 'Manage and reply to customer tickets',
        },
      },
    },
    adminCustomers: {
      title: 'Customer Management',
      table: {
        headers: {
          customerName: 'Customer Name',
          representativeName: 'Representative Name',
          agencyName: 'Agency Name',
          totalSent: 'Total Sent',
          clickRate: 'Click Rate',
          agencyIncome: 'Agency Income',
          systemIncome: 'System Income',
          tax: 'Tax',
          details: 'Details',
          discounts: 'Discounts',
          toggle: 'Toggle',
        },
      },
      totals: {
        agencyIncome: 'Sum Agency Income',
        systemIncome: 'Sum System Income',
        tax: 'Sum Tax',
        totalSent: 'Sum Total Sent',
      },
      filters: {
        startDate: 'Start Date',
        endDate: 'End Date',
        apply: 'Apply',
      },
      actions: {
        view: 'View',
        show: 'Show',
      },
      detailsModal: {
        title: 'Customer Details',
        fields: {
          company: 'Company',
          representative: 'Representative',
          email: 'Email',
          mobile: 'Mobile',
          accountType: 'Account Type',
          uuid: 'UUID',
          id: 'ID',
          agencyRefererCode: 'Agency Referrer Code',
          accountTypeId: 'Account Type ID',
          nationalId: 'National ID',
          companyPhone: 'Company Phone',
          companyAddress: 'Company Address',
          postalCode: 'Postal Code',
          shebaNumber: 'Sheba Number',
          referrerAgencyId: 'Referrer Agency ID',
          representativeFirstName: 'Representative First Name',
          representativeLastName: 'Representative Last Name',
          isEmailVerified: 'Email Verified',
          isMobileVerified: 'Mobile Verified',
          isActive: 'Active',
          toggle: 'Toggle',
          createdAt: 'Created At',
          updatedAt: 'Updated At',
          emailVerifiedAt: 'Email Verified At',
          mobileVerifiedAt: 'Mobile Verified At',
          lastLoginAt: 'Last Login At',
        },
        campaignsTable: {
          titleSection: 'Campaigns',
          title: 'Title',
          created: 'Created',
          schedule: 'Schedule',
          status: 'Status',
          sent: 'Sent',
          delivered: 'Delivered',
          clickRate: 'Click Rate',
          noData: 'No data',
          details: 'Details',
        },
        errors: {
          noCustomerId: 'Customer id not available',
          loadFailed: 'Failed to retrieve customer details',
        },
      },
      campaignDetails: {
        title: 'Campaign Details',
        fields: {
          id: 'ID',
          uuid: 'UUID',
          status: 'Status',
          created: 'Created',
          updated: 'Updated',
          title: 'Title',
          segment: 'Segment',
          subsegment: 'Subsegment',
          sex: 'Sex',
          cities: 'Cities',
          adLink: 'Ad Link',
          content: 'Content',
          schedule: 'Schedule',
          lineNumber: 'Line Number',
          budget: 'Budget',
          comment: 'Comment',
          segmentPriceFactor: 'Segment Price Factor',
          lineNumberPriceFactor: 'Line Number Price Factor',
        },
      },
    },
    adminShortLinks: {
      title: 'Short Link Management',
      subtitle: 'Upload a CSV with long_link column to create short links',
      form: {
        domainLabel: 'Short link domain',
        fileLabel: 'CSV file',
        scenarioNameLabel: 'Scenario Name',
        scenarioNamePlaceholder: 'Enter a scenario name',
        selectPlaceholder: 'Select a domain',
        upload: 'Upload CSV',
        uploading: 'Uploading…',
      },
      domain: {
        jo1n: 'jo1n.ir',
        joinsahel: 'jzbe.ir',
      },
      messages: {
        success: 'Short links created successfully',
        uploadStarted: 'Short link upload started',
        completed: 'Short link upload completed',
        processingFailed: 'Short link upload failed',
        statusError: 'Unable to retrieve upload status',
        error: 'Failed to create short links',
        validationFileRequired: 'Please choose a CSV file',
        validationScenarioNameRequired: 'Please enter a scenario name',
      },
      result: {
        scenarioId: 'Scenario ID: {id}',
        jobStatus: 'Upload status: {status}',
        progress:
          'Created: {created}, skipped: {skipped}, published: {published} of {total}',
        attempts: 'Attempts: {count}',
        lastError: 'Error: {error}',
      },
      download: {
        title: 'Download Short Links by Scenario',
        scenarioIdLabel: 'Scenario ID',
        scenarioIdPlaceholder: 'Enter scenario ID',
        download: 'Download CSV',
        downloading: 'Downloading…',
        success: 'Download started',
        error: 'Failed to generate CSV',
      },
      downloadWithClicks: {
        title: 'Download Short Links with Clicks by Scenario',
        scenarioIdLabel: 'Scenario ID',
        scenarioIdPlaceholder: 'Enter scenario ID',
        download: 'Download CSV',
        downloading: 'Downloading…',
        success: 'Download started',
        error: 'Failed to generate CSV',
      },
      downloadWithClicksRange: {
        title: 'Download Short Links with Clicks by Scenario Range',
        scenarioFromLabel: 'Scenario From',
        scenarioFromPlaceholder: 'Enter starting scenario ID',
        scenarioToLabel: 'Scenario To (exclusive)',
        scenarioToPlaceholder: 'Enter ending scenario ID',
        download: 'Download CSV',
        downloading: 'Downloading…',
        success: 'Download started',
        error: 'Failed to generate CSV',
      },
      downloadByName: {
        title: 'Download Short Links With Clicks by Scenario Name',
        scenarioNameRegexLabel: 'Scenario Name Regex',
        scenarioNameRegexPlaceholder:
          'Enter scenario name regex (e.g., .*sahel_11.*)',
        download: 'Download Excel',
        downloading: 'Downloading…',
        success: 'Download started',
        error: 'Failed to generate Excel',
      },
    },
    adminLineNumbers: {
      managementTitle: 'Line Number Management',
      createNew: 'Create New Line Number',
      createTitle: 'Create Line Number',
      fields: {
        nameOptional: 'Name (optional)',
        lineNumber: 'Line Number',
        priceFactor: 'Price Factor',
        priorityOptional: 'Priority (optional)',
        active: 'Active',
      },
      columns: {
        row: '#',
        lineNumber: 'Line Number',
        priority: 'Priority',
        priceFactor: 'Price Factor',
        active: 'Active',
      },
      noItems: 'No items',
      confirmTitle: 'Confirm Create Line Number',
      confirm: {
        name: 'Name',
        lineNumber: 'Line Number',
        priceFactor: 'Price Factor',
        priority: 'Priority',
        active: 'Active',
      },
    },
    adminCampaigns: {
      title: 'Admin Campaigns',
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
          in_progress: 'In Progress',
          waiting_for_approval: 'Waiting for Approval',
          approved: 'Approved',
          rejected: 'Rejected',
        },
      },
      table: {
        noData: 'No campaigns found',
        headers: {
          row: '#',
          uuid: 'UUID',
          status: 'Status',
          createdAt: 'Created At',
          updatedAt: 'Updated At',
          title: 'Title',
          segment: 'Segment',
          subsegment: 'Subsegment',
          sex: 'Sex',
          city: 'City',
          adLink: 'Ad Link',
          content: 'Content',
          scheduleAt: 'Schedule At',
          lineNumber: 'Line Number',
          budget: 'Budget',
          comment: 'Comment',
          actions: 'Actions',
        },
      },
      modal: {
        approveTitle: 'Approve Campaign',
        rejectTitle: 'Reject Campaign',
        uuid: 'UUID',
        title: 'Title',
        currentStatus: 'Current Status',
        commentLabelOptional: 'Comment (optional)',
        commentLabelRequired: 'Comment (required)',
        maxChars: 'Max 1000 chars',
        cancel: 'Cancel',
        approve: 'Approve',
        reject: 'Reject',
        submitting: 'Submitting…',
      },
      errors: {
        listFailed: 'Failed to list campaigns',
        approveFailed: 'Approve failed',
        rejectFailed: 'Reject failed',
        missingNumericId: 'Campaign numeric id not available',
      },
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      subtitle:
        'Manage your SMS marketing campaigns and track your performance',
      accountTypeLabel: 'Account Type',
      companyNameLabel: 'Company Name',
      emailAddressLabel: 'Email Address',
      language: 'Language',
      logout: 'Logout',
      support: 'Ticket and Support',
      supportIntro: 'Open a ticket to contact our support team.',
      supportModal: {
        newTicket: 'New Ticket',
        title: 'Create New Support Ticket',
        titleLabel: 'Title (optional)',
        contentLabel: 'Content',
        fileLabel: 'Attachment (optional)',
        titlePlaceholder: 'Enter a short title (<= 80 chars)',
        contentPlaceholder: 'Describe your request (<= 1000 chars)',
        fields: {
          ticketTitle: 'Title (optional, max 80)',
          description: 'Description',
          attachment: 'Attachment (optional)',
          attachmentHelp: 'jpg, png, pdf, docx, xlsx, zip — up to 10 MB',
        },
        ticketSectionTitle: 'Ticket Details',
        metadataTitle: 'Metadata',
        messageTitle: 'Message',
        createdAtLabel: 'Created at',
        adminReply: 'Admin Reply',
        attachments: 'Attachments',
        downloadAttachment: 'Download attachment',
        noAttachments: 'No attachments',
        downloadError: 'Failed to download attachment. Please try again.',
        downloadTimeout: 'Attachment download timed out. Please try again.',
        placeholders: {
          ticketTitle: 'Enter a brief title (max 80 characters)',
          description: 'Describe your issue or request (max 1000 characters)',
        },
        validation: {
          titleMax: 'Title must be at most 80 characters',
          descriptionRequired: 'Description is required',
          descriptionMax: 'Description must be at most 1000 characters',
          invalidType:
            'Invalid file type. Allowed: jpg, png, pdf, docx, xlsx, zip',
          maxSize: 'File size must be less than 10 MB',
        },
        replyTitle: 'Reply to Ticket',
        submit: 'Submit Ticket',
        success: 'Your ticket has been created successfully',
        error: 'Failed to create ticket. Please try again.',
      },

      // Filters
      filterTitlePlaceholder: 'Filter by title...',
      // Sort controls
      sortBy: 'Sort by',
      sortNewest: 'Newest',
      sortOldest: 'Oldest',

      // Sidebar Navigation
      dashboard: 'Dashboard',
      bundles: 'Bundles',
      targetedSend: 'targeted send',
      reports: 'Reports',
      wallet: 'Wallet and Charge',
      settings: 'Settings',
      customerManagement: 'Customer Management',
      discountManagement: 'Discount Management',
      customerDiscountManagement: 'Customer & Discount Management',

      // Stats
      stats: {
        totalCampaigns: 'Total Campaigns',
        totalCustomers: 'Total Customers',
        walletBalance: 'Wallet Balance',
        activeTickets: 'Active Tickets',
      },

      // Content
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
      reportsTable: {
        row: '#',
        title: 'Title',
        text: 'Text',
        lineNumber: 'Line Number',
        segment: 'Segment',
        sent: 'Sent',
        status: 'Status',
        total: 'Total',
        createdAt: 'Created At',
        scheduleAt: 'Schedule At',
        details: 'Details',
        subsegments: 'Subsegments',
        sex: 'Sex',
        cities: 'Cities',
        adlink: 'Ad Link',
        updatedAt: 'Updated At',
      },
      reportsStatus: {
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
      fixAndRestart: 'Fix and restart the campaign?',
      supportHistory: 'Tickets History',
      profile: {
        profile: 'Profile',
        fields: {
          email: 'Email',
          name: 'Name',
          accountType: 'Account Type',
          companyName: 'Company Name',
          status: 'Status',
          category: 'Category',
          job: 'Job',
          agencyRefererCode: 'Agency Referrer Code',
          parentAgency: 'Parent Agency',
        },
      },
      campaignStats: {
        campaignsSummary: 'Campaigns Summary',
        approved: 'Approved',
        running: 'Running',
        total: 'Total',
      },
      pricingCalculation: {
        openButton: 'Open Pricing Table',
        modalTitle: 'Pricing Calculation Table',
        modalSubtitle:
          'Adjust factors and prices to estimate total cost per platform.',
        close: 'Close',
        loading: 'Loading pricing data...',
        loadFailed: 'Failed to load pricing data',
        errors: {
          basePriceListFailed: 'Failed to list platform base prices',
          pagePriceListFailed: 'Failed to get page prices',
          unauthorized: 'Unauthorized - Please log in again',
          network: 'Network error, please try again',
          generic: 'Failed to load pricing data',
        },
        platformLabels: {
          sms: 'SMS',
          rubika: 'Rubika',
          bale: 'Bale',
          splus: 'Soroush Plus',
        },
        columns: {
          platform: 'Platform',
          segmentPriceFactor: 'Segment Price Factor',
          numPages: 'Number of Pages',
          platformBasePrice: 'Platform Base Price',
          lineNumberPriceFactor: 'Line Number Price Factor',
          pagePrice: 'Page Price',
          totalCost: 'Total Cost',
        },
        formula: {
          title: 'Calculation Formula',
          sms: 'SMS: Total Cost = (Line Number Price Factor × Number of Pages × Platform Base Price) + (Segment Price Factor × Page Price)',
          others:
            'Other platforms: Total Cost = Platform Base Price + (Segment Price Factor × Page Price)',
          note: 'For non-SMS platforms, page count and line number multiplier are fixed at 1 in this calculation.',
        },
      },
    },

    // Campaign Creation
    campaign: {
      title: 'Create SMS Campaign',
      subtitle: 'Create a targeted SMS campaign in 4 simple steps',

      // Steps
      step1: 'Segment',
      step2: 'Content',
      step3: 'Budget',
      step4: 'Payment',

      // Steps structure for StepHeader components
      steps: {
        segment: {
          title: 'Define Your Target Segment',
          subtitle: 'Select the criteria for your target audience',
        },
        budget: {
          title: 'Set Your Budget',
          subtitle: 'Define the financial parameters for your campaign',
        },
      },

      // Navigation
      nextPage: 'Next Page',
      previousPage: 'Previous Page',
      finish: 'Finish',

      // Confirmation Modal
      confirmTitle: 'Are you sure?',
      confirmMessage: 'Do you want to finish creating this campaign?',
      yes: 'Yes',
      no: 'No',

      // Loading
      creating: 'Creating campaign...',
      pleaseWait: 'Please wait while we create your campaign.',

      // Success
      success: 'Campaign created successfully!',
      redirecting: 'Redirecting to dashboard...',

      // Errors
      error: 'Failed to create campaign',
      tryAgain: 'Please try again.',
      errors: {
        scheduleTimeTooSoon:
          'Schedule time must be at least 10 minutes in the future. Go back to Step 2 to set a valid schedule time.',
        invalidScheduleTime:
          'Schedule time is invalid. Go back to Step 2 to set a valid schedule time.',
      },
    },

    // Home Page
    home: {
      hero: {
        badge: 'Consulting and Data-Driven Technology',
        title: 'Transform Your Business with Targeted SMS Marketing',
        subtitle:
          'Reach your customers with precision, drive engagement, and boost conversions with our advanced Data-Driven Technology designed for modern businesses.',
        cta: 'Get Started Free',
        signin: 'Sign In',
      },
      stats: {
        customers: 'Happy Customers',
        messages: 'Messages Sent',
        delivery: 'Delivery Rate',
        support: 'Customer Support',
      },
      features: {
        title: 'Why Choose Our Platform?',
        subtitle:
          'Powerful features designed to help you succeed in SMS marketing',
        targeted: {
          title: 'Targeted Campaigns',
          description:
            'Create highly targeted SMS campaigns based on customer behavior, demographics, and preferences.',
        },
        segmentation: {
          title: 'Smart Segmentation',
          description:
            'Segment your audience intelligently and send personalized messages that resonate.',
        },
        analytics: {
          title: 'Real-time Analytics',
          description:
            'Track campaign performance with detailed analytics and actionable insights.',
        },
        compliance: {
          title: 'Regulatory Compliance',
          description:
            'Built-in compliance features ensure your campaigns meet all regulatory requirements.',
        },
      },
      howItWorks: {
        title: 'How It Works',
        subtitle: 'Get started with SMS marketing in three simple steps',
        step1: {
          title: 'Create Your Account',
          description:
            'Sign up and set up your business profile in minutes with our streamlined onboarding process.',
        },
        step2: {
          title: 'Design Your Campaign',
          description:
            'Use our intuitive tools to create compelling SMS campaigns with advanced targeting options.',
        },
        step3: {
          title: 'Send & Track Results',
          description:
            'Launch your campaigns and monitor real-time performance with comprehensive analytics.',
        },
      },
      cta: {
        title: 'Ready to Get Started?',
        subtitle:
          'Join thousands of businesses already using our platform to grow their customer base.',
        button: 'Start Your Free Trial',
      },
    },

    // Error Boundary
    error: {
      title: 'Something went wrong',
      message: 'Sorry, something went wrong. Please refresh the page.',
      refresh: 'Refresh Page',
    },

    // Common
    common: {
      loading: 'Loading...',
      required: '*',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      back: 'Back',
      previous: 'Previous',
      next: 'Next',
      submit: 'Submit',
      resend: 'Resend',
      seconds: 's',
      finish: 'Finish',
      finish2: 'Final Confirmation',
      continue: 'Continue',
      yes: 'Yes',
      no: 'No',
      comingSoon: 'Coming soon',
      details: 'Details',
      reply: 'Reply',
      active: 'Active',
      inactive: 'Inactive',
    },

    // Support (Customer)
    supportPage: {
      title: 'Ticket & Support',
      intro: 'Open a ticket to contact our support team.',
      create: 'Create Ticket',
      history: 'Tickets History',
      modal: {
        title: 'Create Support Ticket',
        submit: 'Submit',
        titleLabel: 'Title (optional)',
        titlePlaceholder: 'Enter a short title (<= 80 chars)',
        contentLabel: 'Content',
        contentPlaceholder: 'Describe your request (<= 1000 chars)',
        fileLabel: 'Attachment (optional)',
        success: 'Ticket created successfully',
      },
      table: {
        row: 'Row',
        title: 'Title',
        content: 'Content',
        createdAt: 'Created At',
        details: 'Details',
        noRecords: 'No records',
      },
    },

    // Admin Tickets
    adminTickets: {
      title: 'Admin Tickets & Support',
    },

    // Pricing
    pricing: {
      title: 'Pricing',
      subtitle: 'Simple, transparent pricing that grows with you',
      intro: {
        title: 'How Pricing Works',
        description:
          "To use Jadhbe's features, you need to top up your account. By charging your digital wallet, you can access all Jadhbe services including landing page design and optimization, marketing lead tracking, customer journey analysis, and marketing automation. The cost of each service is calculated based on usage volume (number of active campaigns, number of processed segments, and analytical features), and the legal tax (10%) is transparently deducted from your charge. By purchasing more credit, you will also benefit from discounts on Basic, Pro, and Enterprise plans.",
        payAsYouGo: {
          title: 'Pay As You Go',
          description: 'Charged based on actual usage',
        },
        transparent: {
          title: 'Transparent Fees',
          description: '10% tax included in all transactions',
        },
        volume: {
          title: 'Volume Discounts',
          description: 'Save more with higher credit purchases',
        },
      },
      plans: {
        title: 'Choose Your Plan',
        popular: 'Popular',
        getStarted: 'Get Started',
        basic: {
          name: 'Basic',
          description: 'Perfect for small businesses getting started',
          discount: '5% discount',
          features: {
            campaigns: 'Up to 10 active campaigns',
            segments: 'Basic segmentation',
            analytics: 'Standard analytics',
            support: 'Email support',
          },
        },
        pro: {
          name: 'Pro',
          description: 'For growing businesses with advanced needs',
          discount: '10% discount',
          features: {
            campaigns: 'Up to 50 active campaigns',
            segments: 'Advanced segmentation',
            analytics: 'Advanced analytics & tracking',
            automation: 'Marketing automation',
            support: 'Priority support',
          },
        },
        enterprise: {
          name: 'Enterprise',
          description: 'Custom solutions for large organizations',
          discount: '15% discount',
          features: {
            campaigns: 'Unlimited campaigns',
            segments: 'Custom segmentation',
            analytics: 'Enterprise analytics',
            automation: 'Full automation suite',
            support: 'Dedicated account manager',
            custom: 'Custom integrations',
          },
        },
      },
      cta: {
        title: 'Ready to get started?',
        description: 'Create your account today and start your first campaign',
        signup: 'Sign Up Now',
        contact: 'Contact Sales',
      },
    },
  },

  fa: {
    // --- Admin (new) ---
    adminCommon: {
      backToSardis: 'بازگشت به ساردیس',
      sessionExpired: 'نشست شما منقضی شده است، در حال انتقال به صفحه ورود.',
    },
    adminSardis: {
      title: 'ساردیس (مدیریت ادمین)',
      subtitle:
        'صفحه اصلی مدیریت ادمین. از منو برای دسترسی به بخش‌ها استفاده کنید.',
      cards: {
        lineNumbers: {
          description: 'ایجاد، مدیریت، بروزرسانی و گزارش شماره‌های خط',
        },
        campaigns: {
          title: 'ارسال‌ها',
          description: 'مدیریت ارسال‌های ادمین',
        },
        customers: {
          title: 'مدیریت مشتریان',
          description: 'گزارش سهم‌ها و عملکرد مشتریان',
        },
        segmentPriceFactors: {
          title: 'ضریب قیمت سگمنت',
          description: 'مدیریت ضرایب قیمت سطح ۳',
        },
        shortLinks: {
          title: 'مدیریت لینک کوتاه',
          description: 'آپلود CSV برای ساخت لینک‌های کوتاه',
        },
        platformSettings: {
          title: 'تنظیمات کانال‌ها',
          description: 'مشاهده و مدیریت تنظیمات کانال‌ها',
        },
        payments: {
          title: 'پرداخت',
          description: 'شارژ مستقیم کیف پول مشتریان',
        },
        support: {
          title: 'پشتیبانی',
          description: 'مدیریت و پاسخ به تیکت‌های مشتریان',
        },
      },
    },
    adminCustomers: {
      title: 'مدیریت مشتریان',
      table: {
        headers: {
          customerName: 'نام مشتری',
          representativeName: 'نام نماینده',
          agencyName: 'نام آژانس',
          totalSent: 'تعداد ارسال',
          toggle: 'تغییر وضعیت',
          clickRate: 'نرخ کلیک',
          agencyIncome: 'درآمد آژانس',
          systemIncome: 'درآمد ما (سیستم)',
          tax: 'مالیات',
          details: 'جزئیات',
          discounts: 'شارژهای هدیه',
        },
      },
      totals: {
        agencyIncome: 'مجموع درآمد آژانس',
        systemIncome: 'مجموع درآمد ما (سیستم)',
        tax: 'مجموع مالیات',
        totalSent: 'مجموع کل ارسال',
      },
      filters: {
        startDate: 'تاریخ شروع',
        endDate: 'تاریخ پایان',
        apply: 'اعمال',
      },
      actions: {
        view: 'مشاهده',
        show: 'نمایش',
      },
      detailsModal: {
        title: 'جزئیات مشتری',
        fields: {
          company: 'نام شرکت',
          representative: 'نماینده',
          email: 'ایمیل',
          mobile: 'موبایل',
          accountType: 'نوع حساب',
          uuid: 'UUID',
          id: 'شناسه',
          agencyRefererCode: 'کد معرف آژانس',
          accountTypeId: 'شناسه نوع حساب',
          nationalId: 'شناسه ملی',
          companyPhone: 'تلفن شرکت',
          companyAddress: 'آدرس شرکت',
          postalCode: 'کدپستی',
          shebaNumber: 'شماره شبا',
          referrerAgencyId: 'شناسه آژانس معرف',
          representativeFirstName: 'نام نماینده',
          representativeLastName: 'نام خانوادگی نماینده',
          isEmailVerified: 'ایمیل تأیید شده',
          isMobileVerified: 'موبایل تأیید شده',
          isActive: 'فعال',
          toggle: 'تغییر وضعیت',
          createdAt: 'ایجاد شده در',
          updatedAt: 'به‌روزرسانی در',
          emailVerifiedAt: 'زمان تأیید ایمیل',
          mobileVerifiedAt: 'زمان تأیید موبایل',
          lastLoginAt: 'آخرین ورود',
        },
        campaignsTable: {
          titleSection: 'ارسال‌ها',
          title: 'عنوان',
          created: 'ایجاد',
          schedule: 'زمان‌بندی',
          status: 'وضعیت',
          sent: 'ارسال',
          delivered: 'تحویل',
          clickRate: 'نرخ کلیک',
          noData: 'داده‌ای موجود نیست',
          details: 'جزئیات',
        },
        errors: {
          noCustomerId: 'شناسه مشتری در دسترس نیست',
          loadFailed: 'دریافت جزئیات مشتری ناموفق بود',
        },
      },
      campaignDetails: {
        title: 'جزئیات کمپین',
        fields: {
          id: 'شناسه',
          uuid: 'UUID',
          status: 'وضعیت',
          created: 'ایجاد شده',
          updated: 'به‌روزرسانی',
          title: 'عنوان',
          segment: 'بخش',
          subsegment: 'زیربخش',
          sex: 'جنسیت',
          cities: 'شهرها',
          adLink: 'لینک تبلیغ',
          content: 'محتوا',
          schedule: 'زمان‌بندی',
          lineNumber: 'سرشماره',
          budget: 'بودجه',
          comment: 'توضیح',
          segmentPriceFactor: 'ضریب قیمت بخش',
          lineNumberPriceFactor: 'ضریب قیمت سرشماره',
        },
      },
    },
    adminShortLinks: {
      title: 'مدیریت لینک کوتاه',
      subtitle: 'فایل CSV با ستون long_link را آپلود کنید',
      form: {
        domainLabel: 'دامنه لینک کوتاه',
        fileLabel: 'فایل CSV',
        scenarioNameLabel: 'نام سناریو',
        scenarioNamePlaceholder: 'نام سناریو را وارد کنید',
        selectPlaceholder: 'انتخاب دامنه',
        upload: 'آپلود CSV',
        uploading: 'در حال آپلود…',
      },
      domain: {
        jo1n: 'jo1n.ir',
        joinsahel: 'jzbe.ir',
      },
      messages: {
        success: 'لینک‌های کوتاه با موفقیت ایجاد شد',
        uploadStarted: 'آپلود لینک‌های کوتاه آغاز شد',
        completed: 'آپلود لینک‌های کوتاه تکمیل شد',
        processingFailed: 'آپلود لینک‌های کوتاه ناموفق بود',
        statusError: 'دریافت وضعیت آپلود ممکن نیست',
        error: 'ایجاد لینک‌های کوتاه ناموفق بود',
        validationFileRequired: 'لطفاً فایل CSV را انتخاب کنید',
        validationScenarioNameRequired: 'لطفاً نام سناریو را وارد کنید',
      },
      result: {
        scenarioId: 'شناسه سناریو: {id}',
        jobStatus: 'وضعیت آپلود: {status}',
        progress:
          'ایجادشده: {created}، ردشده: {skipped}، منتشرشده: {published} از {total}',
        attempts: 'تعداد تلاش‌ها: {count}',
        lastError: 'خطا: {error}',
      },
      download: {
        title: 'دانلود لینک‌های کوتاه بر اساس سناریو',
        scenarioIdLabel: 'شناسه سناریو',
        scenarioIdPlaceholder: 'شناسه سناریو را وارد کنید',
        download: 'دانلود CSV',
        downloading: 'در حال دانلود…',
        success: 'دانلود آغاز شد',
        error: 'تولید CSV ناموفق بود',
      },
      downloadWithClicks: {
        title: 'دانلود لینک‌های کوتاه دارای کلیک بر اساس سناریو',
        scenarioIdLabel: 'شناسه سناریو',
        scenarioIdPlaceholder: 'شناسه سناریو را وارد کنید',
        download: 'دانلود CSV',
        downloading: 'در حال دانلود…',
        success: 'دانلود آغاز شد',
        error: 'تولید CSV ناموفق بود',
      },
      downloadWithClicksRange: {
        title: 'دانلود لینک‌های کوتاه دارای کلیک بر اساس بازه سناریو',
        scenarioFromLabel: 'شناسه سناریو از',
        scenarioFromPlaceholder: 'شناسه سناریوی شروع را وارد کنید',
        scenarioToLabel: 'شناسه سناریو تا (انحصاری)',
        scenarioToPlaceholder: 'شناسه سناریوی پایان را وارد کنید',
        download: 'دانلود CSV',
        downloading: 'در حال دانلود…',
        success: 'دانلود آغاز شد',
        error: 'تولید CSV ناموفق بود',
      },
      downloadByName: {
        title: 'دانلود لینک‌های کوتاه دارای کلیک بر اساس نام سناریو',
        scenarioNameRegexLabel: 'عبارت منظم نام سناریو',
        scenarioNameRegexPlaceholder:
          'عبارت منظم نام سناریو را وارد کنید (مثلاً .*sahel_11.*)',
        download: 'دانلود اکسل',
        downloading: 'در حال دانلود…',
        success: 'دانلود آغاز شد',
        error: 'تولید فایل اکسل ناموفق بود',
      },
    },
    adminLineNumbers: {
      managementTitle: 'مدیریت سرشماره‌ها',
      createNew: 'ایجاد سرشماره جدید',
      createTitle: 'ایجاد سرشماره',
      fields: {
        nameOptional: 'نام (اختیاری)',
        lineNumber: 'سرشماره',
        priceFactor: 'ضریب قیمت',
        priorityOptional: 'اولویت (اختیاری)',
        active: 'فعال',
      },
      columns: {
        row: '#',
        lineNumber: 'سرشماره',
        priority: 'اولویت',
        priceFactor: 'ضریب قیمت',
        active: 'فعال',
      },
      noItems: 'آیتمی وجود ندارد',
      confirmTitle: 'تأیید ایجاد سرشماره',
      confirm: {
        name: 'نام',
        lineNumber: 'سرشماره',
        priceFactor: 'ضریب قیمت',
        priority: 'اولویت',
        active: 'فعال',
      },
    },
    adminCampaigns: {
      title: 'ارسال‌های ادمین',
      filters: {
        titleLabel: 'عنوان',
        titlePlaceholder: 'جستجو بر اساس عنوان',
        statusLabel: 'وضعیت',
        startDateLabel: 'تاریخ شروع',
        endDateLabel: 'تاریخ پایان',
        apply: 'اعمال',
        all: 'همه',
        statuses: {
          initiated: 'آغاز شده',
          in_progress: 'در حال انجام',
          waiting_for_approval: 'در انتظار تأیید',
          approved: 'تأیید شده',
          rejected: 'رد شده',
        },
      },
      table: {
        noData: 'کمپینی یافت نشد',
        headers: {
          row: '#',
          uuid: 'UUID',
          status: 'وضعیت',
          createdAt: 'ایجاد شده در',
          updatedAt: 'به‌روزرسانی در',
          title: 'عنوان',
          segment: 'بخش',
          subsegment: 'زیر‌بخش',
          sex: 'جنسیت',
          city: 'شهر',
          adLink: 'لینک تبلیغ',
          content: 'محتوا',
          scheduleAt: 'زمان‌بندی',
          lineNumber: 'سرشماره',
          budget: 'بودجه',
          comment: 'توضیح',
          actions: 'اقدامات',
        },
      },
      modal: {
        approveTitle: 'تأیید کمپین',
        rejectTitle: 'رد کمپین',
        uuid: 'UUID',
        title: 'عنوان',
        currentStatus: 'وضعیت فعلی',
        commentLabelOptional: 'توضیح (اختیاری)',
        commentLabelRequired: 'توضیح (الزامی)',
        maxChars: 'حداکثر ۱۰۰۰ کاراکتر',
        cancel: 'انصراف',
        approve: 'تأیید',
        reject: 'رد',
        submitting: 'در حال ارسال…',
      },
      errors: {
        listFailed: 'دریافت فهرست ارسال‌ها ناموفق بود',
        approveFailed: 'تأیید ناموفق بود',
        rejectFailed: 'رد ناموفق بود',
        missingNumericId: 'شناسه عددی کمپین در دسترس نیست',
      },
    },
    // Dashboard
    dashboard: {
      title: 'پیشخوان',
      welcome: 'به جاذبه خوش‌آمدید',
      subtitle:
        'ارسال‌های هوشمند و داده‌محور خود را مدیریت کنید و عملکرد خود را پیگیری کنید',
      accountTypeLabel: 'نوع حساب کاربری',
      companyNameLabel: 'نام شرکت',
      emailAddressLabel: 'آدرس ایمیل',
      language: 'زبان',
      logout: 'خروج',
      support: 'پشتیبانی',
      supportIntro: 'برای ارتباط با پشتیبانی، یک تیکت ثبت کنید.',
      supportModal: {
        newTicket: 'تیکت جدید',
        title: 'ایجاد تیکت جدید',
        titleLabel: 'عنوان (اختیاری)',
        contentLabel: 'متن تیکت',
        fileLabel: 'ضمیمه (اختیاری)',
        titlePlaceholder: 'یک عنوان کوتاه وارد کنید (حداکثر ۸۰ کاراکتر)',
        contentPlaceholder: 'درخواست خود را توضیح دهید (حداکثر ۱۰۰۰ کاراکتر)',
        fields: {
          ticketTitle: 'عنوان (اختیاری، حداکثر ۸۰)',
          description: 'توضیحات',
          attachment: 'ضمیمه (اختیاری)',
          attachmentHelp: 'jpg, png, pdf, docx, xlsx, zip — تا ۱۰ مگابایت',
        },
        ticketSectionTitle: 'جزئیات تیکت',
        metadataTitle: 'اطلاعات',
        messageTitle: 'متن',
        createdAtLabel: 'زمان ثبت',
        adminReply: 'پاسخ ادمین',
        attachments: 'ضمیمه‌ها',
        downloadAttachment: 'دانلود ضمیمه',
        noAttachments: 'ضمیمه‌ای وجود ندارد',
        downloadError: 'دانلود ضمیمه ناموفق بود. لطفاً دوباره تلاش کنید.',
        downloadTimeout: 'دانلود ضمیمه زمان‌بر شد. لطفاً دوباره تلاش کنید.',
        placeholders: {
          ticketTitle: 'یک عنوان کوتاه وارد کنید (حداکثر ۸۰ کاراکتر)',
          description:
            'مشکل یا درخواست خود را توضیح دهید (حداکثر ۱۰۰۰ کاراکتر)',
        },
        validation: {
          titleMax: 'عنوان باید حداکثر ۸۰ کاراکتر باشد',
          descriptionRequired: 'متن تیکت الزامی است',
          descriptionMax: 'متن تیکت باید حداکثر ۱۰۰۰ کاراکتر باشد',
          invalidType:
            'نوع فایل نامعتبر است. فرمت‌های مجاز: jpg, png, pdf, docx, xlsx, zip',
          maxSize: 'حجم فایل باید کمتر از ۱۰ مگابایت باشد',
        },
        replyTitle: 'پاسخ دادن',
        submit: 'ثبت تیکت',
        success: 'تیکت شما با موفقیت ثبت شد',
        error: 'ثبت تیکت ناموفق بود. لطفاً دوباره تلاش کنید.',
      },

      // Filters
      filterTitlePlaceholder: 'فیلتر بر اساس عنوان...',
      // Sort controls
      sortBy: 'مرتب‌سازی بر اساس',
      sortNewest: 'جدیدترین',
      sortOldest: 'قدیمی‌ترین',

      // Sidebar Navigation
      dashboard: 'پیشخوان',
      bundles: 'کمپین‌ها',
      targetedSend: 'ارسال‌ها',
      reports: 'گزارش و تحلیل',
      wallet: 'مدیریت مالی',
      settings: 'تنظیمات',
      customerManagement: 'مدیریت مشتریان',
      discountManagement: 'مدیریت تخفیف',
      customerDiscountManagement: 'مدیریت مشتری',

      // Stats
      stats: {
        totalCampaigns: 'تعداد کل ارسال‌ها',
        totalCustomers: 'تعداد کل مشتریان',
        walletBalance: 'موجودی کیف پول',
        activeTickets: 'تیکت‌های فعال',
      },

      // Content
      recentActivity: 'فعالیت‌های اخیر',
      noActivity: 'فعالیتی در حال حاضر وجود ندارد',
      reportsTable: {
        row: '#',
        title: 'عنوان',
        text: 'متن',
        lineNumber: 'سرشماره',
        segment: 'بخش',
        sent: 'ارسال شده',
        status: 'وضعیت',
        total: 'مجموع',
        createdAt: 'ایجاد شده',
        scheduleAt: 'زمان‌بندی',
        details: 'جزئیات',
        subsegments: 'زیربخش‌ها',
        sex: 'جنسیت',
        cities: 'شهرها',
        adlink: 'لینک تبلیغ',
        updatedAt: 'به‌روزرسانی',
      },
      reportsStatus: {
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
      fixAndRestart: 'اصلاح و شروع مجدد کمپین؟',
      supportHistory: 'تاریخچه تیکت‌ها',
      profile: {
        profile: 'پروفایل',
        fields: {
          email: 'ایمیل',
          name: 'نام',
          accountType: 'نوع حساب',
          companyName: 'نام شرکت',
          status: 'وضعیت',
          category: 'دسته‌بندی',
          job: 'شغل',
          agencyRefererCode: 'کد معرف شما',
          parentAgency: 'آژانس والد',
        },
      },
      campaignStats: {
        campaignsSummary: 'خلاصه ارسال‌ها',
        approved: 'تأیید شده',
        running: 'در حال اجرا',
        total: 'در انتظار ارسال',
      },
      pricingCalculation: {
        openButton: 'تعرفه ارسال ',
        modalTitle: 'جدول محاسبه قیمت',
        modalSubtitle: 'برای برآورد هزینه نهایی هر کانال مقادیر را تنظیم کنید.',
        close: 'بستن',
        loading: 'در حال دریافت اطلاعات قیمت...',
        loadFailed: 'دریافت اطلاعات قیمت ناموفق بود',
        errors: {
          basePriceListFailed: 'دریافت قیمت‌های پایه کانال‌ها ناموفق بود',
          pagePriceListFailed: 'دریافت قیمت جاذبه ناموفق بود',
          unauthorized: 'دسترسی غیرمجاز است. لطفاً دوباره وارد شوید',
          network: 'خطای شبکه رخ داد. لطفاً دوباره تلاش کنید',
          generic: 'دریافت اطلاعات قیمت ناموفق بود',
        },
        platformLabels: {
          sms: 'SMS',
          rubika: 'روبیکا',
          bale: 'بله',
          splus: 'سروش پلاس',
        },
        columns: {
          platform: 'کانال',
          segmentPriceFactor: 'ضریب قیمت سگمنت',
          numPages: 'تعداد پارت‌های پیام',
          platformBasePrice: 'قیمت پایه کانال',
          lineNumberPriceFactor: 'ضریب سرشماره',
          pagePrice: 'قیمت جاذبه',
          totalCost: 'هزینه نهایی',
        },
        formula: {
          title: 'فرمول محاسبه',
          sms: 'SMS: هزینه نهایی = (ضریب سرشماره × تعداد پارت‌های پیام × قیمت پایه کانال) + (ضریب قیمت سگمنت × قیمت جاذبه)',
          others:
            'سایر کانال: هزینه نهایی = قیمت پایه کانال + (ضریب قیمت سگمنت × قیمت جاذبه)',
          note: 'در کانال غیر از SMS، ضریب تعداد پارت‌های پیام و ضریب سرشماره در محاسبه برابر ۱ در نظر گرفته می‌شوند.',
        },
      },
    },

    // Campaign Creation
    campaign: {
      title: 'ایجاد کمپین هوشمند و داده‌محور',
      subtitle: 'کمپین هوشمند و داده‌محور هدفمند را در ۴ مرحله ساده ایجاد کنید',

      // Steps
      step1: 'بخش‌بندی',
      step2: 'محتوای پیام',
      step3: 'بودجه',
      step4: 'پرداخت',

      // Steps structure for StepHeader components
      steps: {
        segment: {
          title: 'هدف خود را تعریف کنید',
          subtitle: 'معیارهای مخاطب هدف خود را انتخاب کنید',
        },
        budget: {
          title: 'بودجه خود را تنظیم کنید',
          subtitle: 'پارامترهای مالی کمپین خود را تعریف کنید',
        },
      },

      // Navigation
      nextPage: 'صفحه بعدی',
      previousPage: 'صفحه قبلی',
      finish: 'تایید نهایی',

      // Confirmation Modal
      confirmTitle: 'آیا مطمئن هستید؟',
      confirmMessage: 'آیا می‌خواهید ایجاد این کمپین را تمام کنید؟',
      yes: 'بله',
      no: 'خیر',

      // Loading
      creating: 'در حال ایجاد کمپین...',
      pleaseWait: 'لطفاً منتظر بمانید تا کمپین شما ایجاد شود.',

      // Success
      success: 'کمپین با موفقیت ایجاد شد!',
      redirecting: 'در حال بازگشت به پیشخوان...',

      // Errors
      error: 'ایجاد کمپین ناموفق بود',
      tryAgain: 'لطفاً دوباره تلاش کنید.',
      errors: {
        scheduleTimeTooSoon:
          'زمان‌بندی باید حداقل ۱۰ دقیقه بعد از زمان فعلی باشد. برای اصلاح زمان‌بندی به مرحله ۲ بازگردید.',
        invalidScheduleTime:
          'زمان‌بندی نامعتبر است. برای اصلاح زمان‌بندی به مرحله ۲ بازگردید.',
      },
    },

    // Home Page
    home: {
      hero: {
        badge: 'پلتفرم پیشرو بازاریابی هوشمند و داده‌محور',
        title: 'تصمیم‌های بازاریابی دقیق‌تر، با بینش داده‌محور',
        subtitle:
          'از داده‌ها و ابزارهای هوشمند برای شناخت بهتر مشتریان، بهینه‌سازی مسیر جذب و طراحی لندینگ‌های بهتر استفاده کنید',
        cta: 'ورود به جاذبه',
        signin: 'ورود',
      },
      stats: {
        customers: 'مشتریان راضی',
        messages: 'پیام ارسال شده',
        delivery: 'نرخ تحویل',
        support: 'پشتیبانی مشتریان',
      },
      features: {
        title: 'چرا جاذبه را انتخاب کنید؟',
        subtitle:
          'ویژگی‌های قدرتمند طراحی شده برای کمک به موفقیت شما در بازاریابی هوشمند و داده‌محور',
        targeted: {
          title: 'ارسال‌های عملکردی مبتنی بر داده',
          description:
            'ارسال‌های خود را بر اساس داده‌های رفتاری و تقسیم‌بندی هوشمند طراحی کنید و به نتیجهٔ بهتر برسید',
        },
        segmentation: {
          title: 'بخش‌بندی داده‌محور',
          description:
            'کاربران را بر اساس رفتار، علاقه‌مندی و چرخهٔ عمر تقسیم‌بندی کنید تا اثرگذاری ارسال‌ها افزایش یابد',
        },
        analytics: {
          title: 'تحلیل داده و قیف‌های بازاریابی',
          description:
            'مسیر کاربر تا اقدام نهایی را بررسی کنید و نقاط افت را با ابزارهای تحلیلی ما شناسایی کنید',
        },
        compliance: {
          title: 'اتومیشن بازاریابی و پیگیری هوشمند',
          description:
            'فلوهای خودکار برای پیگیری سرنخ‌ها و مشتریان تعریف کنید و در زمان مناسب با آن‌ها تعامل داشته باشید',
        },
      },
      howItWorks: {
        title: 'چگونه جاذبه به شما کمک می‌کند',
        subtitle: 'در سه مرحله ساده با بازاریابی هوشمند و داده‌محور شروع کنید',
        step1: {
          title: 'ثبت‌نام کنید و اطلاعات کسب‌وکار خود را وارد کنید',
          description:
            'امکان اتصال داده‌های موجود و تعریف اهداف بازاریابی شما فراهم است',
        },
        step2: {
          title: 'مسیرهای بازاریابی و لندینگ‌های خود را طراحی کنید',
          description:
            'با کمک ابزارهای تحلیل و پیشنهاد هوش مصنوعی محتوای مناسب، زمان‌بندی و تقسیم‌بندی را انتخاب کنید',
        },
        step3: {
          title: 'پیاده‌سازی و پایش نتایج',
          description:
            'عملکرد ارسال‌ها و مسیر مشتری را در لحظه بررسی کنید و با ابزار اتومیشن بازاریابی به‌طور خودکار بهینه‌سازی کنید',
        },
      },
      cta: {
        title: 'آماده‌اید بازاریابی داده‌محور را تجربه کنید؟',
        subtitle:
          'به صدها شرکت و آژانسی بپیوندید که برای تصمیم‌گیری‌های بازاریابی از جاذبه استفاده می‌کنند',
        button: 'ورود به حساب / ثبت‌نام',
      },
    },

    // Error Boundary
    error: {
      title: 'چیزی به‌روزرسانی نشد',
      message:
        'متاسفانه، چیزی به‌روزرسانی نشد. لطفاً صفحه را دوباره بارگذاری کنید.',
      refresh: 'بارگذاری مجدد صفحه',
    },

    // Common
    common: {
      loading: 'در حال بارگذاری...',
      required: '*',
      cancel: 'انصراف',
      close: 'بستن',
      save: 'ذخیره',
      edit: 'ویرایش',
      delete: 'حذف',
      confirm: 'تأیید',
      back: 'بازگشت',
      previous: 'قبلی',
      next: 'بعدی',
      submit: 'ارسال',
      resend: 'ارسال مجدد',
      seconds: 'ث',
      finish: 'پایان',
      finish2: 'تایید نهایی',
      continue: 'ادامه',
      yes: 'بله',
      no: 'خیر',
      comingSoon: 'به زودی',
      details: 'جزئیات',
      reply: 'پاسخ دادن',
      active: 'فعال',
      inactive: 'غیرفعال',
    },

    // Support (Customer)
    supportPage: {
      title: 'تیکت و پشتیبانی',
      intro: 'برای ارتباط با پشتیبانی، یک تیکت ثبت کنید.',
      create: 'ایجاد تیکت',
      history: 'تاریخچه تیکت‌ها',
      modal: {
        title: 'ایجاد تیکت پشتیبانی',
        submit: 'ارسال',
        titleLabel: 'عنوان (اختیاری)',
        titlePlaceholder: 'یک عنوان کوتاه وارد کنید (حداکثر ۸۰ کاراکتر)',
        contentLabel: 'متن تیکت',
        contentPlaceholder: 'درخواست خود را توضیح دهید (حداکثر ۱۰۰۰ کاراکتر)',
        fileLabel: 'ضمیمه (اختیاری)',
        success: 'تیکت با موفقیت ایجاد شد',
      },
      table: {
        row: 'ردیف',
        title: 'عنوان',
        content: 'متن',
        createdAt: 'تاریخ ایجاد',
        details: 'جزئیات',
        noRecords: 'رکوردی یافت نشد',
      },
    },

    // Admin Tickets
    adminTickets: {
      title: 'تیکت‌های ادمین و پشتیبانی',
    },

    // Pricing
    pricing: {
      title: 'تعرفه‌ها',
      subtitle: 'قیمت‌گذاری ساده و شفاف که با شما رشد می‌کند',
      intro: {
        title: 'نحوه قیمت‌گذاری',
        description:
          'برای استفاده از امکانات جاذبه، لازم است حساب خود را در جاذبه شارژ کنید. شما می‌توانید با شارژ کیف پول دیجیتال خود، از همهٔ خدمات جاذبه مانند طراحی و بهبود لندینگ‌ها، ترکینگ لیدهای بازاریابی، تحلیل مسیر مشتریان و اتومیشن بازاریابی بهره‌مند شوید. هزینهٔ هر سرویس بر اساس حجم استفاده (تعداد ارسال‌های فعال، تعداد سگمنت‌های پردازش‌شده، و امکانات تحلیلی) محاسبه می‌شود و مالیات قانونی (٪۱۰) به‌صورت شفاف از شارژ کسر می‌شود. با خرید اعتبار بیشتر، از شارژهای هدیه پلن‌های Basic، Pro و Enterprise نیز بهره‌مند خواهید شد.',
        payAsYouGo: {
          title: 'پرداخت بر اساس استفاده',
          description: 'محاسبه بر اساس میزان استفاده واقعی',
        },
        transparent: {
          title: 'هزینه‌های شفاف',
          description: 'مالیات ۱۰٪ در همه تراکنش‌ها لحاظ شده است',
        },
        volume: {
          title: 'تخفیف حجمی',
          description: 'با خرید اعتبار بیشتر، بیشتر صرفه‌جویی کنید',
        },
      },
      plans: {
        title: 'پلن خود را انتخاب کنید',
        popular: 'محبوب',
        getStarted: 'شروع کنید',
        basic: {
          name: 'پایه',
          description: 'مناسب برای کسب‌وکارهای کوچک',
          discount: '۵٪ تخفیف',
          features: {
            campaigns: 'تا ۱۰ کمپین فعال',
            segments: 'سگمنت‌بندی پایه',
            analytics: 'تحلیل‌های استاندارد',
            support: 'پشتیبانی ایمیلی',
          },
        },
        pro: {
          name: 'حرفه‌ای',
          description: 'برای کسب‌وکارهای در حال رشد با نیازهای پیشرفته',
          discount: '۱۰٪ تخفیف',
          features: {
            campaigns: 'تا ۵۰ کمپین فعال',
            segments: 'سگمنت‌بندی پیشرفته',
            analytics: 'تحلیل و ردیابی پیشرفته',
            automation: 'اتومیشن بازاریابی',
            support: 'پشتیبانی اولویت‌دار',
          },
        },
        enterprise: {
          name: 'سازمانی',
          description: 'راهکارهای سفارشی برای سازمان‌های بزرگ',
          discount: '۱۵٪ تخفیف',
          features: {
            campaigns: 'ارسال‌های نامحدود',
            segments: 'سگمنت‌بندی سفارشی',
            analytics: 'تحلیل‌های سازمانی',
            automation: 'مجموعه کامل اتومیشن',
            support: 'مدیر اختصاصی حساب',
            custom: 'یکپارچه‌سازی‌های سفارشی',
          },
        },
      },
      cta: {
        title: 'آماده شروع هستید؟',
        description:
          'همین امروز حساب خود را ایجاد کنید و اولین کمپین خود را شروع کنید',
        signup: 'ثبت‌نام کنید',
        contact: 'تماس با فروش',
      },
    },
  },
};

export type TranslationKey = keyof typeof translations.en;
