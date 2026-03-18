import { View, Text } from 'react-native'
import React from 'react'
import RangeSlider from 'rn-range-slider';
import { COLORS } from '../utilies/GlobalColors';
import { scaledSize } from '../utilies/Utilities';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface S {
    min?: number
    max?: number
    step?: number
    onValueChanged: (value: number) => void
}
export default function CustomRangeSlider(props: S) {
    const { min = -50, max = 100, step = 1, onValueChanged } = props;
    return (
        <GestureHandlerRootView style={{ flex: 1,justifyContent:'center',alignItems:'center' }}>
            <RangeSlider
                style={{
                    backgroundColor: COLORS.THEME_COLOR, height: scaledSize(1), width: '90%',
                    alignSelf: 'center', borderRadius: scaledSize(20), justifyContent: 'center'
                }}
                min={min}
                max={max}
                disableRange
                step={1}
                floatingLabel
                renderThumb={() => <View style={{
                    height: scaledSize(20), width: scaledSize(20), borderRadius: scaledSize(20),
                    backgroundColor: COLORS.THEME_COLOR, left: scaledSize(2)
                }}></View>}
                renderRail={() => <View><Text></Text></View>}
                renderRailSelected={() => <View><Text></Text></View>}
                renderLabel={() => <View><Text></Text></View>}
                renderNotch={() => <View><Text></Text></View>}
                onValueChanged={(v)=>onValueChanged(v)}
            />    
            </GestureHandlerRootView>
    )
}