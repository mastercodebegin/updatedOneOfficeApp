import { View,} from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { scaledSize } from '../utilies/Utilities'
import Octicons from 'react-native-vector-icons/Octicons';
import LinearGradient from 'react-native-linear-gradient';

interface S {
    onPress: Function
    height?: number
    icon?:any
}
export default function CustomFAB(props: S) {
    const { onPress, height,icon } = props;
    const hei = height ? height : scaledSize(50)
    return (
        <>
            <View style={{ height: scaledSize(hei), width: scaledSize(hei), borderRadius: hei }}>

            <LinearGradient colors={['#00AFB9','#0081A7','#0081A7',]} style={{flex:1,borderRadius: hei}}>
            <TouchableOpacity style={{
                        borderRadius: scaledSize(hei),
                        height: scaledSize(hei),
                        width: scaledSize(hei),
                        justifyContent: 'center', alignItems: 'center',
                        alignSelf: 'flex-end',
                    }}
                     onPress={() => onPress()}
                    >
                        {icon?icon:<Octicons name='plus' size={scaledSize(20)} color={'white'} />}
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </>
    )
}