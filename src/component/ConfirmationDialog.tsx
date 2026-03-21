
import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, Text } from "react-native";
// import {Modal } from "react-native";

// import { Modal } from "react-native-paper";
import Modal from "react-native-modal";
import { scaledSize, widthFromPercentage } from "../utilies/Utilities";
import { ModalWindowColor } from "../utilies/GlobalColors";
import { Fonts } from "../assets/fonts/GlobalFonts";
import CustomVectorIcon from "./CustomVectorIcon";

//local imports

interface myProps {
    visible?: any;
    onSubmit?: any;
    onCancel?: any;
    mode?: 'default' | 'delete'; // 👈 add this

}

const ConfirmationDialog = (props: myProps) => {
    const {mode='default'} = props
    useEffect(() => {
        // console.log('number>>>>>>',props.num);

    })

    const renderDeleteConfirmation = () => {
        return (
            <View style={styles.mainView}>
                <View style={styles.modalMainView}>

                    {/* Icon */}
                    <View style={{ ...styles.iconWrapper, backgroundColor: 'white' }}>
                        <CustomVectorIcon iconLibrary="Feather" iconName="trash" style={{ color: '#800020', bottom: scaledSize(10) }} />
                    </View>

                    {/* Title */}
                    <Text style={styles.heading}>Delete</Text>

                    {/* Message */}
                    <Text style={styles.subText}>
                        Are you sure you want to delete?
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={props.onCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={props.onSubmit} style={styles.confirmButton}>
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        )
    }
    const renderSimpleConfirmation = () => {
        return (
            <View style={styles.mainView}>
                <View style={styles.modalMainView}>
                    <View style={{ ...styles.iconWrapper, backgroundColor: 'white' }}>
                        <CustomVectorIcon iconLibrary="Feather" iconName="alert-triangle"
                         style={{ color: '#33257d', bottom: scaledSize(10) }} />
                    </View>

                    {/* Title */}
                    <Text style={styles.heading}>Alert</Text>


                    {/* Message */}
                    <Text style={styles.subText}>
                        Do you want to continue?
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={props.onCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={props.onSubmit}
                            style={{...styles.confirmButton,backgroundColor:'#33257d'}}
                        >
                            <Text style={styles.confirmText}>Continue</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );
    };
    return (

        <Modal
            isVisible={props.visible}
            hasBackdrop={true}
            backdropColor={'#565656'}
            animationInTiming={500}
            animationOutTiming={900}
        >
            {mode=='delete'?renderDeleteConfirmation():renderSimpleConfirmation()}

        </Modal>

    );
};

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaledSize(10),
    },

    modalMainView: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: scaledSize(10),
        paddingVertical: scaledSize(24),
        paddingHorizontal: scaledSize(20),
        alignItems: 'center',

        // shadow
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: scaledSize(12),
        shadowOffset: { width: 0, height: scaledSize(4) },
        elevation: scaledSize(6),

    },

    iconWrapper: {
        width: widthFromPercentage(80),
        height: scaledSize(40),
        borderRadius: scaledSize(16),
        backgroundColor: '#FDECEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scaledSize(12),
    },

    icon: {
        fontSize: scaledSize(28),
    },

    heading: {
        fontSize: scaledSize(16),
        color: '#111',
        letterSpacing: 1,
        bottom: scaledSize(15)
        // marginBottom: scaledSize(10),
    },

    subText: {
        fontSize: scaledSize(14),
        color: '#777',
        textAlign: 'center',
        letterSpacing: .5,
        marginBottom: scaledSize(20),
        lineHeight: scaledSize(20),
        // fontFamily: Fonts.regular,
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    cancelButton: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        paddingVertical: scaledSize(12),
        borderRadius: scaledSize(10),
        alignItems: 'center',
        marginRight: scaledSize(8),
    },

    cancelText: {
        fontSize: scaledSize(14),
        color: '#333',
        fontFamily: Fonts.medium,
    },

    confirmButton: {
        flex: 1,
        backgroundColor: '#800020',
        paddingVertical: scaledSize(12),
        borderRadius: scaledSize(10),
        alignItems: 'center',
        marginLeft: scaledSize(8),
    },

    confirmText: {
        fontSize: scaledSize(14),
        color: '#fff',
        fontFamily: Fonts.medium,
    },





    outlineButton: {
        width: scaledSize(100),
        height: scaledSize(36),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        // paddingVertical: scaledSize(12),
        borderRadius: scaledSize(25),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scaledSize(8),
    },

    outlineText: {
        fontSize: scaledSize(14),
        color: '#333',
        fontFamily: Fonts.medium,
    },

    primaryButton: {
        width: scaledSize(150), height: scaledSize(36),
        backgroundColor: '#4B2E83', // purple like image
        // paddingVertical: scaledSize(12),
        justifyContent: 'center',
        borderRadius: scaledSize(25),
        alignItems: 'center',
        marginLeft: scaledSize(8),
    },

    primaryText: {
        fontSize: scaledSize(12),
        color: '#fff', 
        letterSpacing: 1,
        // fontFamily:Fonts.regular
    },
});


export default ConfirmationDialog;

