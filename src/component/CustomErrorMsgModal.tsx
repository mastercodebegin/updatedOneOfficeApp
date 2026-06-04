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
    title = 'Error',
  } = props

  const { theme, mode } = useTheme()
  const isDark = mode === 'dark'
  const styles = useMemo(() => createStyles(theme, mode), [theme, mode])

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => onPressClose()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <CustomVectorIcon
              iconLibrary="MaterialCommunityIcons"
              iconName="alert-circle-outline"
              style={styles.icon}
            />
          </View>

          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Message */}
          <Text style={styles.messageText}>{errorMessage}</Text>

          {/* Dismiss Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressClose()}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  )
}

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: scaledSize(300),
    paddingHorizontal: scaledSize(24),
    paddingTop: scaledSize(32),
    paddingBottom: scaledSize(24),
    borderRadius: scaledSize(24),
    backgroundColor: theme.bgContainor,
    alignItems: 'center',
    gap: scaledSize(10),
    borderWidth: 0.5,
    borderColor: mode === 'dark' ? '#2a2a36' : '#e8e8e8',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: scaledSize(24),
    shadowOffset: { width: 0, height: scaledSize(12) },
    elevation: scaledSize(12),
  },
  iconWrapper: {
    width: scaledSize(68),
    height: scaledSize(68),
    borderRadius: scaledSize(34),
    backgroundColor: mode === 'dark' ? '#2a0e0e' : '#fff0f0',
    borderWidth: .5,
    borderColor: mode === 'dark' ? '#7a2020' : '#f5c0c0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSize(4),
  },

  icon: {
    fontSize: scaledSize(32),
    color: '#e24b4a',
  },
  
  titleText: {
    fontSize: scaledSize(16),
    fontWeight: '500',
    textAlign: 'center',
    color: theme.primaryTextColor,
    fontFamily: Fonts.regular,
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: scaledSize(13),
    textAlign: 'center',
    lineHeight: scaledSize(20),
    color: mode === 'dark' ? '#666' : '#999',
    fontFamily: Fonts.regular,
    paddingHorizontal: scaledSize(8),
  },
  dismissButton: {
    width: '100%',
    height: scaledSize(46),
    borderRadius: scaledSize(12),
    backgroundColor: '#e24b4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaledSize(8),
  },
  dismissText: {
    fontSize: scaledSize(14),
    fontWeight: '500',
    color: '#fff',
    fontFamily: Fonts.regular,
    letterSpacing: 0.5,
  },
})