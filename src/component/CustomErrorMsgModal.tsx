import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Overlay } from 'react-native-elements'
import { Fonts } from '../../src/assets/fonts/GlobalFonts'
import { useTheme } from '../screen/theme/useTheme'
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

  return (
    <Overlay
      isVisible={isVisible}
      animationType="fade"
      overlayStyle={{
        backgroundColor: 'transparent',
        padding: 0,
      }}
    >
      <View
        style={{
          width: scaledSize(300),
          paddingHorizontal: scaledSize(22),
          paddingTop: scaledSize(30),
          paddingBottom: scaledSize(20),
          borderRadius: scaledSize(18),
          backgroundColor: theme.bgContainor,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: scaledSize(36),
          shadowOffset: { width: 0, height: scaledSize(20) },
          elevation: scaledSize(16),
        }}
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
        <View style={{height:70,justifyContent:'center'}}>

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
              height: 46,
              borderRadius: 12,
              borderWidth: 1.5,
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
              Dismiss
            </Text>
          </TouchableOpacity>

        

        </View>
      </View>
    </Overlay>
  )
}