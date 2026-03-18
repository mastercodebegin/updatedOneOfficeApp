import { View, Text } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'


interface S {
  borderRadius?: number
  children:any
  colors?:Array<string>
}
export default function CustomLinearGradientView(props:S) {
  const {colors=[]}=props
  return (
    <LinearGradient colors={colors.length>0?colors:['#0081A7', '#00AFB9']} style={{flex:1,borderRadius:props.borderRadius?props.borderRadius:0}}>
     {/* <LinearGradient colors={['#0081A7', '#0081A7']} style={{flex:1,borderRadius:props.borderRadius?props.borderRadius:0}}> */}
{props.children}
    </LinearGradient>
  )
}