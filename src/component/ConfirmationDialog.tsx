import React from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

import Modal from 'react-native-modal';

import {
  scaledSize,
  widthFromPercentage,
} from '../utilies/Utilities';

import { Fonts } from '../assets/fonts/GlobalFonts';

import CustomVectorIcon from './CustomVectorIcon';

import { useTheme } from '../../src/screen/theme/useTheme';

interface myProps {
  visible: boolean;

  onSubmit?: () => void;

  onCancel?: () => void;

  mode?: 'default' | 'delete';
}

const ConfirmationDialog = (
  props: myProps,
) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const isDeleteMode =
    props?.mode === 'delete';

  return (
    <Modal
      isVisible={props.visible}
      hasBackdrop
      backdropColor="#000"
      backdropOpacity={0.45}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={350}
      animationOutTiming={300}>
      
      <View style={styles.mainView}>
        
        <View style={styles.modalMainView}>
          
          {/* Icon */}
          <View
            style={[
              styles.iconWrapper,

            //   {
            //     backgroundColor:
            //       isDeleteMode
            //         ? 'rgba(255,59,92,0.12)'
            //         : `${theme.themeColor}20`,
            //   },
            ]}>
            
            <CustomVectorIcon
              iconLibrary="Feather"
              iconName={
                isDeleteMode
                  ? 'trash'
                  : 'alert-triangle'
              }
              style={{
                color: isDeleteMode
                  ? '#FF3B5C'
                  : theme.themeColor,

                bottom: scaledSize(0),
              }}
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            {isDeleteMode
              ? 'Delete'
              : 'Alert'}
          </Text>

          {/* Message */}
          <Text style={styles.subText}>
            {isDeleteMode
              ? 'Are you sure you want to delete?'
              : 'Do you want to continue?'}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={props.onCancel}
              style={styles.cancelButton}>
              
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={props.onSubmit}
              style={[
                styles.confirmButton,

                {
                  backgroundColor:
                    isDeleteMode
                      ? '#FF3B5C'
                      : theme.themeColor,
                },
              ]}>
              
              <Text style={styles.confirmText}>
                {isDeleteMode
                  ? 'Delete'
                  : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    mainView: {
      flex: 1,

      justifyContent: 'center',

      alignItems: 'center',

      paddingHorizontal: scaledSize(18),
    },

    modalMainView: {
      width: '100%',

      backgroundColor:
        theme.bgContainor,

      borderRadius: scaledSize(24),

      paddingVertical: scaledSize(28),

      paddingHorizontal: scaledSize(22),

      alignItems: 'center',

      borderWidth: 1,

      borderColor: theme.borderColor,

      shadowColor: '#000',

      shadowOpacity: 0.12,

      shadowRadius: scaledSize(12),

      shadowOffset: {
        width: 0,
        height: scaledSize(4),
      },

      elevation: scaledSize(6),
    },

    iconWrapper: {
      width: widthFromPercentage(20),

      height: widthFromPercentage(20),

      borderRadius: scaledSize(22),

      justifyContent: 'center',

      alignItems: 'center',

      marginBottom: scaledSize(16),
    },

    heading: {
      fontSize: scaledSize(20),

      color: theme.primaryTextColor,

      fontFamily: Fonts.regular,

      marginBottom: scaledSize(8),
    },

    subText: {
      fontSize: scaledSize(14),

      color: theme.primaryTextColor,

      opacity: 0.7,

      textAlign: 'center',

      lineHeight: scaledSize(22),

      marginBottom: scaledSize(26),

      paddingHorizontal: scaledSize(10),
    },

    buttonRow: {
      flexDirection: 'row',

      width: '100%',
    },

    cancelButton: {
      flex: 1,

      height: scaledSize(50),

      backgroundColor:
        theme.buttonBGColor,

      borderRadius: scaledSize(16),

      justifyContent: 'center',

      alignItems: 'center',

      marginRight: scaledSize(10),

      borderWidth: 1,

      borderColor: theme.borderColor,
    },

    cancelText: {
      fontSize: scaledSize(15),

      color: theme.primaryTextColor,

      fontFamily: Fonts.regular,
    },

    confirmButton: {
      flex: 1,

      height: scaledSize(50),

      borderRadius: scaledSize(16),

      justifyContent: 'center',

      alignItems: 'center',

      marginLeft: scaledSize(10),
    },

    confirmText: {
      fontSize: scaledSize(15),

      color: theme.secondaryTextColor,

      fontFamily: Fonts.regular,
    },
  });

export default ConfirmationDialog;