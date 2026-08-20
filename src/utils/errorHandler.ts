// Error handling utility for mapping backend error codes to user-friendly messages

export interface ErrorMessage {
  en: string;
  fa: string;
}

// Error code to message mapping
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Signup errors
  EMAIL_EXISTS: {
    en: 'An account with this email already exists',
    fa: 'حسابی با این ایمیل قبلاً وجود دارد',
  },
  MOBILE_EXISTS: {
    en: 'An account with this mobile number already exists',
    fa: 'حسابی با این شماره موبایل قبلاً وجود دارد',
  },
  NATIONAL_ID_EXISTS: {
    en: 'An account with this national ID already exists',
    fa: 'حسابی با این کد ملی قبلاً وجود دارد',
  },
  ACCOUNT_TYPE_NOT_FOUND: {
    en: 'Selected account type is not valid',
    fa: 'نوع حساب انتخاب شده معتبر نیست',
  },
  COMPANY_FIELDS_REQUIRED: {
    en: 'Company information is required for business accounts',
    fa: 'اطلاعات شرکت برای حساب‌های تجاری الزامی است',
  },
  REFERRER_AGENCY_NOT_FOUND: {
    en: 'Referrer agency not found',
    fa: 'آژانس معرف یافت نشد',
  },
  REFERRER_MUST_BE_AGENCY: {
    en: 'Referrer must be a marketing agency',
    fa: 'معرف باید یک آژانس بازاریابی باشد',
  },
  REFERRER_AGENCY_INACTIVE: {
    en: 'Referrer agency is inactive',
    fa: 'آژانس معرف غیرفعال است',
  },
  SIGNUP_FAILED: {
    en: 'Account creation failed. Please try again',
    fa: 'ایجاد حساب ناموفق بود. لطفاً دوباره تلاش کنید',
  },

  // Login errors
  CUSTOMER_NOT_FOUND: {
    en: 'Account not found. Please check your credentials',
    fa: 'حساب یافت نشد. لطفاً اطلاعات خود را بررسی کنید',
  },
  ACCOUNT_INACTIVE: {
    en: 'Your account is inactive. Please contact support',
    fa: 'حساب شما غیرفعال است. لطفاً با پشتیبانی تماس بگیرید',
  },
  INCORRECT_PASSWORD: {
    en: 'Incorrect password. Please try again',
    fa: 'رمز عبور اشتباه است. لطفاً دوباره تلاش کنید',
  },
  LOGIN_FAILED: {
    en: 'Login failed. Please try again',
    fa: 'ورود ناموفق بود. لطفاً دوباره تلاش کنید',
  },

  // OTP errors
  NO_VALID_OTP: {
    en: 'No valid verification code found. Please request a new one',
    fa: 'کد تایید معتبری یافت نشد. لطفاً کد جدیدی درخواست کنید',
  },
  INVALID_OTP_CODE: {
    en: 'Invalid verification code. Please check and try again',
    fa: 'کد تایید نامعتبر است. لطفاً بررسی کرده و دوباره تلاش کنید',
  },
  INVALID_OTP_TYPE: {
    en: 'Invalid verification method. Please try again',
    fa: 'روش تایید نامعتبر است. لطفاً دوباره تلاش کنید',
  },
  INVALID_CUSTOMER_ID: {
    en: 'Invalid customer ID. Please try again',
    fa: 'شناسه مشتری نامعتبر است. لطفاً دوباره تلاش کنید',
  },
  INVALID_IDENTIFIER: {
    en: 'Please enter a valid email address or mobile number',
    fa: 'لطفاً ایمیل یا شماره موبایل معتبر وارد کنید',
  },
  INVALID_PASSWORD: {
    en: 'Please enter a valid password',
    fa: 'لطفاً رمز عبور معتبر وارد کنید',
  },
  INVALID_MOBILE_NUMBER: {
    en: 'Please enter a valid mobile number',
    fa: 'لطفاً شماره موبایل معتبر وارد کنید',
  },
  INVALID_URL: {
    en: 'Unable to send the request. Please try again',
    fa: 'ارسال درخواست ممکن نیست. لطفاً دوباره تلاش کنید',
  },
  INVALID_RESPONSE_CONTENT_TYPE: {
    en: 'Received an invalid response from the server. Please try again',
    fa: 'پاسخ معتبری از سرور دریافت نشد. لطفاً دوباره تلاش کنید',
  },
  INVALID_RESPONSE: {
    en: 'Received an invalid response from the server. Please try again',
    fa: 'پاسخ معتبری از سرور دریافت نشد. لطفاً دوباره تلاش کنید',
  },
  OTP_EXPIRED: {
    en: 'Verification code has expired. Please request a new one',
    fa: 'کد تایید منقضی شده است. لطفاً کد جدیدی درخواست کنید',
  },
  OTP_VERIFICATION_FAILED: {
    en: 'Verification failed. Please try again',
    fa: 'تایید ناموفق بود. لطفاً دوباره تلاش کنید',
  },

  // Password reset errors
  PASSWORD_RESET_FAILED: {
    en: 'Password reset failed. Please try again',
    fa: 'بازنشانی رمز عبور ناموفق بود. لطفاً دوباره تلاش کنید',
  },

  // Resend OTP errors
  ACCOUNT_ALREADY_VERIFIED: {
    en: 'Your account is already verified',
    fa: 'حساب شما قبلاً تایید شده است',
  },
  RESEND_OTP_FAILED: {
    en: 'Failed to send verification code. Please try again',
    fa: 'ارسال کد تایید ناموفق بود. لطفاً دوباره تلاش کنید',
  },

  // Campaign errors
  CAMPAIGN_CREATION_FAILED: {
    en: 'Campaign creation failed. Please try again',
    fa: 'ایجاد کمپین ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  CAMPAIGN_NOT_FOUND: {
    en: 'Campaign not found',
    fa: 'کمپین یافت نشد',
  },
  HIDE_CAMPAIGNS_FAILED: {
    en: 'Failed to hide selected campaigns. Please try again',
    fa: 'مخفی‌سازی ارسال‌های انتخاب‌شده ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  UNHIDE_CAMPAIGNS_FAILED: {
    en: 'Failed to unhide selected campaigns. Please try again',
    fa: 'نمایش مجدد ارسال‌های انتخاب‌شده ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  INVALID_CAMPAIGN_DATA: {
    en: 'Invalid campaign data provided',
    fa: 'داده‌های کمپین نامعتبر است',
  },
  COST_CALCULATION_FAILED: {
    en: 'Failed to calculate campaign costs. Please try again',
    fa: 'محاسبه هزینه‌های کمپین ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  INVALID_SEGMENT_CONFIGURATION: {
    en: 'Invalid segment configuration for cost calculation',
    fa: 'تنظیمات بخش‌بندی برای محاسبه هزینه نامعتبر است',
  },
  INVALID_BUDGET_RANGE: {
    en: 'Budget amount is outside the allowed range',
    fa: 'مقدار بودجه خارج از محدوده مجاز است',
  },
  INVALID_LINE_NUMBER: {
    en: 'Invalid line number provided for cost calculation',
    fa: 'سرشماره ارائه شده برای محاسبه هزینه نامعتبر است',
  },
  COST_CALCULATION_TIMEOUT: {
    en: 'Cost calculation timed out. Please try again',
    fa: 'محاسبه هزینه زمان‌بندی شد. لطفاً دوباره تلاش کنید',
  },
  CAMPAIGN_ALREADY_EXISTS: {
    en: 'A campaign with this configuration already exists',
    fa: 'کمپینی با این تنظیمات قبلاً وجود دارد',
  },
  CAMPAIGN_LIMIT_EXCEEDED: {
    en: 'Campaign limit exceeded. Please contact support',
    fa: 'محدودیت کمپین تجاوز شده است. لطفاً با پشتیبانی تماس بگیرید',
  },
  CAMPAIGN_BUDGET_EXCEEDED: {
    en: 'Campaign budget exceeds your account limit',
    fa: 'بودجه کمپین از محدودیت حساب شما تجاوز می‌کند',
  },
  CAMPAIGN_SEGMENT_INVALID: {
    en: 'Invalid campaign segment configuration',
    fa: 'تنظیمات بخش‌بندی کمپین نامعتبر است',
  },
  CAMPAIGN_CONTENT_INVALID: {
    en: 'Invalid campaign content provided',
    fa: 'محتوای کمپین نامعتبر است',
  },
  CAMPAIGN_SCHEDULE_INVALID: {
    en: 'Invalid campaign schedule provided',
    fa: 'زمان‌بندی کمپین نامعتبر است',
  },
  CAMPAIGN_AUDIENCE_TARGETING_METHOD_INVALID: {
    en: 'Please select a valid audience targeting method',
    fa: 'لطفاً یک روش هدف‌گیری معتبر انتخاب کنید',
  },
  SMART_TARGETING_TAGS_REQUIRED: {
    en: 'At least one tag must be selected for Smart Targeting',
    fa: 'برای هدف‌گیری هوشمند حداقل یک برچسب باید انتخاب شود',
  },
  SMART_TARGETING_TAG_INVALID: {
    en: 'One or more selected Smart Targeting tags are invalid',
    fa: 'یک یا چند برچسب هدف‌گیری هوشمند نامعتبر است',
  },
  SMART_TARGETING_SORT_INVALID: {
    en: 'The selected Smart Targeting sort option is not available',
    fa: 'گزینه مرتب‌سازی هدف‌گیری هوشمند در دسترس نیست',
  },
  SMART_TARGETING_SCORE_UNAVAILABLE: {
    en: 'Bundle persona fit score sorting is unavailable for this bundle',
    fa: 'مرتب‌سازی بر اساس امتیاز تناسب پرسونا برای این کمپین در دسترس نیست',
  },
  SMART_TARGETING_SEARCH_TOO_LONG: {
    en: 'Smart Targeting search must be 200 characters or fewer',
    fa: 'جستجوی هدف‌گیری هوشمند باید حداکثر ۲۰۰ کاراکتر باشد',
  },
  SMART_TARGETING_COUNT_INVALID: {
    en: 'Enter a valid number of tags for automatic selection',
    fa: 'تعداد معتبری برای انتخاب خودکار برچسب‌ها وارد کنید',
  },
  SMART_TARGETING_SELECTION_INVALID: {
    en: 'At least one tag must be selected for Smart Targeting',
    fa: 'برای هدف‌گیری هوشمند حداقل یک برچسب باید انتخاب شود',
  },
  SMART_TARGETING_TAG_LIST_FAILED: {
    en: 'Failed to load Smart Targeting tags. Please try again',
    fa: 'بارگذاری برچسب‌های هدف‌گیری هوشمند ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  SMART_TARGETING_SELECTION_LOOKUP_FAILED: {
    en: 'Failed to load the saved Smart Targeting selection',
    fa: 'بارگذاری انتخاب ذخیره‌شده هدف‌گیری هوشمند ناموفق بود',
  },
  SMART_TARGETING_SELECTION_SAVE_FAILED: {
    en: 'Failed to save Smart Targeting selection. Please try again',
    fa: 'ذخیره انتخاب هدف‌گیری هوشمند ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  SMART_TARGETING_AUTO_SELECT_INVALID: {
    en: 'Enter a valid number of tags for automatic selection',
    fa: 'تعداد معتبری برای انتخاب خودکار برچسب‌ها وارد کنید',
  },
  SMART_TARGETING_AUTO_SELECT_FAILED: {
    en: 'Failed to automatically select Smart Targeting tags. Please try again',
    fa: 'انتخاب خودکار برچسب‌های هدف‌گیری هوشمند ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  SMART_TARGETING_SCORE_CLASSES_INVALID: {
    en: 'One or more selected audience score classes are invalid',
    fa: 'یک یا چند کلاس نمره مخاطب انتخاب‌شده نامعتبر است',
  },
  SMART_TARGETING_CAPACITY_UNAVAILABLE: {
    en: 'Exact capacity calculation is currently unavailable',
    fa: 'محاسبه ظرفیت دقیق در حال حاضر در دسترس نیست',
  },
  SMART_TARGETING_CAPACITY_REQUEST_FAILED: {
    en: 'Failed to request the exact-capacity calculation. Please try again',
    fa: 'ثبت درخواست محاسبه ظرفیت دقیق ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  SMART_TARGETING_CAPACITY_LOOKUP_FAILED: {
    en: 'Failed to load the exact-capacity calculation. Please try again',
    fa: 'بارگذاری محاسبه ظرفیت دقیق ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  SMART_TARGETING_CAPACITY_CALCULATION_NOT_FOUND: {
    en: 'The exact-capacity calculation could not be found',
    fa: 'محاسبه ظرفیت دقیق موردنظر یافت نشد',
  },
  SMART_TARGETING_CAPACITY_CALCULATION_ACTIVE: {
    en: 'An exact-capacity calculation is already in progress',
    fa: 'یک محاسبه ظرفیت دقیق هم‌اکنون در حال انجام است',
  },
  INVALID_STATE: {
    en: 'Another request is already in progress',
    fa: 'درخواست دیگری هم‌اکنون در حال پردازش است',
  },
  SMART_TARGETING_CAPACITY_PENDING: {
    en: 'Exact Smart Targeting capacity is being calculated. Please wait and try again',
    fa: 'ظرفیت دقیق هدف‌گیری هوشمند در حال محاسبه است. لطفاً منتظر بمانید و دوباره تلاش کنید',
  },
  SMART_TARGETING_EXACT_CAPACITY_REQUIRED: {
    en: 'Recalculate the current exact Smart Targeting capacity before proceeding',
    fa: 'پیش از ادامه، ظرفیت دقیق فعلی هدف‌گیری هوشمند را دوباره محاسبه کنید',
  },
  SMART_TARGETING_CAPACITY_RECALCULATION_REQUIRED: {
    en: 'This capacity result is no longer valid. Recalculate it',
    fa: 'این نتیجه ظرفیت دیگر معتبر نیست. آن را دوباره محاسبه کنید',
  },
  SMART_TARGETING_CAPACITY_FAILED: {
    en: 'Exact-capacity calculation failed. Please try again',
    fa: 'محاسبه ظرفیت دقیق با خطا مواجه شد. لطفاً دوباره تلاش کنید',
  },
  SMART_TARGETING_EXECUTION_CALCULATION_REQUIRED: {
    en: 'Request and wait for a current Smart Targeting audience reservation before finishing',
    fa: 'پیش از تکمیل، رزرو فعلی مخاطبان هدف‌گیری هوشمند را درخواست دهید و منتظر بمانید',
  },
  SMART_TARGETING_EXECUTION_CALCULATION_STALE: {
    en: 'The Smart Targeting audience reservation is no longer current. Recalculate exact capacity.',
    fa: 'رزرو مخاطبان هدف‌گیری هوشمند دیگر معتبر نیست. ظرفیت دقیق را دوباره محاسبه کنید',
  },
  SMART_TARGETING_EXECUTION_CALCULATION_FAILED: {
    en: 'The Smart Targeting audience reservation failed. Adjust the campaign and try again.',
    fa: 'رزرو مخاطبان هدف‌گیری هوشمند ناموفق بود. ارسال را اصلاح کرده و دوباره تلاش کنید',
  },
  SMART_TARGETING_EXECUTION_CALCULATION_LOOKUP_FAILED: {
    en: 'The latest audience reservation status could not be loaded. Retrying automatically.',
    fa: 'آخرین وضعیت رزرو مخاطبان بارگذاری نشد. تلاش مجدد به‌صورت خودکار انجام می‌شود',
  },
  SMART_TARGETING_EXECUTION_CALCULATION_COMMIT_FAILED: {
    en: 'The audience reservation could not be committed. Retry to continue.',
    fa: 'ثبت رزرو مخاطبان ناموفق بود. برای ادامه دوباره تلاش کنید',
  },
  SMART_TARGETING_EXECUTION_CALCULATION_COMMITTED: {
    en: 'This audience reservation was already used. Refresh the campaign before trying again.',
    fa: 'این رزرو مخاطبان قبلاً استفاده شده است. پیش از تلاش دوباره، ارسال را تازه‌سازی کنید',
  },
  INSUFFICIENT_CAPACITY: {
    en: 'There is not enough available audience capacity. Lower the budget or change targeting.',
    fa: 'ظرفیت مخاطبان کافی نیست. بودجه را کاهش دهید یا هدف‌گیری را تغییر دهید',
  },
  CAMPAIGN_FINALIZE_STALE: {
    en: 'Campaign data changed before finalization. Recalculate exact capacity and try again.',
    fa: 'داده‌های ارسال پیش از تکمیل تغییر کرده‌اند. ظرفیت دقیق را دوباره محاسبه کنید',
  },
  SMART_TARGETING_APPROVED_ALLOCATION_FAILED: {
    en: 'Approved Campaign allocations could not be applied to the capacity',
    fa: 'اعمال تخصیص ارسال‌های تأییدشده بر ظرفیت ناموفق بود',
  },
  SMART_TARGETING_SAMPLE_SIZE_REQUIRED: {
    en: 'Sample Size per Tag is required for Smart Targeting Test campaigns',
    fa: 'اندازه نمونه برای هر برچسب در ارسال تست هدف‌گیری هوشمند الزامی است',
  },
  SMART_TARGETING_SAMPLE_SIZE_INVALID: {
    en: 'Sample Size per Tag must be a positive whole number',
    fa: 'اندازه نمونه برای هر برچسب باید یک عدد صحیح مثبت باشد',
  },
  SMART_TARGETING_TEST_PREVIEW_REQUIRED: {
    en: 'A current Smart Targeting Test sample preview is required',
    fa: 'پیش‌نمایش فعلی نمونه تست هدف‌گیری هوشمند الزامی است',
  },
  SMART_TARGETING_TEST_NO_SATISFIED_TAGS: {
    en: 'No selected tag can currently provide the full requested Test sample',
    fa: 'هیچ‌یک از برچسب‌های انتخاب‌شده اکنون نمی‌تواند کل نمونه تست درخواستی را تأمین کند',
  },
  SMART_TARGETING_TEST_AUDIENCE_COUNT_OVERFLOW: {
    en: 'The requested Smart Targeting Test audience count is too large',
    fa: 'تعداد مخاطبان درخواستی تست هدف‌گیری هوشمند بیش از حد مجاز است',
  },
  SMART_TARGETING_TEST_PREVIEW_FAILED: {
    en: 'Failed to check Smart Targeting Test sample availability',
    fa: 'بررسی موجودی نمونه تست هدف‌گیری هوشمند ناموفق بود',
  },
  SMART_TARGETING_TEST_SAMPLING_REQUEST_FAILED: {
    en: 'Failed to request the Smart Targeting Test sampling calculation',
    fa: 'ثبت درخواست محاسبه نمونه تست هدف‌گیری هوشمند ناموفق بود',
  },
  SMART_TARGETING_TEST_SAMPLING_LOOKUP_FAILED: {
    en: 'Failed to load the Smart Targeting Test sampling calculation',
    fa: 'بارگذاری محاسبه نمونه تست هدف‌گیری هوشمند ناموفق بود',
  },
  SMART_TARGETING_TEST_SAMPLING_CALCULATION_NOT_FOUND: {
    en: 'The Smart Targeting Test sampling calculation could not be found',
    fa: 'محاسبه نمونه تست هدف‌گیری هوشمند موردنظر یافت نشد',
  },
  SMART_TARGETING_TEST_SAMPLING_ACTIVE: {
    en: 'A Smart Targeting Test sampling calculation is already in progress',
    fa: 'یک محاسبه نمونه تست هدف‌گیری هوشمند هم‌اکنون در حال انجام است',
  },
  SMART_TARGETING_TEST_SAMPLING_FAILED: {
    en: 'Smart Targeting Test sampling calculation failed. Please try again',
    fa: 'محاسبه نمونه تست هدف‌گیری هوشمند با خطا مواجه شد. لطفاً دوباره تلاش کنید',
  },
  CAMPAIGN_COST_OVERFLOW: {
    en: 'The calculated campaign cost exceeds the supported range',
    fa: 'هزینه محاسبه‌شده ارسال بیش از محدوده پشتیبانی‌شده است',
  },
  INVALID_CALCULATION_ID: {
    en: 'The calculation ID is invalid',
    fa: 'شناسه محاسبه نامعتبر است',
  },

  // Bundle errors
  INVALID_BUNDLE_ID: {
    en: 'Invalid bundle ID provided',
    fa: 'شناسه کمپین نامعتبر است',
  },
  MISSING_CUSTOMER_ID: {
    en: 'Customer information is missing. Please sign in again',
    fa: 'اطلاعات مشتری موجود نیست. لطفاً دوباره وارد شوید',
  },
  BUNDLE_NOT_FOUND: {
    en: 'Bundle not found',
    fa: 'کمپین یافت نشد',
  },
  BUNDLE_ACCESS_DENIED: {
    en: 'You do not have access to this bundle',
    fa: 'شما به این کمپین دسترسی ندارید',
  },
  CREATE_BUNDLE_VALIDATION_FAILED: {
    en: 'Bundle validation failed. Please review the form and try again',
    fa: 'اعتبارسنجی کمپین ناموفق بود. لطفاً فرم را بررسی کرده و دوباره تلاش کنید',
  },
  CREATE_BUNDLE_FAILED: {
    en: 'Failed to create the bundle. Please try again',
    fa: 'ایجاد کمپین ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  UPDATE_BUNDLE_FAILED: {
    en: 'Failed to update the bundle. Please try again',
    fa: 'ویرایش کمپین ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  GET_BUNDLE_FAILED: {
    en: 'Failed to retrieve the bundle',
    fa: 'دریافت کمپین ناموفق بود',
  },
  LIST_BUNDLES_FAILED: {
    en: 'Failed to retrieve bundles',
    fa: 'دریافت کمپین‌ها ناموفق بود',
  },
  SMART_TAG_EVALUATION_DISABLED: {
    en: 'Smart tag evaluation is currently unavailable',
    fa: 'ارزیابی هوشمند برچسب‌ها در حال حاضر در دسترس نیست',
  },
  BUNDLE_TAG_EVALUATION_ACTIVE: {
    en: 'Tag evaluation is already in progress for this bundle',
    fa: 'ارزیابی برچسب‌ها برای این کمپین در حال انجام است',
  },
  REQUEST_BUNDLE_TAG_EVALUATION_FAILED: {
    en: 'Failed to start tag evaluation. Please try again',
    fa: 'شروع ارزیابی برچسب‌ها ناموفق بود. لطفاً دوباره تلاش کنید',
  },
  GET_BUNDLE_TAG_EVALUATION_STATUS_FAILED: {
    en: 'Failed to retrieve the tag evaluation status',
    fa: 'دریافت وضعیت ارزیابی برچسب‌ها ناموفق بود',
  },
  LIST_BUNDLE_TAG_SCORES_FAILED: {
    en: 'Failed to retrieve the tag scores',
    fa: 'دریافت امتیازهای برچسب‌ها ناموفق بود',
  },
  INVALID_PAGE: {
    en: 'Invalid page number provided',
    fa: 'شماره صفحه نامعتبر است',
  },
  INVALID_LIMIT: {
    en: 'Invalid page size provided',
    fa: 'تعداد نمایش در صفحه نامعتبر است',
  },
  INVALID_PAGE_SIZE: {
    en: 'Invalid page size provided',
    fa: 'تعداد نمایش در صفحه نامعتبر است',
  },

  // Generic errors
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection and try again',
    fa: 'خطای شبکه. لطفاً اتصال خود را بررسی کرده و دوباره تلاش کنید',
  },
  UNKNOWN_ERROR: {
    en: 'An unexpected error occurred. Please try again',
    fa: 'خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید',
  },
  VALIDATION_ERROR: {
    en: 'Please check your input and try again',
    fa: 'لطفاً ورودی خود را بررسی کرده و دوباره تلاش کنید',
  },
  MISSING_ACCESS_TOKEN: {
    en: 'Authentication is missing. Please sign in again',
    fa: 'اطلاعات احراز هویت موجود نیست. لطفاً دوباره وارد شوید',
  },
  INVALID_REQUEST: {
    en: 'The request is invalid. Please review your input and try again',
    fa: 'درخواست نامعتبر است. لطفاً ورودی را بررسی کرده و دوباره تلاش کنید',
  },
  UNAUTHORIZED: {
    en: 'You are not authorized to perform this action',
    fa: 'شما مجاز به انجام این عملیات نیستید',
  },
  RATE_LIMITED: {
    en: 'Too many requests. Please wait a moment and try again',
    fa: 'درخواست‌های زیادی ارسال شده. لطفاً لحظه‌ای صبر کرده و دوباره تلاش کنید',
  },
  FORBIDDEN: {
    en: 'Access denied. Please contact support if you believe this is an error',
    fa: 'دسترسی رد شد. اگر فکر می‌کنید این خطا است، با پشتیبانی تماس بگیرید',
  },
  NOT_FOUND: {
    en: 'The requested resource was not found',
    fa: 'منبع درخواستی یافت نشد',
  },
  INTERNAL_SERVER_ERROR: {
    en: 'Server error. Please try again later',
    fa: 'خطای سرور. لطفاً بعداً تلاش کنید',
  },
  SERVICE_UNAVAILABLE: {
    en: 'Service temporarily unavailable. Please try again later',
    fa: 'سرویس موقتاً در دسترس نیست. لطفاً بعداً تلاش کنید',
  },
  TIMEOUT_ERROR: {
    en: 'Request timed out. Please try again',
    fa: 'مهلت درخواست به پایان رسید. لطفاً دوباره تلاش کنید',
  },
  RATE_LIMIT_EXCEEDED: {
    en: 'Too many requests. Please wait a moment and try again',
    fa: 'درخواست‌های زیادی ارسال شده. لطفاً لحظه‌ای صبر کرده و دوباره تلاش کنید',
  },
  INSUFFICIENT_PERMISSIONS: {
    en: 'You do not have sufficient permissions for this action',
    fa: 'شما مجوز کافی برای این عملیات ندارید',
  },
  RESOURCE_LOCKED: {
    en: 'Resource is currently locked. Please try again later',
    fa: 'منبع در حال حاضر قفل شده است. لطفاً بعداً تلاش کنید',
  },
  CONFLICT_ERROR: {
    en: 'Resource conflict detected. Please check your data and try again',
    fa: 'تضاد منبع تشخیص داده شد. لطفاً داده‌های خود را بررسی کرده و دوباره تلاش کنید',
  },
};

