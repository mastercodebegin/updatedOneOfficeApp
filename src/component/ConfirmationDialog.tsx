
import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Text } from "react-native";
// import {Modal } from "react-native";

// import { Modal } from "react-native-paper";
import Modal from "react-native-modal";
import { scaledSize } from "../utilies/Utilities";
import { ModalWindowColor } from "../utilies/GlobalColors";
import { Fonts } from "../assets/fonts/GlobalFonts";

//local imports

interface myProps {
    visible?: any;
    onSubmit?: any;
    onCancel?: any;
}

const ConfirmationDialog = (props: myProps) => {
    useEffect(() => {
        // console.log('number>>>>>>',props.num);

    })
    return (
        
            <Modal
                
            isVisible={props.visible}
            hasBackdrop={true}
            // backdropOpacity={0.70}
            // backdropColor={'rgba(0, 0, 0, 0.8)'}
            backdropColor={'#565656'}
  
  
                //isVisible={props.visible}
                animationInTiming={500}
                animationOutTiming={900}
                // backdropOpacity={0.90}
                
                // animationOut={'flash'}
                // style={{backgroundColor:'none'}}
            //  animationType="slide" 
            //presentationStyle={"overFullScreen"}
            >
                <View style={styles.mainView}>
                    <View style={styles.modalMainView}>
                        <View style={{ borderRadius: scaledSize(5), height: scaledSize(100) }}>
                            <Text style={[styles.cancelButtonText,styles.heading]}>Do you want to continue !</Text>
                            <View style={[styles.okAndCancelButtonView]}>
                                <View style={{ width: '50%' }}>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={props.onCancel}
                                        style={styles.cancelButton}>
                                        <Text style={styles.cancelButtonText}>CANCEL</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={props.onSubmit}
                                        style={styles.okButton}>
                                        <Text style={styles.okButtonText}>OKAY</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        
    );
};

const styles = StyleSheet.create({
    cardContainer: {

        flex: 1,
        flexDirection: "row",
        marginVertical: scaledSize(10),

        padding: scaledSize(15),
        borderRadius: scaledSize(20),
        // backgroundColor: 'white'
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
        // backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    heading:{
        fontSize:scaledSize(16),fontWeight:'400',
        fontFamily:Fonts.regular
    },
    modalMainView: {
        width: scaledSize(300),
        borderColor: ModalWindowColor.modalMainView,
         borderWidth: 1,
        borderRadius: scaledSize(4),
        // opacity: 0.9,
        height: scaledSize(130),
        backgroundColor: ModalWindowColor.modalMainView,
                
    },


    okAndCancelButtonView: {
        flex: 1,
        flexDirection: 'row',
        // justifyContent: 'space-evenly',
        alignItems: 'flex-end',
        top:10,

    },
    cancelButton: {
        opacity: 1,
        // backgroundColor: "#54c0e8",
        borderRadius: scaledSize(3),
        justifyContent: "center",
        height: scaledSize(50,),
        paddingHorizontal: scaledSize(2),
        //  marginRight:  deviceBasedDynamicDimension(10, true, 1),
    },
    cancelButtonText: {
        margin: scaledSize(10),
        fontSize: scaledSize(12),
        // textAlign: 'center',
        color:ModalWindowColor.cancelButton,
        fontWeight: '800',
        letterSpacing: .5
    },
    okButton: {
        // backgroundColor: "#e31d93",
        borderRadius: scaledSize(3),
        justifyContent: "center",
        height: scaledSize(50,),
        paddingHorizontal: scaledSize(0),
    },
    okButtonText: {
        margin: scaledSize(10),
        fontSize: scaledSize(15),
        color: ModalWindowColor.okButton,
        fontWeight: '800',
        letterSpacing: .5,
        //  fontFamily: 'Quicksand-Bold', 
        textAlign: 'center',
    }


});



export default ConfirmationDialog;

