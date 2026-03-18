import { View, Text,SafeAreaView } from 'react-native'
import React from 'react'

// interface myProps{
//     myStyle:any,
//     children:any

// }
export default function RootView(props) {
  return (
    <SafeAreaView style={props.customeStyle}>
        {props.children}
    </SafeAreaView>
  )
}