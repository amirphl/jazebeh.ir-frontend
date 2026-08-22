// Environment configuration for fixed local dev and configurable production
export interface EnvironmentConfig {
  // Domain and URL settings
  domain: string;
  baseUrl: string;
  apiUrl: string;

  // Brand settings
  brandName: string;
  brandSubtitle: string;

  // Feature flags
  features: {
    smsMarketing: boolean;
    analytics: boolean;
    autoSelectMissingPlatformSettings: boolean;
    bundleTagScores: boolean;
  };

  // API endpoints (same for all configurations)
  endpoints: {
    auth: {
      login: string;
      signup: string;
      verifyOtp: string;
      resendOtp: string;
    };
    campaigns: {
      list: string;
      create: string;
      hide: string;
      unhide: string;
      calculateCosts: string;
      calculateCapacity: string;
      calculateCost: string;
      calculateCostV2: string;
      update: string;
      testSend: string;
      audienceSpec: string;
      lastInitiated: string;
      clone: string;
      smartTargetingTags: string;
      smartTargetingSelection: string;
      smartTargetingAutoSelect: string;
      smartTargetingCapacityCalculations: string;
      smartTargetingCapacityCalculationById: string;
      smartTargetingExecutionAudienceCalculations: string;
      smartTargetingExecutionAudienceCalculationById: string;
      smartTargetingTestSamplingPreview: string;
      smartTargetingTestSamplingPreviewById: string;
      actionMetrics: string;
    };
    bundles: {
      list: string;
      get: string;
      create: string;
      update: string;
      requestTagEvaluation: string;
      tagEvaluationStatus: string;
      tagScores: string;
      smartTargetingTags: string;
      actionFiles: string;
      actionFileTemplate: string;
      actionFile: string;
      actionSummary: string;
      actionTagMetrics: string;
    };
    wallet: {
      balance: string;
    };
    lineNumbers: {
      active: string;
    };
    segmentPriceFactors: {
      listLatest: string;
    };
    media: {
      upload: string;
      download: string;
      preview: string;
    };
    platformSettings: {
      list: string;
      create: string;
    };
    analytics: {
      dashboard: string;
      reports: string;
    };
  };

  // UI/UX settings
  ui: {
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    theme: 'light' | 'dark' | 'auto';
  };

  // Localization settings (always enabled)
  localization: {
    defaultLanguage: 'en' | 'fa';
    supportedLanguages: Array<'en' | 'fa'>;
    rtlLanguages: Array<'fa'>;
  };
}

export const BUNDLE_TAG_SCORES_FEATURE_FLAG_KEY = 'feature_bundle_tag_scores';

