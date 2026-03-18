import React, { useEffect, useState } from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AdmobCons } from '../../utilies/Constants';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { scaledSize } from '../../utilies/Utilities';
import { Fonts } from '../../assets/fonts/GlobalFonts';

const adUnitId = __DEV__ ? TestIds.BANNER : AdmobCons.BANNER_ADD_ID;
interface S{
  onPressAddClose?:Function
}
function CustomBannerAdd(props:S) {
  const {onPressAddClose} = props
  const [isShowAdd, setIsShowAdd] = useState(true)
  useEffect(() => {
    // console.log('__DEV__',__DEV__);

  })
  return (
    <View style={{ flexDirection: 'row',flex:1 }}>

      {isShowAdd ?
        <View style={{ flexDirection: 'row',flex:1 }}>
          <BannerAd
            unitId={adUnitId} // Use your real AdMob unit ID in production
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => console.log('Ad Failed:', error)}
            onAdClosed={()=>{console.log('add closed');
            }}

        />
      <TouchableOpacity onPress={()=>{setIsShowAdd(false),onPressAddClose()}}
      style={{ justifyContent: 'center', alignItems: 'center',flex:1 }}>
        <AntDesign name='close' size={scaledSize(24)} color='black' />
            {/* <Text style={{ fontSize: scaledSize(12), fontFamily: Fonts.bold, }}>Hide</Text> */}
          </TouchableOpacity>
        </View>
        :<></>}
    </View>
  );
}

export default CustomBannerAdd

// import { View, Text } from 'react-native'
// import React from 'react'

// export default function CustomBannerAdd() {
//   return (
//     <View>
//       <Text>CustomBannerAdd</Text>
//     </View>
//   )
// }