const normalizeErrorCode = (errorCode: string): string =>
  errorCode
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

/**
 * Get user-friendly error message for a given error code
 * @param errorCode - The backend error code
 * @param language - The language code ('en' or 'fa')
 * @param fallbackMessage - Optional fallback message if error code not found
 * @returns User-friendly error message in the specified language
 */
export function getErrorMessage(
  errorCode: string | undefined,
  language: 'en' | 'fa' = 'en',
  fallbackMessage?: string
): string {
  if (!errorCode) {
    return fallbackMessage || ERROR_MESSAGES['UNKNOWN_ERROR'][language];
  }

  const errorMessage = ERROR_MESSAGES[errorCode];
  if (errorMessage) {
    return errorMessage[language];
  }

  const normalizedErrorCode = normalizeErrorCode(errorCode);
  const normalizedErrorMessage = ERROR_MESSAGES[normalizedErrorCode];
  if (normalizedErrorMessage) {
    return normalizedErrorMessage[language];
  }

  if (normalizedErrorCode.startsWith('MISSING_REQUIRED_FIELD')) {
    return ERROR_MESSAGES['VALIDATION_ERROR'][language];
  }

  // If error code not found, try to provide a generic message
  if (normalizedErrorCode.includes('VALIDATION')) {
    return ERROR_MESSAGES['VALIDATION_ERROR'][language];
  }
  if (
    normalizedErrorCode.includes('NETWORK') ||
    normalizedErrorCode.includes('TIMEOUT')
  ) {
    return ERROR_MESSAGES['NETWORK_ERROR'][language];
  }
  if (
    normalizedErrorCode.includes('RATE_LIMIT') ||
    normalizedErrorCode.includes('TOO_MANY_REQUEST')
  ) {
    return ERROR_MESSAGES['RATE_LIMIT_EXCEEDED'][language];
  }
  if (
    normalizedErrorCode.includes('UNAUTHORIZED') ||
    normalizedErrorCode.includes('AUTH')
  ) {
    return ERROR_MESSAGES['UNAUTHORIZED'][language];
  }
  if (normalizedErrorCode.includes('FORBIDDEN')) {
    return ERROR_MESSAGES['FORBIDDEN'][language];
  }
  if (normalizedErrorCode.includes('NOT_FOUND')) {
    return ERROR_MESSAGES['NOT_FOUND'][language];
  }
  if (
    normalizedErrorCode.includes('SERVER') ||
    normalizedErrorCode.includes('INTERNAL')
  ) {
    return ERROR_MESSAGES['INTERNAL_SERVER_ERROR'][language];
  }

  // Return fallback or unknown error message
  return fallbackMessage || ERROR_MESSAGES['UNKNOWN_ERROR'][language];
}

