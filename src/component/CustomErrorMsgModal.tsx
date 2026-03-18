import { View, Text } from 'react-native'
import React from 'react'
import { Overlay } from 'react-native-elements'
import { scaledSize } from '../utilies/Utilities'
import CustomVectorIcon from './CustomVectorIcon'
import CustomCloseIcon from './CustomCloseIcon'
import { Fonts } from '../../src/assets/fonts/GlobalFonts'

interface S {

    isVisible: boolean
    errorMessage:string
    onPressClose:Function
}

export default function CustomErrorMsgModal(props:S) {
    const { isVisible, errorMessage,  onPressClose, } = props;
    return (
        <Overlay isVisible={isVisible}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} animationType='fade'>
            <View style={{
                width: scaledSize(250),
                height: scaledSize(200),
            }}>
                <View style={{
                    height: scaledSize(80),
                    flexDirection: 'row',
                }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                        <CustomVectorIcon iconName='error-outline' iconLibrary='MaterialIcons'
                            style={{ color: 'red', fontSize: 50 }} />
                    </View>
                    <View style={{ flex: .7, justifyContent: 'flex-start', alignItems: 'flex-end' }}>
                        <CustomCloseIcon onPress={() => onPressClose()} />
                    </View>
                </View>

                <View style={{ height: scaledSize(60),
                     justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ width:'80%',
                     justifyContent: 'center', alignItems: 'center', }}>
                    <Text style={{ fontSize: scaledSize(14), fontFamily: Fonts.regular, letterSpacing: 1,alignSelf:'center' }}>{errorMessage}</Text>
                </View>
                </View>

            </View>

        </Overlay>
    )
}