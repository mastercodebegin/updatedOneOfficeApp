import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from "react-native-vector-icons/EvilIcons";
import { scaledSize } from '../utilies/Utilities';
import { COLORS } from '../utilies/GlobalColors';

interface S {
    iconSize?: number
    onPress: Function
    color?:string
}
export default function CustomCloseIcon(props: S) {
    const { onPress, iconSize,color } = props

    useEffect(()=>{
        console.log('color', color);
        
    })
    return (
        <View>

            <TouchableOpacity onPress={() => onPress()}>
                <Icon name="close" color={!!color?color:COLORS.THEME_COLOR}
                    size={iconSize ? scaledSize(iconSize) : scaledSize(30)}></Icon>
            </TouchableOpacity>
        </View>
    )
}