/**
 * Get error message for API response
 * @param response - The API response object
 * @param language - The language code ('en' or 'fa')
 * @param fallbackMessage - Optional fallback message
 * @returns User-friendly error message
 */
export function getApiErrorMessage(
  response: {
    success: boolean;
    message?: string;
    error?: { code?: string; details?: any };
  },
  language: 'en' | 'fa' = 'en',
  fallbackMessage?: string
): string {
  // If response has a message, use it as fallback
  const responseMessage = response.message;

  // Get error code from response
  const errorCode = response.error?.code;

  // Get the user-friendly message
  return getErrorMessage(
    errorCode,
    language,
    responseMessage || fallbackMessage
  );
}

/**
 * Check if an error is a specific type
 * @param errorCode - The error code to check
 * @param expectedCode - The expected error code
 * @returns True if the error matches the expected code
 */
export function isErrorType(
  errorCode: string | undefined,
  expectedCode: string
): boolean {
  return errorCode === expectedCode;
}

/**
 * Check if an error is a validation error
 * @param errorCode - The error code to check
 * @returns True if it's a validation error
 */
export function isValidationError(errorCode: string | undefined): boolean {
  return errorCode
    ? errorCode.includes('VALIDATION') || errorCode.includes('REQUIRED')
    : false;
}

