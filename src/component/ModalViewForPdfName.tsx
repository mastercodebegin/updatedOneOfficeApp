
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, Text } from "react-native";
import { COLORS } from "../utilies/GlobalColors";
import { scaledSize, } from "../utilies/Utilities";
import { deviceBasedDynamicDimension } from "../utilies/scale";
import { Fonts, FONTS } from "../assets/fonts/GlobalFonts";
import CustomRangePicker from "./CustomRangePicker";
//local imports

interface myProps {
    visible?: any;
    open?: any;
    close?: any;
    text?: any;
    onChangeText?: any;
    num?: any;
    onSubmit?: any;
    onClose?: any;
    onImageQualityChange: any
}
const bg_color ='#D3d3d3'
const ModalView = (props: myProps) => {
    const [label, setLabel] = useState('high')
    useEffect(() => {
        console.log('number>>>>>>', props);

    })
    return (
        <>
            <Modal
                visible={props.visible}
                animationType="fade" transparent={true}
            //presentationStyle={"overFullScreen"}
            >
                <View style={styles.mainView}>
                    <View style={styles.modalMainView}>
                        <View style={{ borderRadius: scaledSize(5), height: scaledSize(200) }}>
                            <View style={{ justifyContent: 'flex-start', alignItems: "flex-start" }}>

                                <Text style={styles.enterPasswordText}>Enter File Name</Text>
                            </View>
                            <View style={[styles.enterPasswordView, { width: '90%', alignSelf: 'flex-start' }]}>
                                <TextInput
                                    value={props.text}
                                    placeholder="File Name..."
                                    placeholderTextColor={'black'}
                                    autoCapitalize="none"
                                    keyboardType='name-phone-pad'
                                    onChangeText={(value: any) => props.onChangeText(value)}
                                    style={[styles.textInput, { borderBottomColor: props.num > 1 && props.text.length > 0 ? 'red' : 'gray', width: '100%' }]} />
                            </View>
                            {/* {props.num > 1 && props.text.length > 0 && <Text style={{ textAlign: 'center', color: 'red' }}>Wrong Password</Text>} */}
                            <View style={styles.imageQualityMainView }>
                                <TouchableOpacity onPress={() => { props.onImageQualityChange(1), setLabel('high') }}>
                                    <View style={[styles.imageQualityView, {
                                        backgroundColor: label == 'high' ? COLORS.THEME_COLOR : bg_color,
                                    }]}>
                                        <Text style={[styles.imageQualityText,{ fontWeight: '400', color: label == 'high' ? 'white' : '#000000' }]}>High</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { props.onImageQualityChange(.1), setLabel('medium') }}>

                                    <View style={[styles.imageQualityView, {
                                        backgroundColor: label == 'medium' ? COLORS.THEME_COLOR : bg_color,
                                    }]}>
                                        <Text style={
                                            [styles.imageQualityText,{  color: label == 'medium' ? 'white' : '#000000' }]}>
                                            Medium</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { props.onImageQualityChange(.01), setLabel('low') }}>

                                    <View style={[styles.imageQualityView, {
                                        backgroundColor: label == 'low' ? COLORS.THEME_COLOR : '#d3d3d3',
                                        // borderWidth:label !=='low'? .4 : 0
                                    }]}>
                                        <Text style={[styles.imageQualityText,{  color: label == 'low' ? 'white' : '#000000', }]}>
                                            Low</Text>
                                    </View>
                                </TouchableOpacity>
                                {/* <CustomRangePicker /> */}
                            </View>
                            <View style={[styles.okAndCancelButtonView]}>
                                {/* <View style={{ width: '50%' }}>

                                </View> */}
                                <View style={{ width: '100%', 
                                    flexDirection: 'row',justifyContent:'flex-end' }}>
                                    <TouchableOpacity onPress={props.onClose}
                                        style={{...styles.okButton,right:scaledSize(20),width:scaledSize(80),backgroundColor:'gray'}}>
                                        <Text style={styles.okButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={props.onSubmit}
                                        style={styles.okButton}>
                                        <Text style={styles.okButtonText}>Proceed</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    cardContainer: {

        flex: 1,
        flexDirection: "row",
        marginVertical: deviceBasedDynamicDimension(10, true, 1),

        padding: deviceBasedDynamicDimension(15, true, 1),
        borderRadius: deviceBasedDynamicDimension(20, true, 1),
        backgroundColor: COLORS.white
        // elevation: 4,
        // backgroundColor: COLORS.white,
        // // backgroundColor: COLORS.white,
        // shadowColor: COLORS.primaryShadow,
        // shadowOffset: { width: 1, height: 1 },
        // shadowOpacity: 0.9,
        // shadowRadius: 8,

        // width: "100%",
    },
    mainView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalMainView: {
        width: scaledSize(300),
        borderColor: COLORS.grey,
        borderWidth: 1,
        borderRadius: scaledSize(4),
        // opacity: 0.9,
        height: scaledSize(200),
        backgroundColor: 'white'
    },
    enterPasswordText: {
        margin: scaledSize(10),
        fontSize: scaledSize(14),
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: .5
    },
    enterPasswordView: {
        backgroundColor: '#fff',
        width: '83%',
        alignSelf: 'center',
        margin: scaledSize(10),
        borderRadius: scaledSize(5)
    },
    textInput: {
        marginLeft: scaledSize(5),
        borderRadius: scaledSize(5),
        fontSize: scaledSize(16),
        padding: scaledSize(5),
        paddingLeft: scaledSize(10),
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        color: 'black',
    },
    okAndCancelButtonView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    cancelButton: {
        opacity: 1,
        // backgroundColor: "#54c0e8",
        borderRadius: deviceBasedDynamicDimension(3, true, 1),
        justifyContent: "center",
        height: deviceBasedDynamicDimension(50, false, 1),
        paddingHorizontal: deviceBasedDynamicDimension(2, true, 1),
        //  marginRight:  deviceBasedDynamicDimension(10, true, 1),
    },
    cancelButtonText: {
        margin: scaledSize(10),
        fontSize: scaledSize(12),
        textAlign: 'center',
        fontWeight: '800',
        letterSpacing: .5
    },
    imageQualityMainView: {
        height: scaledSize(50),
        width: '80%', justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center', flexDirection: 'row'
    },
    imageQualityView: {
        height: scaledSize(36),
        width: scaledSize(66),
        // borderWidth: scaledSize(1),
        borderRadius: scaledSize(20),
        // borderColor: COLORS.activeBorderColor,
        justifyContent: 'center',
        marginLeft: scaledSize(12),
        alignItems: 'center',
    },
    imageQualityText:{
        fontFamily:Fonts.regular,
        letterSpacing:1
    },
    okButton: {
        // backgroundColor: "#e31d93",
        borderRadius: deviceBasedDynamicDimension(8, true, 1),
        justifyContent: "center",
        height: deviceBasedDynamicDimension(34, false, 1),
        paddingHorizontal: deviceBasedDynamicDimension(0, true, 1),
        backgroundColor:COLORS.THEME_COLOR,
        width:scaledSize(100),right: scaledSize(4)

    },
    okButtonText: {
        // margin: scaledSize(10),
        fontSize: scaledSize(14),
        color: 'white',
        letterSpacing: .5,
         fontFamily: Fonts.regular, 
        textAlign: 'center',
    }


});



export default ModalView;
