import { AdMob, AdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { ADMOB_INTERSTITIAL_ID_ANDROID, ADMOB_INTERSTITIAL_ID_IOS } from '../../config/adKeys';

// Set to false for production release
export const IS_TESTING = false;

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
      this.isInitialized = true;
    }
  }

  static async showAppOpenAd(): Promise<void> {
    if (!this.isInitialized) return;
    
    if (!Capacitor.isNativePlatform()) {
      console.log("Mock App Open Ad triggered!");
      return;
    }

    try {
      const adId = Capacitor.getPlatform() === 'ios' ? ADMOB_INTERSTITIAL_ID_IOS : ADMOB_INTERSTITIAL_ID_ANDROID;
      
      const options: AdOptions = {
        adId: adId,
        isTesting: IS_TESTING,
      };

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
      const adId = Capacitor.getPlatform() === 'ios' ? ADMOB_INTERSTITIAL_ID_IOS : ADMOB_INTERSTITIAL_ID_ANDROID;
      
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
