import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSharedValue } from "react-native-reanimated";
import React, { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, } from 'react'
import { Title } from 'react-native-paper';
import { COLORS } from '../utilies/GlobalColors';
import { useTheme } from '../screen/theme/useTheme';
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
  const bottomSheetValue = useSharedValue(424)
  const { bottomShitSnapPoints = snapPoints, headerColor = COLORS.THEME_COLOR, nocheColor = theme.iconColor } = props

  useImperativeHandle(ref, () => ({
    //@ts-ignore
    present: () => bottomSheetModalRef.current.present(),
    close: () => bottomSheetModalRef.current?.close(),

  }));
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      handleIndicatorStyle={{
        backgroundColor: theme.secondaryTextColor
      }}

      snapPoints={bottomShitSnapPoints}
      backgroundStyle={{ backgroundColor: theme.buttonBGColor }}
      onChange={(v) => {
        if (v === -1 && typeof props.onClose === 'function') {
          props.onClose();
        }
      }}

    >



      {/* Content */}
      <BottomSheetScrollView

        style={{ backgroundColor: theme.bgContainor, flex: 1 }} // Adjust as needed
      >
        {props.children}

      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: 'purple',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerText: {
    // color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

});

export default CustomBottomSheet;
