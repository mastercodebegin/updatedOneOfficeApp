import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from "react-native-vector-icons/Ionicons";
import { scaledSize } from '../utilies/Utilities';
import { COLORS } from '../utilies/GlobalColors';

interface S{
    size?:number
    onPress:Function
    color?:string
}
export default function CustomBackIcon(props:S) {
    const {onPress,size,color}=props
  return (
<TouchableOpacity onPress={()=>onPress()}> 
    <Icon name="arrow-back"  
    size={size?scaledSize(size):scaledSize(22)} color={color?color:'black'}></Icon>
 </TouchableOpacity>
  )
}