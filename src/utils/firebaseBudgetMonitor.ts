// Firebase Budget Monitoring Utilities
// Use this when you upgrade to Blaze plan

interface UsageStats {
  storageUsed: number; // in bytes
  operationsUsed: number;
  dailyDownloads: number; // in bytes
  estimatedCost: number; // in USD
}

export class FirebaseBudgetMonitor {
  private static readonly FREE_LIMITS = {
    STORAGE_GB: 5,
    DAILY_DOWNLOADS_GB: 1,
    DAILY_OPERATIONS: 50000,
    STORAGE_COST_PER_GB: 0.026, // $0.026 per GB per month
    DOWNLOAD_COST_PER_GB: 0.12, // $0.12 per GB
    OPERATION_COST_PER_100K: 0.05 // $0.05 per 100k operations
  };

  static calculateEstimatedCost(usage: UsageStats): {
    storageCost: number;
    downloadCost: number;
    operationCost: number;
    totalCost: number;
    withinFreeLimit: boolean;
  } {
    const storageGB = usage.storageUsed / (1024 * 1024 * 1024);
    const downloadGB = usage.dailyDownloads / (1024 * 1024 * 1024);
    
    // Calculate costs (only charge for usage above free tier)
    const excessStorageGB = Math.max(0, storageGB - this.FREE_LIMITS.STORAGE_GB);
    const excessDownloadGB = Math.max(0, downloadGB - this.FREE_LIMITS.DAILY_DOWNLOADS_GB);
    const excessOperations = Math.max(0, usage.operationsUsed - this.FREE_LIMITS.DAILY_OPERATIONS);
    
    const storageCost = excessStorageGB * this.FREE_LIMITS.STORAGE_COST_PER_GB;
    const downloadCost = excessDownloadGB * this.FREE_LIMITS.DOWNLOAD_COST_PER_GB;
    const operationCost = (excessOperations / 100000) * this.FREE_LIMITS.OPERATION_COST_PER_100K;
    
    const totalCost = storageCost + downloadCost + operationCost;
    const withinFreeLimit = totalCost === 0;
    
    return {
      storageCost,
      downloadCost,
      operationCost,
      totalCost,
      withinFreeLimit
    };
  }

  static getUsagePercentages(usage: UsageStats): {
    storagePercent: number;
    downloadsPercent: number;
    operationsPercent: number;
  } {
    const storageGB = usage.storageUsed / (1024 * 1024 * 1024);
    const downloadGB = usage.dailyDownloads / (1024 * 1024 * 1024);
    
    return {
      storagePercent: (storageGB / this.FREE_LIMITS.STORAGE_GB) * 100,
      downloadsPercent: (downloadGB / this.FREE_LIMITS.DAILY_DOWNLOADS_GB) * 100,
      operationsPercent: (usage.operationsUsed / this.FREE_LIMITS.DAILY_OPERATIONS) * 100
    };
  }

  static shouldShowWarning(usage: UsageStats): {
    showWarning: boolean;
    warningType: 'storage' | 'downloads' | 'operations' | 'cost';
    message: string;
  } {
    const percentages = this.getUsagePercentages(usage);
    const costs = this.calculateEstimatedCost(usage);
    
    // Check if approaching limits (80% threshold)
    if (percentages.storagePercent > 80) {
      return {
        showWarning: true,
        warningType: 'storage',
        message: `Storage usage at ${percentages.storagePercent.toFixed(1)}% of free limit. Consider upgrading soon.`
      };
    }
    
    if (percentages.downloadsPercent > 80) {
      return {
        showWarning: true,
        warningType: 'downloads',
        message: `Daily downloads at ${percentages.downloadsPercent.toFixed(1)}% of free limit.`
      };
    }
    
    if (percentages.operationsPercent > 80) {
      return {
        showWarning: true,
        warningType: 'operations',
        message: `Daily operations at ${percentages.operationsPercent.toFixed(1)}% of free limit.`
      };
    }
    
    if (costs.totalCost > 1) {
      return {
        showWarning: true,
        warningType: 'cost',
        message: `Estimated monthly cost: $${costs.totalCost.toFixed(2)}. Set up budget alerts!`
      };
    }
    
    return {
      showWarning: false,
      warningType: 'storage',
      message: ''
    };
  }

  // Example usage tracking component
  static createUsageDisplay(usage: UsageStats): string {
    const percentages = this.getUsagePercentages(usage);
    const costs = this.calculateEstimatedCost(usage);
    
    return `
📊 Firebase Usage Status:
• Storage: ${(usage.storageUsed / 1024 / 1024).toFixed(1)}MB (${percentages.storagePercent.toFixed(1)}% of free limit)
• Daily Downloads: ${(usage.dailyDownloads / 1024 / 1024).toFixed(1)}MB (${percentages.downloadsPercent.toFixed(1)}% of free limit)
• Daily Operations: ${usage.operationsUsed.toLocaleString()} (${percentages.operationsPercent.toFixed(1)}% of free limit)

💰 Estimated Cost: ${costs.withinFreeLimit ? 'FREE' : '$' + costs.totalCost.toFixed(2) + '/month'}
${costs.withinFreeLimit ? '✅ Within free tier limits' : '⚠️ Exceeding free tier'}
    `.trim();
  }
}

// React hook for monitoring usage (use after upgrading to Blaze)
export const useFirebaseBudgetMonitor = () => {
  // This would integrate with Firebase Analytics API
  // For now, returns mock data
  const usage: UsageStats = {
    storageUsed: 0,
    operationsUsed: 0,
    dailyDownloads: 0,
    estimatedCost: 0
  };

  return {
    usage,
    ...FirebaseBudgetMonitor.calculateEstimatedCost(usage),
    ...FirebaseBudgetMonitor.getUsagePercentages(usage),
    warning: FirebaseBudgetMonitor.shouldShowWarning(usage)
  };
};
