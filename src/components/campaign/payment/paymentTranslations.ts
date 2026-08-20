const paymentEn = {
  // Step header
  title: 'Payment & Confirmation',
  subtitle: 'Review and confirm your campaign details',

  // Cost breakdown section
  costBreakdown: 'Cost Breakdown',
  calculatingCosts: 'Calculating costs...',
  total: 'Total',
  estimatedMessages: 'Estimated Messages',
  messages: 'messages',
  costCalculationError: 'Failed to calculate costs',
  retryCalculation: 'Retry Calculation',
  calculatingCostsMessage: 'Calculating costs...',
  completeDetailsMessage: 'Complete campaign details to see cost breakdown',
  campaignIdRequiredForCostCalculation:
    'Campaign ID is missing. Please create the campaign again before calculating costs.',
  exactCapacityRequiredForCostCalculation:
    'Calculate the current exact Smart Targeting capacity before calculating costs.',
  zeroExactCapacity:
    'No usable Smart Targeting audience is available for cost calculation.',
  testPreviewRequiredForCostCalculation:
    'Check current Smart Targeting Test sample availability before reviewing payment.',
  requestedAudienceExceedsExactCapacity:
    'The requested audience count exceeds the exact usable capacity.',
  note: 'Note:',
  costPerMessage: 'Cost per message',
  linePriceFactor: 'Line price factor',

  // Wallet balance section
  walletBalance: 'Wallet Balance',
  availableBalance: 'Available Balance',
  campaignCost: 'Campaign Cost',
  sufficientBalance: 'Sufficient balance for campaign',
  insufficientBalance: 'Insufficient balance for campaign',
  insufficientBalanceMessage:
    'You need to add more funds to your wallet to proceed with this campaign.',
  goToWallet: 'Go to Wallet & Charge',
  balanceError: 'Failed to check wallet balance',
  balanceErrorHelp: 'Please try again later or contact support.',
  balanceNotAvailable: 'Wallet balance not available',
  balanceHelp: 'Your wallet balance is checked against the campaign cost.',
  reservationTitle: 'Audience Reservation',
  reservationSaving: 'Saving the final campaign details…',
  reservationRequesting: 'Requesting your audience reservation…',
  reservationPolling:
    'Preparing the audience reservation. This can take a moment…',
  reservationCommitting: 'Committing the audience reservation…',
  reservationRetryable:
    'Reservation updates are temporarily unavailable. Retry to continue.',
  reservationFailed: 'The audience reservation could not be prepared.',
  reservationRetry: 'Retry reservation',
};

const paymentFa = {
  // Step header
  title: 'پرداخت و تأیید',
  subtitle: 'جزئیات کمپین خود را بررسی و تأیید کنید',

  // Cost breakdown section
  costBreakdown: 'تجزیه هزینه',
  calculatingCosts: 'در حال محاسبه هزینه‌ها...',
  total: 'مجموع',
  estimatedMessages: 'تعداد پیام‌های تخمینی',
  messages: 'پیام',
  costCalculationError: 'خطا در محاسبه هزینه‌ها',
  retryCalculation: 'تلاش مجدد',
  calculatingCostsMessage: 'در حال محاسبه هزینه‌ها...',
  completeDetailsMessage: 'جزئیات کمپین را تکمیل کنید تا تجزیه هزینه را ببینید',
  campaignIdRequiredForCostCalculation:
    'شناسه کمپین موجود نیست. لطفاً پیش از محاسبه هزینه‌ها، دوباره کمپین را ایجاد کنید.',
  exactCapacityRequiredForCostCalculation:
    'پیش از محاسبه هزینه، ظرفیت دقیق فعلی هدف‌گیری هوشمند را محاسبه کنید.',
  zeroExactCapacity:
    'برای محاسبه هزینه، مخاطب قابل استفاده‌ای در هدف‌گیری هوشمند موجود نیست.',
  testPreviewRequiredForCostCalculation:
    'پیش از بررسی پرداخت، موجودی فعلی نمونه تست هدف‌گیری هوشمند را بررسی کنید.',
  requestedAudienceExceedsExactCapacity:
    'تعداد مخاطبان انتخاب‌شده بیشتر از ظرفیت دقیق قابل استفاده است.',
  note: 'توجه:',
  costPerMessage: 'تعرفه هر پیام ارسالی شما',
  linePriceFactor: 'ضریب خط ارسالی',

  // Wallet balance section
  walletBalance: 'موجودی کیف پول',
  availableBalance: 'موجودی در دسترس',
  campaignCost: 'هزینه ارسال',
  sufficientBalance: 'موجودی کافی برای ارسال',
  insufficientBalance: 'موجودی ناکافی برای ارسال',
  insufficientBalanceMessage:
    'برای ادامه این ارسال باید موجودی کیف پول خود را افزایش دهید.',
  goToWallet: 'رفتن به بخش مدیریت مالی',
  balanceError: 'خطا در بررسی موجودی کیف پول',
  balanceErrorHelp: 'لطفاً بعداً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.',
  balanceNotAvailable: 'موجودی کیف پول در دسترس نیست',
  balanceHelp: 'موجودی کیف پول شما در برابر هزینه ارسال بررسی می‌شود.',
  reservationTitle: 'رزرو مخاطبان',
  reservationSaving: 'در حال ذخیره جزئیات نهایی ارسال…',
  reservationRequesting: 'در حال درخواست رزرو مخاطبان…',
  reservationPolling: 'در حال آماده‌سازی رزرو مخاطبان. ممکن است کمی زمان ببرد…',
  reservationCommitting: 'در حال ثبت رزرو مخاطبان…',
  reservationRetryable:
    'به‌روزرسانی رزرو موقتاً در دسترس نیست. برای ادامه دوباره تلاش کنید.',
  reservationFailed: 'آماده‌سازی رزرو مخاطبان ناموفق بود.',
  reservationRetry: 'تلاش مجدد برای رزرو',
};

export const paymentI18n = {
  en: paymentEn,
  fa: paymentFa,
};
