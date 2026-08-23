const campaignLevelEn = {
  title: 'Define Your Target Audience',

  // Campaign Title
  campaignTitle: 'Campaign Title',
  campaignTitlePlaceholder: 'Enter campaign title (max 255 characters)',
  campaignTitleValidation: 'Campaign title must be at most 255 characters',

  // Level 1 Selection
  level1: 'Level 1',
  level1Placeholder: 'Choose Level 1',
  selectlevel1: 'Select Level 1',
  level1Label: 'Selecting the target audience',
  level1Description:
    'Which of the following should your target audience be consumers of?',

  // Level 2 Selection
  level2: 'Level 2',
  level2For: 'Level 2 for {level2}',
  level2Help: '',
  level2Validation: 'Please select at least one Level 2 item',
  level2Label: '',

  // Level 3
  level3: '',
  level3Help: '',

  // Sex Selection
  sex: 'Sex',
  sexPlaceholder: 'Choose sex preference',
  selectSex: 'Select Sex',

  // City Selection
  cities: 'Cities',
  citiesHelp: 'Select at least one city (multiple selection allowed)',
  citiesPlaceholder: 'Select a city',
  citiesValidation: 'Please select at least one city',

  // Summary Section
  campaignSummary: 'Campaign Summary',
  campaignTitleLabel: 'Campaign Title',
  level3Label: 'level3:',
  sexLabel: 'Sex:',
  citiesLabel: 'Cities:',
  notSet: 'Not set',

  // Campaign Capacity Section
  campaignCapacity: 'Campaign Capacity',
  capacityDescription:
    'Number of people who will receive your SMS based on selected filters',
  calculatingCapacity: 'Calculating capacity...',
  capacityResult: '{count} people will receive your SMS',
  capacityError: 'Unable to calculate capacity. Please check your selections.',
  capacityHelp:
    'Capacity is calculated automatically as you adjust your campaign filters.',
  campaignCapacityHelp:
    'Capacity is calculated automatically as you adjust your campaign filters.',
  capacityTooLow:
    'Capacity too low (< 500). Remove some filters to increase campaign capacity.',
  estimatedCapacity: 'Estimated Capacity',
  calculating: 'Calculating...',
  users: 'users',

  // Legacy fields (keeping for backward compatibility)
  customerType: 'Customer Type',
  customerTypePlaceholder: 'Select customer type',
  ageRange: 'Age Range',
  ageRangePlaceholder: 'Select age range',
  location: 'Location',
  locationPlaceholder: 'Enter city or province',
  interests: 'Interests',
  interestsPlaceholder: 'Select interests',
  customFilters: 'Custom Filters',
  addFilter: 'Add Filter',
  removeFilter: 'Remove',
  filterField: 'Field',
  filterOperator: 'Operator',
  filterValue: 'Value',

  searchPlaceholder: 'Search ...',

  // Metadata fields
  inclusion: 'Inclusion',
  exclusion: 'Exclusion',
  one_line: 'Description',
  description: 'Description',
  tags: 'Tags',
  available_audience: 'Available Audience',
  count: 'Count',
  metadata: 'Metadata',
  items: 'Items',
  total: 'Total',
  category: 'Category',
  type: 'Type',
  status: 'Status',
  questionMark: '?',

  // Segment price factors
  segmentPriceFactors: 'Level 3 Price Factor:',

  // Platform selection
  platform: 'Platform',
  platformSms: 'SMS',
  platformRubika: 'Rubika',
  platformBale: 'Bale',
  platformSplus: 'Splus',

  // Segmentation mode
  segmentationMode: 'Segmentation Method',
  segmentationByLevels: 'Select Levels',
  segmentationBySmartTargeting: 'Smart Targeting',
  segmentationByTargetAudienceExcelFile: 'Upload Excel file',
  segmentationByTargetAudienceExcelFileTitle: 'Target Audience Excel File',
  segmentationByTargetAudienceExcelFileHelp:
    'Upload .xls or .xlsx file to segment audience',
  segmentationByTargetAudienceExcelFileSampleDownload:
    'Download sample Excel file',
  segmentationByTargetAudienceExcelFileUploading: 'Uploading Excel file...',
  segmentationByTargetAudienceExcelFileUploaded: 'Uploaded',
  segmentationByTargetAudienceExcelFileRemove: 'Remove',
  segmentationByTargetAudienceExcelFileInvalidType:
    'Please upload a valid Excel file (.xls or .xlsx)',
  segmentationByTargetAudienceExcelFileRequired:
    'Please upload your Excel file',
  smartTargeting: {
    title: 'Smart Targeting Tags',
    description:
      'Select the campaign tags to target. Selections remain saved across search, sorting, and pagination.',
    searchLabel: 'Search Tag Display Title',
    searchPlaceholder: 'Search tags',
    capacityLabel: 'Minimum Tag Capacity',
    capacityPlaceholder: 'Show tags above this capacity',
    sortByLabel: 'Sort by',
    sortDirectionLabel: 'Direction',
    defaultOrder: 'Default order',
    ascending: 'Ascending',
    descending: 'Descending',
    columns: {
      selection: 'Selection',
      usedInBundle: 'In bundle',
      tagDisplayTitle: 'Tag Display Title',
      tagCapacity: 'Tag Capacity',
      bundlePersonaFitScore: 'Bundle Persona Fit Score',
      testPhaseAvgCtr: 'Test Phase Average CTR',
      overallAvgCtr: 'Overall Average CTR',
      testPhaseAvgAtr: 'Test Phase ATR',
      overallAvgAtr: 'Overall ATR',
    },
    sortOptions: {
      tagCapacity: 'Tag Capacity',
      bundlePersonaFitScore: 'Bundle Persona Fit Score',
      testPhaseAvgCtr: 'Test Phase Average CTR',
      overallAvgCtr: 'Overall Average CTR',
      testPhaseAvgAtr: 'Test Phase ATR',
      overallAvgAtr: 'Overall ATR',
    },
    autoSelectLabel: 'Number of Tags for Automatic Selection',
    autoSelectPlaceholder: 'Example: 20',
    autoSelectButton: 'Automatically Select Tags',
    autoSelecting: 'Selecting...',
    resetSelection: 'Reset Selection',
    selectedTags: 'Selected tags',
    selectedRawCapacity: 'Selected raw capacity',
    audiences: 'audiences',
    loading: 'Loading Smart Targeting tags...',
    refreshing: 'Refreshing...',
    retry: 'Retry',
    noBundle: 'Select a bundle before choosing Smart Targeting tags.',
    noTags: 'No Smart Targeting tags are available for this bundle.',
    noSearchResults: 'No tags match this search.',
    searchTooLong: 'Search is limited to 200 characters.',
    invalidAutoCount: 'Enter a whole number greater than zero.',
    autoCountTooLarge:
      'Automatic selection cannot exceed the current result count: {count}.',
    validationRequired:
      'At least one tag must be selected for Smart Targeting.',
    fetchError: 'Failed to load Smart Targeting tags. Please try again.',
    autoSelectError:
      'Failed to automatically select Smart Targeting tags. Please try again.',
    unavailable: '—',
    usedInBundleTooltip: 'Used in bundle',
    pagination: {
      showing: 'Showing {from} to {to} of {total} tags',
      rowsPerPage: 'Rows per page',
      previous: 'Previous',
      next: 'Next',
    },
    exactCapacity: {
      title: 'Exact Smart Targeting Capacity',
      description:
        'Calculate the deduplicated audience capacity for the current tags and score classes.',
      scoreClassesLabel: 'Audience Score Classes',
      classA: 'Class A',
      classAMeaning: 'Scores above the 66th percentile',
      classB: 'Class B',
      classBMeaning: 'Scores between the 33rd and 66th percentiles',
      classC: 'Class C',
      classCMeaning: 'Scores up to the 33rd percentile',
      allClasses: 'No restriction selected; all classes will be included.',
      calculate: 'Calculate Exact Capacity',
      starting: 'Requesting calculation...',
      loadingCurrent: 'Loading the latest exact-capacity calculation...',
      statusLabel: 'Status',
      notCalculated: 'Not Calculated',
      calculating: 'Calculating',
      calculated: 'Calculated',
      recalculationRequired: 'Recalculation Required',
      failed: 'Calculation Failed',
      selectedTags: 'Selected Tags',
      selectedRawCapacity: 'Selected Raw Capacity',
      eligibleBeforeDeduction:
        'Eligible Unique Audience Before Approved Campaign Deduction',
      approvedDeduction: 'Approved Campaign Audience Deduction',
      exactUsableCapacity: 'Exact Usable Capacity',
      audiences: 'audiences',
      selectTags: 'Select at least one tag before calculating exact capacity.',
      completeCampaignDataFirst:
        'Complete the required Campaign data before calculating exact capacity.',
      campaignWillBeCreated:
        'This Campaign will be created before the exact-capacity calculation starts.',
      campaignCreationFailed:
        'The Campaign could not be created. No capacity calculation was started.',
      serverRequiresCalculation:
        'The Campaign could not proceed because its exact capacity is missing or stale. Calculate it before continuing.',
      calculationInProgress: 'Exact-capacity calculation is in progress.',
      recalculationMessage:
        'The selected tags or audience score classes have changed. Recalculate the exact capacity to view the current exact usable capacity.',
      calculationFailed: 'Exact-capacity calculation failed. Please try again.',
      calculationUnavailable: 'The calculation result is unavailable.',
      zeroCapacity: 'No usable audience capacity is currently available.',
      fetchError:
        'Failed to load the exact-capacity calculation. Please try again.',
      startError:
        'Failed to request the exact-capacity calculation. Please try again.',
      invalidResponse: 'An invalid response was received from the server.',
      pollingRetry:
        'The latest status could not be loaded. Retrying automatically...',
      pollingStopped:
        'Status updates are delayed after repeated connection failures. Retrying automatically...',
      selectionChangedDuringRequest:
        'The tag or score-class selection changed during the request. Calculate again with the current selection.',
      unknownStatus:
        'The server returned an unsupported calculation status. Please try again.',
    },
    testPreview: {
      title: 'Smart Targeting Test Sample',
      description:
        'Configure the all-or-nothing sample here. Current availability is checked on the Budget page.',
      sampleSizeLabel: 'Sample Size per Tag',
      sampleSizeHelp:
        'Each tag must provide this full sample or it will be skipped. Changing this value does not run a preview.',
      sampleSizeInvalid: 'Enter a positive whole number for each tag.',
      scoreClassesRequired: 'Select at least one audience score class.',
      scoreClassesLabel: 'Audience Score Classes',
      classA: 'Class A',
      classAMeaning: 'Scores above the 66th percentile',
      classB: 'Class B',
      classBMeaning: 'Scores between the 33rd and 66th percentiles',
      classC: 'Class C',
      classCMeaning: 'Scores up to the 33rd percentile',
      allClasses: 'No restriction selected; all classes will be included.',
      selectedTags: 'Selected Tags',
      requestedAudience: 'Requested Test Audience',
      satisfiedTags: 'Satisfied Tags',
      unsatisfiedTags: 'Unsatisfied Tags',
      effectiveAudience: 'Effective Test Audience',
      campaignCost: 'Estimated Campaign Cost',
      audiences: 'audiences',
      currency: 'Toman',
      checkAvailability: 'Check Test Sample Availability',
      checkingAvailability: 'Checking availability...',
      selectTags: 'Select at least one tag before checking availability.',
      completeCampaignDataFirst:
        'Complete the required Campaign data before checking availability.',
      campaignWillBeCreated:
        'This Campaign will be saved before availability is checked.',
      campaignPreparationFailed:
        'The Campaign configuration could not be saved.',
      selectionSaveFailed:
        'The ordered tag selection could not be saved. Please try again.',
      previewFailed:
        'Test sample availability could not be checked. Please try again.',
      loadingCurrent: 'Loading the latest Test sampling calculation...',
      calculationQueued:
        'Test sample availability is queued and will start shortly.',
      calculationInProgress:
        'Test sample availability is being calculated. Status updates are automatic.',
      calculationFailed:
        'Test sample availability calculation failed. Please try again.',
      calculationStale:
        'This sampling calculation is no longer current. Check availability again.',
      fetchError:
        'Failed to load the Test sampling calculation. Please try again.',
      startError:
        'Failed to request the Test sampling calculation. Please try again.',
      pollingRetry:
        'The latest calculation status could not be loaded. Retrying automatically...',
      pollingStopped:
        'Status updates are delayed after repeated connection failures. Retrying automatically...',
      unknownStatus:
        'The server returned an unsupported sampling status. Please try again.',
      invalidResponse: 'An invalid preview response was received.',
      inputsChangedDuringRequest:
        'The Test sampling configuration changed during the request. Check availability again.',
      selectionOrderPending:
        'Wait for the selected tags to be synchronized with the current table order.',
      stale:
        'The previous preview is stale because the Test sampling inputs changed.',
      previewRequired:
        'Run the availability check to determine the effective Test audience and cost.',
      unsatisfiedWarning:
        'The following tags do not currently have enough eligible audiences to provide the requested sample and will be skipped.',
      availabilityLabel: 'Available audiences',
      tagLabel: 'Tag',
      estimateLimitation:
        'This preview reflects current audience availability. Final Test audience selection is performed at scheduler runtime and may differ if availability changes.',
    },
  },

  // Bundle info
  bundleInfoTitle: 'Bundle Information',
  bundle: 'Bundle',
  bundlePlaceholder: 'Select a bundle',
  bundleLoading: 'Loading bundles...',
  bundleLoadError: 'Failed to load bundles. Please try again.',
  bundleEmpty: 'No bundles found yet. Create one to continue.',
  bundleCreateAction: 'Create a new bundle',
  phase: 'Sending Phase',
  phasePlaceholder: 'Select a phase',
  phaseTest: 'Test',
  phaseExecution: 'Execution',

  // Audience grade selection
  audienceGradeTitle: 'Audience Grade Selection',
  audienceGradeA: 'Class A',
  audienceGradeB: 'Class B',
  audienceGradeC: 'Class C',

  // Common fields
  loading: 'Loading...',
  reset: 'Reset',

  // Job fields for agencies
  agencyCategoryHeader:
    'Please select the category and subcategory that best describes your business',
  agencyCategory: 'Category',
  agencyJob: 'Job',
  agencySelectCategory: 'Select category',
  agencySelectJob: 'Select job',
  agencyCategoryRequired: 'Category is required',
  agencyJobRequired: 'Job is required',
};

