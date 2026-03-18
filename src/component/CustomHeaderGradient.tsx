import { View, Text } from 'react-native'
import React from 'react'
import CustomLinearGradientView from './CustomLinearGradientView'
import { scaledSize } from '../utilies/Utilities'
import CustomBackIcon from './CustomBackIcon'
import { Fonts } from '../assets/fonts/GlobalFonts'

interface S {
    title: string,
    onPress: Function,
    isGradient?: boolean
}
export default function CustomHeaderGradient(props: S) {

    const { title, onPress,isGradient=true } = props
    return (
        <View style={{ flex: 1 }}>
 {        isGradient?   <CustomLinearGradientView>
                <View style={{
                    flex: 1,
                    flexDirection: "row"
                }}>
                    <View style={{ flex: .33 }}>
                        <View style={{ left: scaledSize(10), justifyContent: 'center', alignItems: 'flex-start', flex: 1 }}>
                            <CustomBackIcon onPress={onPress} size={20} color='white' />
                        </View>

                    </View>
                    <View style={{ flex: .8,justifyContent:'center',alignItems:'flex-start', }}>
                        <Text style={{ fontSize: scaledSize(16), fontFamily: Fonts.regular,  color: "white",letterSpacing:.5 }}>{title}</Text>
                    </View>
                </View>
            </CustomLinearGradientView>:
               <View style={{
                flex: 1,
                flexDirection: "row",
                backgroundColor:'white'
            }}>
                <View style={{ flex: .33 }}>
                    <View style={{ left: scaledSize(10), justifyContent: 'center', alignItems: 'flex-start', flex: 1 }}>
                        <CustomBackIcon onPress={onPress} size={20} color='black' />
                    </View>

                </View>
                <View style={{ flex: .8,justifyContent:'center',alignItems:'flex-start', }}>
                    <Text style={{ fontSize: scaledSize(16), fontFamily: Fonts.regular, 
                         color: "black",letterSpacing:.5 }}>{title}</Text>
                </View>
            </View>
                }
        </View>
    )
}