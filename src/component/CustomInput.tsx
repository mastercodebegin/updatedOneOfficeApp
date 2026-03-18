import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native-paper'
import { Input } from 'react-native-elements';

interface S {
    placeholder: string
    onChangeText: Function
    defaultValue?: string
    isPhoneKeyBoard?: boolean
    isEditable?: boolean
    maxLength?:number

}

export default function CustomInput(props:S) {
  const [isDisable,setIsDisable]=useState(false)
   const {isEditable=true} = props
  return (
  <Input
  placeholder={props.placeholder}
  errorStyle={{ color: 'red' }}
  editable={isEditable}
  inputStyle={{fontSize:14,justifyContent:'center'}}
  containerStyle={{ flex:1,}}
  onChangeText={(e)=>props.onChangeText(e)}
  keyboardType={props.isPhoneKeyBoard?'phone-pad':'default'}
  maxLength={props.maxLength?props.maxLength:20}
/>
  )
}