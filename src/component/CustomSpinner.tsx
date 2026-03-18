import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {COLORS} from '../utilies/GlobalColors'

interface S{
    isLoading:boolean

}
export default function CustomSpinner(props:S) {
useEffect(()=>{
    // console.log('props>>>>>>>>>>>>>',props
        // );
    
})
  return (
    <Spinner visible={props.isLoading} animation='fade' color={COLORS.THEME_COLOR} overlayColor='rgba(0, 0, 0, 0.0)' 
    indicatorStyle={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} />
  )
}