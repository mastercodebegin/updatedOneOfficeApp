import { View, Text, TextStyle } from 'react-native'
import React, { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from "react-native-vector-icons/EvilIcons";
import { scaledSize } from '../utilies/Utilities';
import { COLORS } from '../utilies/GlobalColors';

interface S {
    iconSize?: number
    style?:TextStyle
    onPress: Function
    color?:string
}
export default function CustomCloseIcon(props: S) {
    const { onPress, iconSize,color,style={} } = props

    useEffect(()=>{
        console.log('color', color);
        
    })
    return (
        <View>

            <TouchableOpacity onPress={() => onPress()}>
                <Icon name="close"
                style={{color:color?color:COLORS.THEME_COLOR,
                    fontSize:iconSize ? scaledSize(iconSize) : scaledSize(30),...style}}
                    ></Icon>
            </TouchableOpacity>
        </View>
    )
}