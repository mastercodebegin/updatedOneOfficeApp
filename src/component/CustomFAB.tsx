import { ButtonProps, StyleProp, StyleSheet, View, ViewProps, ViewStyle, } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { scaledSize } from '../utilies/Utilities'
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../utilies/GlobalColors';
import { useTheme } from '../screen/theme/useTheme';

interface S {
    onPress: Function
    height?: number
    icon?: any,
    style?: StyleProp<ViewStyle>

}
export default function CustomFAB(props: S) {
    const { onPress, height, icon, style } = props;
    const hei = height ? height : scaledSize(80)
    const { mode, theme } = useTheme()
    return (
        <View style={[
            {
                height: scaledSize(hei),

                width: scaledSize(hei),

                borderRadius:
                    scaledSize(hei) / 2,
            },

            style,
        ]}
        >


            <LinearGradient
                colors={
                    mode === 'dark'
                        ? ['#2D2F36', '#1C1C1E']
                        : ['#6EA8FF', '#4338CA']

                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    height: scaledSize(hei), width: scaledSize(hei),
                    borderRadius: hei
                }}                >
                <TouchableOpacity style={{
                    borderRadius: scaledSize(hei),
                    height: scaledSize(hei),
                    width: scaledSize(hei),
                    justifyContent: 'center', alignItems: 'center',
                    alignSelf: 'flex-end',
                }}
                    onPress={() => onPress()}
                >
                    {icon ? icon : <Ionicons name='camera-outline'
                        color={mode === 'light' ? 'white' : theme.iconColor} size={scaledSize(30)}
                    />}
                </TouchableOpacity>
            </LinearGradient>
        </View >
    )
}

const styles = StyleSheet.create({
    btn: {
        width: scaledSize(36),
        height: scaledSize(36),

        borderRadius: scaledSize(12),

        justifyContent: 'center',
        alignItems: 'center',

        // shadowColor: theme.themeColor,
        shadowOpacity: 0.45,
        marginLeft: scaledSize(6),

        shadowRadius: scaledSize(4),

        shadowOffset: {
            width: 0,
            height: scaledSize(4),
        },

        elevation: 8
    }
})