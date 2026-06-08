import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSharedValue } from "react-native-reanimated";
import React, { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, } from 'react'
import { useTheme } from '../screen/theme/useTheme';
import { scaledSize } from '../utilies/Utilities';
import { Theme } from '../screen/theme/ThemeConfig';
import CustomVectorIcon from './CustomVectorIcon';
import { Fonts } from '../assets/fonts/GlobalFonts';
interface S {
  title: string,
  children: any,
  onClose?: () => void;
  bottomShitSnapPoints?: Array<string>
  headerColor?: string,
  nocheColor?: string

}
const CustomBottomSheet = forwardRef((props: S, ref) => {
  const { theme, mode } = useTheme()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%', '60%', '90%'], []);
  const { title, bottomShitSnapPoints: bottomSheetSnapPoints = snapPoints } = props

  useImperativeHandle(ref, () => ({
    //@ts-ignore
    present: () => bottomSheetModalRef.current.present(),
    close: () => bottomSheetModalRef.current?.close(),

  }));

  const handleClose = () => {
    bottomSheetModalRef.current?.close();
  };

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme])



  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      handleIndicatorStyle={{
        backgroundColor: theme.secondaryTextColor,
        width: scaledSize(40),
      }}
      snapPoints={bottomSheetSnapPoints}
      backgroundStyle={{ backgroundColor: theme.bgColor }}
      onChange={(v) => {
        if (v === -1 && typeof props.onClose === 'function') {
          props.onClose();
        }
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header,{backgroundColor:theme.bgColor}]}>
          <Text style={[styles.title,{color:theme.primaryTextColor}]}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <CustomVectorIcon
              iconLibrary="Ionicons"
              iconName="close"
              size={scaledSize(20)}
              style={{ color: theme.primaryTextColor }}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <BottomSheetScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {props.children}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
});

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: scaledSize(20),
      paddingBottom: scaledSize(16),
      paddingTop: scaledSize(4),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: scaledSize(18),
      fontFamily: Fonts.medium,
      letterSpacing: 0.5,
      color: theme.primaryTextColor, // This will be overridden by theme, just a fallback
    },
    closeButton: {
      height: scaledSize(32),
      width: scaledSize(32),
      borderRadius: scaledSize(16),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.buttonBGColor, // This will be overridden by theme
    },
    contentContainer: {
      flex: 1,
    },
  });
  

export default CustomBottomSheet;
