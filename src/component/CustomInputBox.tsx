import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, TextInput } from 'react-native'
import { COLORS, FONTS } from '../utilies/GlobalColors'
import { scaledSize } from '../utilies/Utilities'

interface S {
    placeholder?: string
    onChangeText: Function
    CustomIcon?: any
    isNumberKeyboard?: boolean
    maxLength?: number
    value?: string,
    isEditable?: boolean
}
export default function CustomInputBox(props: S) {
    const { placeholder, onChangeText, CustomIcon, maxLength, isNumberKeyboard, value, isEditable = true } = props
    const [isFieldFocused, setIsFieldFocused] = useState(false)

    const check = () => {
        setIsFieldFocused(false)
    }
    return (
        <View style={[styles.inputAndIconFieldBorderColorView,
        {
            borderColor: isFieldFocused ? COLORS.THEME_COLOR : COLORS.inActiveBorderColor,
            borderWidth: isEditable ? .5 : 0, borderBottomWidth: isEditable ? .5 : 0
        }]}>
            {CustomIcon && <View style={{ height: scaledSize(30), width: scaledSize(30),
                 justifyContent: 'center', alignItems: 'center' }}>{CustomIcon}</View>}
            <TextInput
                onFocus={() => setIsFieldFocused(true)}
                onBlur={check}
                
                defaultValue={value}
                editable={isEditable ? true : false}
                style={[styles.textInputField, { color: 'black', marginLeft: isEditable ? 6 : 0 }]}
                placeholder={value ? value : placeholder}
                placeholderTextColor={'gray'}
                onChangeText={(v) => onChangeText(v)}
                maxLength={maxLength ? maxLength : 200}
                keyboardType={isNumberKeyboard ? 'number-pad' : 'default'}
            />
        </View>)
}

const styles = StyleSheet.create({
    inputAndIconFieldBorderColorView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderRadius: scaledSize(10),
        borderColor: COLORS.inActiveBorderColor
    },
    inputFieldIcon: {
        height: scaledSize(20),
        width: scaledSize(20)
    },
    textInputField: {
        // borderWidth:1,
        // height: scaledSize(40),
        // marginLeft: scaledSize(10),
        flex: 1,
        // borderWidth: 1,

        fontSize: scaledSize(12),
        fontWeight: '600',
        // maxWidth: scaledSize(160),
        fontFamily: FONTS.QuicksandBold
        // backgroundColor:'red'

    },



})