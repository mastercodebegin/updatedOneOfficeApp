import { View, Text, BackHandler, Linking, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native';
import { PdfIcon } from '../../assets/GlobalImages';

export default function Splashscreen({ navigation, route }) {
  const [isUserBack, setIsUserBack] = useState(false);
  const isFocused = useIsFocused();
  //Linking 

//  useEffect(() => {

//   const subscription =
//     Linking.addEventListener(
//       'url',
//       ({ url }) => {
//         console.log('url----', url);
//       }
//     );

//   if (!isUserBack) {
//     Linking.getInitialURL()
//       .then((url) => {
//         if (
//           url &&
//           route?.params?.pdf === undefined
//         ) {
//           console.log(
//             'first----',
//             url
//           );

//           navigation.navigate(
//             'PdfViewer',
//             { uri: url }
//           );
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }

//   return () => {
//     subscription.remove();
//   };

// }, []);

 
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity  onPress={ () =>  navigation.navigate('Dashboard')}>
      <Image source={PdfIcon} style={{ height: 100, width: 100 }} />
      </TouchableOpacity>
      </View>
  )
}