const isLocalStorageFeatureEnabled = (key: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const localConfig: EnvironmentConfig = {
  domain: 'localhost',
  baseUrl: 'http://localhost:8081',
  apiUrl: 'http://localhost:8080/api/v1',

  brandName: 'Jazebeh',
  brandSubtitle: '',

  features: {
    smsMarketing: true,
    analytics: true,
    autoSelectMissingPlatformSettings:
      process.env.REACT_APP_ENABLE_AUTO_SELECT_MISSING_PLATFORM_SETTINGS !==
      'false',
    bundleTagScores: isLocalStorageFeatureEnabled(
      BUNDLE_TAG_SCORES_FEATURE_FLAG_KEY
    ),
  },

  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      verifyOtp: '/auth/verify',
      resendOtp: '/auth/resend-otp',
    },
    campaigns: {
      list: '/campaigns',
      create: '/campaigns',
      hide: '/campaigns/hide',
      unhide: '/campaigns/unhide',
      calculateCosts: '/campaigns/calculate-costs',
      calculateCapacity: '/campaigns/calculate-capacity',
      calculateCost: '/campaigns/calculate-cost',
      calculateCostV2: '/campaigns/calculate-cost-v2',
      update: '/campaigns/:uuid',
      testSend: '/campaigns/:uuid/test-send',
      audienceSpec: '/campaigns/audience-spec',
      lastInitiated: '/campaigns/initiated/last',
      clone: '/campaigns/:uuid/clone',
      smartTargetingTags: '/campaigns/:uuid/smart-targeting/tags',
      smartTargetingSelection: '/campaigns/:uuid/smart-targeting/selection',
      smartTargetingAutoSelect:
        '/campaigns/:uuid/smart-targeting/selection/auto',
      smartTargetingCapacityCalculations:
        '/campaigns/:uuid/smart-targeting/capacity-calculations',
      smartTargetingCapacityCalculationById:
        '/campaigns/:uuid/smart-targeting/capacity-calculations/:calculation_id',
      smartTargetingExecutionAudienceCalculations:
        '/campaigns/:uuid/smart-targeting/execution-audience-calculations',
      smartTargetingExecutionAudienceCalculationById:
        '/campaigns/:uuid/smart-targeting/execution-audience-calculations/:calculation_id',
      smartTargetingTestSamplingPreview:
        '/campaigns/:uuid/smart-targeting/test-sampling-preview',
      smartTargetingTestSamplingPreviewById:
        '/campaigns/:uuid/smart-targeting/test-sampling-preview/:calculation_id',
      actionMetrics: '/campaigns/:uuid/action-metrics',
    },
    bundles: {
      list: '/bundles',
      get: '/bundles/:id',
      create: '/bundles',
      update: '/bundles/:id',
      requestTagEvaluation: '/bundles/:id/tag-evaluations',
      tagEvaluationStatus: '/bundles/:id/tag-evaluation',
      tagScores: '/bundles/:id/tag-scores',
      smartTargetingTags: '/bundles/:id/smart-targeting/tags',
      actionFiles: '/bundles/:id/action-files',
      actionFileTemplate: '/bundles/:id/action-files/template',
      actionFile: '/bundles/:id/action-files/:fileId',
      actionSummary: '/bundles/:id/action-summary',
      actionTagMetrics: '/bundles/:id/action-tag-metrics',
    },
    wallet: {
      balance: '/wallet/balance',
    },
    lineNumbers: {
      active: '/line-numbers/active',
    },
    segmentPriceFactors: {
      listLatest: '/segment-price-factors',
    },
    media: {
      upload: '/media/upload',
      download: '/media/:uuid',
      preview: '/media/:uuid/preview',
    },
    platformSettings: {
      list: '/platform-settings',
      create: '/platform-settings',
    },
    analytics: {
      dashboard: '/analytics/dashboard',
      reports: '/analytics/reports',
    },
  },

  ui: {
    primaryColor: '#2563eb',
    logoUrl: '/Jazebeh.png',
    faviconUrl: '/favicon.ico',
    theme: 'light',
  },

  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'fa'],
    rtlLanguages: ['fa'],
  },
};

const getProductionConfig = (): EnvironmentConfig => {
  const domain = (process.env.REACT_APP_PRODUCTION_DOMAIN || '').trim();
  const baseUrl = domain ? `https://${domain}` : localConfig.baseUrl;
  const apiUrl = domain ? `https://${domain}/api/v1` : localConfig.apiUrl;

  return {
    ...localConfig,
    domain: domain || localConfig.domain,
    baseUrl,
    apiUrl,
  };
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isProd =
    process.env.REACT_APP_NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'production';
  return isProd ? getProductionConfig() : localConfig;
};

export const config = getEnvironmentConfig();

// Helper functions
export const isProduction = (): boolean => {
  return (
    process.env.REACT_APP_NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  );
};

export const isDevelopment = (): boolean => {
  return !isProduction();
};

export const isStaging = (): boolean => {
  return false; // No staging environment
};

export const getApiUrl = (endpoint: string): string => {
  return `${config.apiUrl}${endpoint}`;
};

export const getFullUrl = (path: string): string => {
  return `${config.baseUrl}${path}`;
};