/**
 * Check if an error is a network error
 * @param errorCode - The error code to check
 * @returns True if it's a network error
 */
export function isNetworkError(errorCode: string | undefined): boolean {
  return errorCode
    ? errorCode.includes('NETWORK') || errorCode.includes('TIMEOUT')
    : false;
}

/**
 * Check if an error is an authentication error
 * @param errorCode - The error code to check
 * @returns True if it's an authentication error
 */
export function isAuthenticationError(errorCode: string | undefined): boolean {
  return errorCode
    ? errorCode.includes('AUTH') ||
        errorCode.includes('UNAUTHORIZED') ||
        errorCode.includes('INVALID')
    : false;
}

/**
 * Clear all user-related data from localStorage
 * This function should be called during logout to ensure complete cleanup
 */
export function clearAllUserData(): void {
  // Get all localStorage keys
  const allKeys = Object.keys(localStorage);

  // Clear all items except user preferences
  allKeys.forEach(key => {
    if (
      !key.includes('language') &&
      !key.includes('theme') &&
      !key.includes('ui_')
    ) {
      localStorage.removeItem(key);
    } else {
    }
  });
}

/**
 * Clear campaign data from localStorage
 * This function should be called when campaign is finished or during logout
 */
export function clearCampaignData(): void {
  // Clear campaign-specific items
  localStorage.removeItem('campaign_creation_data');
  localStorage.removeItem('campaign_creation_step');
}

/**
 * Check if a logout is required based on error code
 * @param errorCode - The error code to check
 * @returns True if logout is required
 */
export function requiresLogout(errorCode: string | undefined): boolean {
  if (!errorCode) return false;

  const logoutErrors = [
    'UNAUTHORIZED',
    'FORBIDDEN',
    'TOKEN_EXPIRED',
    'INVALID_TOKEN',
    'ACCOUNT_INACTIVE',
    'SESSION_EXPIRED',
  ];

  return logoutErrors.some(error => errorCode.includes(error));
}
