import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import React, { useMemo } from 'react'

import { Fonts } from '../../src/assets/fonts/GlobalFonts'
import { Theme, useTheme } from '../screen/theme/useTheme'
import CustomVectorIcon from './CustomVectorIcon'
import { scaledSize } from '../utilies/Utilities'

interface S {
  isVisible: boolean
  errorMessage: string
  onPressClose: Function
  onPressRetry?: Function
  errorCode?: string
  title?: string
}

export default function CustomErrorMsgModal(props: S) {
  const {
    isVisible,
    errorMessage,
    onPressClose,
    onPressRetry,
    errorCode,
    title = 'Something went wrong',
  } = props

  const { theme, mode } = useTheme()
  const isDark = mode === 'dark'

  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => onPressClose()}
    >
      <View style={styles.modalOverlay}>
        <View
          style={styles.modalContainer}
        >

        {/* Icon */}
        <View
          style={{
            width: scaledSize(64),
            height: scaledSize(64),
            borderRadius: scaledSize(40),
            backgroundColor: isDark ? '#2A2A2C' : '#F5F5F5',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: scaledSize(14),
          }}
        >
          <CustomVectorIcon
            iconLibrary="MaterialCommunityIcons"
            iconName="exclamation"
            style={{
              fontSize: scaledSize(56),
              color: '#E53935',
            }}
          />
        </View>

        {/* Title */}
        <View style={{height:scaledSize(70),justifyContent:'center'}}>

        <Text
          style={{
              fontSize: scaledSize(14),
              textAlign: 'center',
              letterSpacing: 1,
              marginBottom: scaledSize(10),
              color: theme.primaryTextColor,
              fontFamily: 'calibri',
            }}
            >
          {errorMessage}
        </Text>
            </View>

        {/* Message */}
        

      

        {/* Buttons */}
        <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPressClose()}
            style={{
              flex: 1,
              height: scaledSize(40),
              borderRadius: scaledSize(12),
              borderWidth: 1.5,
              top:scaledSize(10),
              borderColor: isDark ? '#38383A' : '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: scaledSize(14),
                letterSpacing:1,
                color: isDark ? '#8E8E93' : '#6B7280',
                fontFamily: Fonts.regular,
              }}
            >
              close
            </Text>
          </TouchableOpacity>

        

        </View>
      </View>
      </View>
    </Modal>
  )
}

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: scaledSize(300),
    paddingHorizontal: scaledSize(22),
    paddingTop: scaledSize(30),
    paddingBottom: scaledSize(20),
    borderRadius: scaledSize(18),
    backgroundColor: theme.bgContainor,
    alignItems: 'center',
    shadowColor: '#000',
    minHeight:scaledSize(250),
    shadowOpacity: 0.18,
    shadowRadius: scaledSize(36),
    shadowOffset: { width: 0, height: scaledSize(20) },
    elevation: scaledSize(16),
  },
  iconWrapper: {
    width: scaledSize(64),
    height: scaledSize(64),
    borderRadius: scaledSize(40),
    backgroundColor: mode === 'dark' ? '#2A2A2C' : '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSize(14),
  },
  icon: {
    fontSize: scaledSize(56),
    color: '#E53935',
  },
  messageContainer: {
    height: 70,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: scaledSize(14),
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: scaledSize(10),
    color: theme.primaryTextColor,
    fontFamily: 'calibri',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  dismissButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: mode === 'dark' ? '#38383A' : '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: scaledSize(14),
    letterSpacing: 1,
    color: mode === 'dark' ? '#8E8E93' : '#6B7280',
    fontFamily: Fonts.regular,
  },
});