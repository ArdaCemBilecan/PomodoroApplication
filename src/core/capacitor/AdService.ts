import { AdMob, BannerAdSize, BannerAdPosition, AdOptions, AdLoadInfo } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Set to true to use test ads during development, false for production
export const IS_TESTING = true;

// Test IDs provided by Google AdMob
const TEST_APP_OPEN_AD_ID_ANDROID = "ca-app-pub-3940256099942544/9257395921";
const TEST_APP_OPEN_AD_ID_IOS = "ca-app-pub-3940256099942544/5575463023";

const TEST_INTERSTITIAL_AD_ID_ANDROID = "ca-app-pub-3940256099942544/1033173712";
const TEST_INTERSTITIAL_AD_ID_IOS = "ca-app-pub-3940256099942544/4411468910";

export class AdService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.initialize({
          initializeForTesting: IS_TESTING,
        });
        this.isInitialized = true;
        console.log("AdMob Initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize AdMob", e);
      }
    } else {
      console.log("AdMob skipped (Web platform fallback).");
      this.isInitialized = true; // Still marked as true to prevent web errors
    }
  }

  static async showAppOpenAd(): Promise<void> {
    if (!this.isInitialized) return;
    
    // Web mock
    if (!Capacitor.isNativePlatform()) {
      console.log("Mock App Open Ad triggered!");
      return;
    }

    try {
      // We must use the Interstitial Ad ID here since we are calling prepareInterstitial.
      // AdMob fails to load if an App Open Ad ID is used with the Interstitial method.
      const adId = Capacitor.getPlatform() === 'ios' ? TEST_INTERSTITIAL_AD_ID_IOS : TEST_INTERSTITIAL_AD_ID_ANDROID;
      
      const options: AdOptions = {
        adId: adId,
        isTesting: IS_TESTING,
      };

      // Since the App Open ad format might not be supported easily directly via prepareInterstitial
      // We rely on Interstitial for "App Open" if the AdMob plugin lacks specific app open.
      // But let's actually try Interstitial for the startup.
      
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
    } catch (e) {
      console.error("Failed to show App Open Ad", e);
    }
  }

  static async showSessionMilestoneAd(): Promise<void> {
    if (!this.isInitialized) return;

    if (!Capacitor.isNativePlatform()) {
      console.log("Mock Interstitial Ad triggered for 10th session milestone!");
      return;
    }

    try {
      const adId = Capacitor.getPlatform() === 'ios' ? TEST_INTERSTITIAL_AD_ID_IOS : TEST_INTERSTITIAL_AD_ID_ANDROID;
      
      const options: AdOptions = {
        adId: adId,
        isTesting: IS_TESTING,
      };

      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
    } catch (e) {
      console.error("Failed to show Interstitial Ad", e);
    }
  }
}