const campaignLevelFa = {
  title: 'مخاطبان هدف خود را تعریف کنید',

  // Campaign Title
  campaignTitle: 'عنوان ارسال',
  campaignTitlePlaceholder: 'عنوان ارسال را وارد کنید (حداکثر ۲۵۵ کاراکتر)',
  campaignTitleValidation: 'عنوان ارسال باید حداکثر ۲۵۵ کاراکتر باشد',

  // Level 1 Selection
  level1: 'سطح ۱',
  level1Placeholder: 'سطح ۱ را انتخاب کنید',
  selectLevel1: 'انتخاب سطح ۱',
  level1Label: 'انتخاب مخاطبان هدف',
  level1Description:
    'مخاطبان هدف شما باید مصرف‌کنندگان کدام یک از موارد زیر باشند؟',

  // Level 2 Selection
  level2: 'سطح ۲',
  level2For: 'سطح ۲ برای {level2}',
  level2Help: '',
  level2Validation: 'لطفاً حداقل یک سطح ۲ را انتخاب کنید',
  level2Label: '',

  // Level 3
  level3: '',
  level3Help: '',

  // Sex Selection
  sex: 'جنسیت',
  sexPlaceholder: 'ترجیح جنسیت را انتخاب کنید',
  selectSex: 'انتخاب جنسیت',

  // City Selection
  cities: 'شهرها',
  citiesHelp: 'حداقل یک شهر را انتخاب کنید (انتخاب چندگانه مجاز است)',
  citiesPlaceholder: 'حداقل یک شهر را انتخاب کنید',
  citiesValidation: 'لطفاً حداقل یک شهر را انتخاب کنید',

  // Summary Section
  campaignSummary: 'خلاصه کمپین',
  campaignTitleLabel: 'عنوان ارسال',
  level3Label: 'سطح ۳:',
  sexLabel: 'جنسیت:',
  citiesLabel: 'شهرها:',
  notSet: 'تنظیم نشده',

  // Campaign Capacity Section
  campaignCapacity: 'ظرفیت ارسال',
  capacityDescription:
    'تعداد افرادی که بر اساس فیلترهای انتخاب شده پیام پیامکی شما را دریافت خواهند کرد',
  calculatingCapacity: 'در حال محاسبه ظرفیت...',
  capacityResult: '{count} نفر پیام پیامکی شما را دریافت خواهند کرد',
  capacityError:
    'قادر به محاسبه ظرفیت نیست. لطفاً انتخاب‌های خود را بررسی کنید.',
  capacityHelp:
    'ظرفیت به طور خودکار با تنظیم فیلترهای ارسال شما محاسبه می‌شود.',
  campaignCapacityHelp:
    'ظرفیت به طور خودکار با تنظیم فیلترهای ارسال شما محاسبه می‌شود.',
  capacityTooLow:
    'ظرفیت بسیار کم است (کمتر از ۵۰۰). چند فیلتر را حذف کنید تا ظرفیت افزایش یابد.',
  estimatedCapacity: 'ظرفیت تخمینی',
  calculating: 'در حال محاسبه...',
  users: 'مخاطب',

  // Legacy fields (keeping for backward compatibility)
  customerType: 'نوع مشتری',
  customerTypePlaceholder: 'نوع مشتری را انتخاب کنید',
  ageRange: 'محدوده سنی',
  ageRangePlaceholder: 'محدوده سنی را انتخاب کنید',
  location: 'مکان',
  locationPlaceholder: 'شهر یا استان را وارد کنید',
  interests: 'علایق',
  interestsPlaceholder: 'علایق را انتخاب کنید',
  customFilters: 'فیلترهای سفارشی',
  addFilter: 'افزودن فیلتر',
  removeFilter: 'حذف',
  filterField: 'فیلد',
  filterOperator: 'عملگر',
  filterValue: 'مقدار',

  searchPlaceholder: 'جستجو کنید.',

  // Metadata fields
  inclusion: 'شمول',
  exclusion: 'عدم شمول',
  one_line: 'توضیحات',
  description: 'توضیحات',
  tags: 'برچسب‌ها',
  available_audience: 'مخاطبان در دسترس',
  count: 'تعداد',
  metadata: 'فراداده',
  items: 'آیتم‌ها',
  total: 'مجموع',
  category: 'دسته‌بندی',
  type: 'نوع',
  status: 'وضعیت',
  questionMark: '؟',

  // Segment price factors
  segmentPriceFactors: 'ضریب قیمتی دسته انتخاب شما برابر است با:',

  // Platform selection
  platform: 'کانال ارسال',
  platformSms: 'پیامک',
  platformRubika: 'روبیکا',
  platformBale: 'بله',
  platformSplus: 'سروش پلاس',

  // Segmentation mode
  segmentationMode: 'نوع هدف‌گیری',
  segmentationByLevels: 'دسته‌بندی عادی',
  segmentationBySmartTargeting: 'هدف‌گیری هوشمند',
  segmentationByTargetAudienceExcelFile: 'مخاطبان مشخص',
  segmentationByTargetAudienceExcelFileTitle: 'فایل اکسل مخاطبان',
  segmentationByTargetAudienceExcelFileHelp:
    'فایل با فرمت xls. یا xlsx. بارگذاری کنید',
  segmentationByTargetAudienceExcelFileSampleDownload: 'دانلود فایل نمونه اکسل',
  segmentationByTargetAudienceExcelFileUploading:
    'در حال بارگذاری فایل اکسل...',
  segmentationByTargetAudienceExcelFileUploaded: 'بارگذاری شد',
  segmentationByTargetAudienceExcelFileRemove: 'حذف',
  segmentationByTargetAudienceExcelFileInvalidType:
    'لطفاً یک فایل اکسل معتبر با فرمت xls. یا xlsx. بارگذاری کنید',
  segmentationByTargetAudienceExcelFileRequired:
    'لطفاً فایل اکسل را بارگذاری کنید',
  smartTargeting: {
    title: 'برچسب‌های هدف‌گیری هوشمند',
    description:
      'برچسب‌های این ارسال را انتخاب کنید. انتخاب‌ها با جستجو، مرتب‌سازی و صفحه‌بندی حفظ می‌شوند.',
    searchLabel: 'جستجوی عنوان نمایشی برچسب',
    searchPlaceholder: 'جستجوی برچسب‌ها',
    capacityLabel: 'حداقل ظرفیت برچسب',
    capacityPlaceholder: 'برچسب‌های با ظرفیت بیشتر از این مقدار',
    sortByLabel: 'مرتب‌سازی بر اساس',
    sortDirectionLabel: 'جهت',
    defaultOrder: 'ترتیب پیش‌فرض',
    ascending: 'صعودی',
    descending: 'نزولی',
    columns: {
      selection: 'انتخاب',
      usedInBundle: 'استفاده شده',
      tagDisplayTitle: 'عنوان نمایشی برچسب',
      tagCapacity: 'ظرفیت برچسب',
      bundlePersonaFitScore: 'امتیاز تناسب پرسونای کمپین',
      testPhaseAvgCtr: 'میانگین CTR فاز تست',
      overallAvgCtr: 'میانگین CTR کلی',
      testPhaseAvgAtr: 'ATR فاز تست',
      overallAvgAtr: 'ATR کلی',
    },
    sortOptions: {
      tagCapacity: 'ظرفیت برچسب',
      bundlePersonaFitScore: 'امتیاز تناسب پرسونای کمپین',
      testPhaseAvgCtr: 'میانگین CTR فاز تست',
      overallAvgCtr: 'میانگین CTR کلی',
      testPhaseAvgAtr: 'ATR فاز تست',
      overallAvgAtr: 'ATR کلی',
    },
    autoSelectLabel: 'تعداد برچسب برای انتخاب خودکار',
    autoSelectPlaceholder: 'مثلاً: ۲۰',
    autoSelectButton: 'انتخاب خودکار برچسب‌ها',
    autoSelecting: 'در حال انتخاب...',
    resetSelection: 'لغو انتخاب‌ها',
    selectedTags: 'برچسب‌های انتخاب‌شده',
    selectedRawCapacity: 'ظرفیت خام انتخاب‌شده',
    audiences: 'مخاطب',
    loading: 'در حال بارگذاری برچسب‌های هدف‌گیری هوشمند...',
    refreshing: 'در حال به‌روزرسانی...',
    retry: 'تلاش دوباره',
    noBundle:
      'برای انتخاب برچسب‌های هدف‌گیری هوشمند ابتدا یک کمپین انتخاب کنید.',
    noTags: 'برای این کمپین برچسب هدف‌گیری هوشمند موجود نیست.',
    noSearchResults: 'هیچ برچسبی با این جستجو پیدا نشد.',
    searchTooLong: 'جستجو حداکثر ۲۰۰ کاراکتر است.',
    invalidAutoCount: 'یک عدد صحیح بزرگ‌تر از صفر وارد کنید.',
    autoCountTooLarge:
      'انتخاب خودکار نمی‌تواند بیشتر از تعداد نتایج فعلی باشد: {count}.',
    validationRequired: 'برای هدف‌گیری هوشمند حداقل یک برچسب باید انتخاب شود.',
    fetchError:
      'بارگذاری برچسب‌های هدف‌گیری هوشمند ناموفق بود. لطفاً دوباره تلاش کنید.',
    autoSelectError:
      'انتخاب خودکار برچسب‌های هدف‌گیری هوشمند ناموفق بود. لطفاً دوباره تلاش کنید.',
    unavailable: '—',
    usedInBundleTooltip: 'در این بسته استفاده شده است',
    pagination: {
      showing: 'نمایش {from} تا {to} از {total} برچسب',
      rowsPerPage: 'ردیف در صفحه',
      previous: 'قبلی',
      next: 'بعدی',
    },
    exactCapacity: {
      title: 'ظرفیت دقیق هدف‌گیری هوشمند',
      description:
        'ظرفیت یکتای مخاطبان را برای برچسب‌ها و کلاس‌های نمره فعلی محاسبه کنید.',
      scoreClassesLabel: 'کلاس‌های نمره مخاطب',
      classA: 'کلاس الف',
      classAMeaning: 'نمره‌های بالاتر از صدک ۶۶',
      classB: 'کلاس ب',
      classBMeaning: 'نمره‌های بین صدک ۳۳ و ۶۶',
      classC: 'کلاس ج',
      classCMeaning: 'نمره‌ها تا صدک ۳۳',
      allClasses: 'محدودیتی انتخاب نشده است؛ همه کلاس‌ها لحاظ می‌شوند.',
      calculate: 'محاسبه ظرفیت دقیق',
      starting: 'در حال ثبت درخواست محاسبه...',
      loadingCurrent: 'در حال بارگذاری آخرین محاسبه ظرفیت دقیق...',
      statusLabel: 'وضعیت',
      notCalculated: 'محاسبه نشده',
      calculating: 'در حال محاسبه',
      calculated: 'محاسبه شده',
      recalculationRequired: 'نیاز به محاسبه مجدد',
      failed: 'خطا در محاسبه',
      selectedTags: 'تعداد برچسب‌های انتخاب‌شده',
      selectedRawCapacity: 'ظرفیت خام انتخاب‌شده',
      eligibleBeforeDeduction:
        'ظرفیت یکتای واجد شرایط پیش از کسر ارسال‌های تأییدشده',
      approvedDeduction: 'کسر ظرفیت مخاطبان ارسال‌های تأییدشده',
      exactUsableCapacity: 'ظرفیت دقیق قابل استفاده',
      audiences: 'مخاطب',
      selectTags: 'برای محاسبه ظرفیت دقیق، ابتدا حداقل یک برچسب انتخاب کنید.',
      completeCampaignDataFirst:
        'پیش از محاسبه ظرفیت دقیق، اطلاعات الزامی ارسال را تکمیل کنید.',
      campaignWillBeCreated:
        'پیش از شروع محاسبه ظرفیت دقیق، این ارسال ایجاد خواهد شد.',
      campaignCreationFailed: 'ایجاد ارسال ناموفق بود و محاسبه ظرفیت آغاز نشد.',
      serverRequiresCalculation:
        'ادامه ارسال به‌دلیل نبودن یا قدیمی بودن ظرفیت دقیق ممکن نیست. پیش از ادامه، ظرفیت را محاسبه کنید.',
      calculationInProgress: 'محاسبه ظرفیت دقیق در حال انجام است.',
      recalculationMessage:
        'انتخاب برچسب‌ها یا کلاس نمره مخاطب تغییر کرده است. برای مشاهده ظرفیت دقیق قابل استفاده، دوباره محاسبه را انجام دهید.',
      calculationFailed:
        'محاسبه ظرفیت دقیق با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
      calculationUnavailable: 'نتیجه محاسبه در دسترس نیست.',
      zeroCapacity: 'در حال حاضر ظرفیت مخاطب قابل استفاده‌ای وجود ندارد.',
      fetchError:
        'بارگذاری محاسبه ظرفیت دقیق ناموفق بود. لطفاً دوباره تلاش کنید.',
      startError:
        'ثبت درخواست محاسبه ظرفیت دقیق ناموفق بود. لطفاً دوباره تلاش کنید.',
      invalidResponse: 'پاسخ نامعتبری از سرور دریافت شد.',
      pollingRetry:
        'دریافت آخرین وضعیت ناموفق بود. تلاش مجدد به‌صورت خودکار انجام می‌شود...',
      pollingStopped:
        'پس از چند خطای ارتباطی، به‌روزرسانی وضعیت با تأخیر مواجه شده است و تلاش مجدد به‌صورت خودکار انجام می‌شود.',
      selectionChangedDuringRequest:
        'انتخاب برچسب یا کلاس نمره هنگام درخواست تغییر کرد. محاسبه را برای انتخاب فعلی دوباره انجام دهید.',
      unknownStatus:
        'سرور وضعیت محاسبه پشتیبانی‌نشده‌ای برگرداند. لطفاً دوباره تلاش کنید.',
    },
    testPreview: {
      title: 'نمونه فاز تست هدف‌گیری هوشمند',
      description:
        'اندازه نمونه کامل هر برچسب را اینجا تنظیم کنید. موجودی فعلی در صفحه بودجه بررسی می‌شود.',
      sampleSizeLabel: 'اندازه نمونه برای هر برچسب',
      sampleSizeHelp:
        'هر برچسب باید کل نمونه را تأمین کند؛ در غیر این صورت رد می‌شود. تغییر این مقدار پیش‌نمایش را اجرا نمی‌کند.',
      sampleSizeInvalid: 'برای هر برچسب یک عدد صحیح مثبت وارد کنید.',
      scoreClassesRequired: 'حداقل یک کلاس نمره مخاطب انتخاب کنید.',
      scoreClassesLabel: 'کلاس‌های نمره مخاطب',
      classA: 'کلاس الف',
      classAMeaning: 'نمره‌های بالاتر از صدک ۶۶',
      classB: 'کلاس ب',
      classBMeaning: 'نمره‌های بین صدک ۳۳ و ۶۶',
      classC: 'کلاس ج',
      classCMeaning: 'نمره‌ها تا صدک ۳۳',
      allClasses: 'محدودیتی انتخاب نشده است؛ همه کلاس‌ها لحاظ می‌شوند.',
      selectedTags: 'برچسب‌های انتخاب‌شده',
      requestedAudience: 'مخاطبان درخواستی تست',
      satisfiedTags: 'برچسب‌های تأمین‌شده',
      unsatisfiedTags: 'برچسب‌های تأمین‌نشده',
      effectiveAudience: 'مخاطبان مؤثر تست',
      campaignCost: 'هزینه تخمینی ارسال',
      audiences: 'مخاطب',
      currency: 'تومان',
      checkAvailability: 'بررسی موجودی نمونه تست',
      checkingAvailability: 'در حال بررسی موجودی...',
      selectTags: 'پیش از بررسی موجودی حداقل یک برچسب انتخاب کنید.',
      completeCampaignDataFirst:
        'پیش از بررسی موجودی، اطلاعات الزامی ارسال را تکمیل کنید.',
      campaignWillBeCreated: 'پیش از بررسی موجودی، این ارسال ذخیره خواهد شد.',
      campaignPreparationFailed: 'ذخیره پیکربندی ارسال ناموفق بود.',
      selectionSaveFailed:
        'ذخیره ترتیب برچسب‌ها ناموفق بود. لطفاً دوباره تلاش کنید.',
      previewFailed:
        'بررسی موجودی نمونه تست ناموفق بود. لطفاً دوباره تلاش کنید.',
      loadingCurrent: 'در حال بارگذاری آخرین محاسبه نمونه تست...',
      calculationQueued:
        'بررسی موجودی نمونه تست در صف است و به‌زودی شروع می‌شود.',
      calculationInProgress:
        'موجودی نمونه تست در حال محاسبه است. وضعیت به‌صورت خودکار به‌روزرسانی می‌شود.',
      calculationFailed:
        'محاسبه موجودی نمونه تست با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
      calculationStale:
        'این محاسبه نمونه دیگر معتبر نیست. موجودی را دوباره بررسی کنید.',
      fetchError:
        'بارگذاری محاسبه نمونه تست ناموفق بود. لطفاً دوباره تلاش کنید.',
      startError:
        'ثبت درخواست محاسبه نمونه تست ناموفق بود. لطفاً دوباره تلاش کنید.',
      pollingRetry:
        'دریافت آخرین وضعیت محاسبه ناموفق بود. تلاش مجدد به‌صورت خودکار انجام می‌شود...',
      pollingStopped:
        'پس از چند خطای ارتباطی، به‌روزرسانی وضعیت با تأخیر مواجه شده است و تلاش مجدد به‌صورت خودکار انجام می‌شود.',
      unknownStatus:
        'سرور وضعیت پشتیبانی‌نشده‌ای برای محاسبه نمونه برگرداند. لطفاً دوباره تلاش کنید.',
      invalidResponse: 'پاسخ پیش‌نمایش سرور نامعتبر بود.',
      inputsChangedDuringRequest:
        'پیکربندی نمونه تست هنگام درخواست تغییر کرد. دوباره موجودی را بررسی کنید.',
      selectionOrderPending:
        'تا هماهنگ‌شدن برچسب‌های انتخاب‌شده با ترتیب فعلی جدول منتظر بمانید.',
      stale: 'پیش‌نمایش قبلی به‌دلیل تغییر ورودی‌های نمونه تست قدیمی شده است.',
      previewRequired:
        'برای تعیین مخاطبان مؤثر تست و هزینه، موجودی را بررسی کنید.',
      unsatisfiedWarning:
        'برچسب‌های زیر در حال حاضر مخاطب واجد شرایط کافی برای تأمین نمونه درخواستی ندارند و رد می‌شوند.',
      availabilityLabel: 'مخاطب موجود',
      tagLabel: 'برچسب',
      estimateLimitation:
        'این پیش‌نمایش موجودی فعلی مخاطبان را نشان می‌دهد. انتخاب نهایی مخاطبان تست هنگام اجرای زمان‌بند انجام می‌شود و در صورت تغییر موجودی ممکن است متفاوت باشد.',
    },
  },

  // Bundle info
  bundleInfoTitle: 'اطلاعات کمپین',
  bundle: 'عنوان کمپین',
  bundlePlaceholder: 'انتخاب کمپین',
  bundleLoading: 'در حال بارگذاری کمپین‌ها...',
  bundleLoadError: 'خطا در بارگذاری کمپین‌ها. لطفاً دوباره تلاش کنید.',
  bundleEmpty: 'هنوز کمپین‌ای ایجاد نشده است. برای ادامه یک کمپین جدید بسازید.',
  bundleCreateAction: 'ایجاد کمپین جدید',
  phase: 'فاز ارسال',
  phasePlaceholder: 'انتخاب فاز',
  phaseTest: 'فاز تست',
  phaseExecution: 'فاز اجرا',

  // Audience grade selection
  audienceGradeTitle: 'کلاس نمره مخاطب',
  audienceGradeA: 'دسته الف',
  audienceGradeB: 'دسته ب',
  audienceGradeC: 'دسته ج',

  // Common fields
  loading: 'در حال بارگذاری...',
  reset: 'بازنشانی',

  // Job fields for agencies
  agencyCategoryHeader:
    'لطفا با انتخاب دسته‌ و زیردسته نوع کسب‌وکار خود را به صورت دقیق انتخاب کنید',
  agencyCategory: 'دسته‌بندی اصلی کسب‌و‌کار شما',
  agencyJob: 'زیردسته دقیق‌تر کسب‌و‌کار شما',
  agencySelectCategory: 'انتخاب دسته‌بندی اصلی کسب و کار',
  agencySelectJob: 'انتخاب زیردسته دقیق‌تر',
  agencyCategoryRequired: 'انتخاب دسته‌بندی الزامی است',
  agencyJobRequired: 'انتخاب زیردسته الزامی است',
};

export const campaignLevelI18n = {
  en: campaignLevelEn,
  fa: campaignLevelFa,
};
