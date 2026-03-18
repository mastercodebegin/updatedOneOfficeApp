import { RewardedInterstitialAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';

const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(TestIds.REWARDED_INTERSTITIAL);

export default function VideoBannerAd() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = rewardedInterstitial.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });

    rewardedInterstitial.load();

    return unsubscribe;
  }, []);

  const showAd = () => {
    if (loaded) rewardedInterstitial.show();
  };

  return <Button title="Show Video Ad" onPress={showAd} disabled={!loaded} />;
}
