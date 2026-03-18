import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../utilies/GlobalColors'
import { Fonts } from '../assets/fonts/GlobalFonts'
import { scaledSize } from '../utilies/Utilities'
import CustomLinearGradientView from './CustomLinearGradientView'

interface S {
  name: string,
  onPress: any,
  style?: {},
  backGroundColor?: string

}
export default function CustomLinearButton(props: S) {
  const { backGroundColor } = props
// console.log('backGroundColor',backGroundColor);

  return (
    // <Button mode="contained" onPress={props.onPress} color='gray' 
    // style={{borderColor:COLORS.THEME_COLOR,}} 
    // labelStyle={{color:'black'}}>
    //   {props.name}
    // </Button>
    <CustomLinearGradientView borderRadius={4}>

    <TouchableOpacity onPress={props.onPress}
      style={{
        flex: 1, 
        borderWidth: backGroundColor == 'none' ? 1 : 0,
        borderColor: COLORS.THEME_COLOR,
        justifyContent: 'center', alignItems: 'center', borderRadius: 8
      }}>

      <Text style={{
        color:  'white',
        letterSpacing: 1,
        fontWeight:'bold',
      }}>{props.name}</Text>
    </TouchableOpacity>
    </CustomLinearGradientView>


  )
}
const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: scaledSize(8),

  },
  buttonName: {
    fontSize: scaledSize(17),
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1


  }

})