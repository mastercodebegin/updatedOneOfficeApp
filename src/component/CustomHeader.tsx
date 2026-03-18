import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";

// import Icon from "react-native-vector-icons/EvilIcons";
import Icon from "react-native-vector-icons/FontAwesome5";
import CustomVectorIcon from "./CustomVectorIcon";
import CustomCloseIcon from "./CustomCloseIcon";
import { navigateToBack, scaledSize } from "../utilies/Utilities";
import { COLORS } from "../utilies/GlobalColors";
import { Fonts } from "../assets/fonts/GlobalFonts";

interface myProps {
  title: any;
  isBackIconHide?: boolean;
  isCloseIconShow?: boolean;
  onPressBack?: () => any;
  onPressCloseIcon?: () => any;
}

const window = Dimensions.get("window");

const CustomHeader = (props: myProps) => {
  const { title, isBackIconHide = false, onPressBack, onPressCloseIcon, isCloseIconShow = false } = props
  return (
    <>
      <View style={{
        flex: 1, flexDirection: 'row',marginLeft: isBackIconHide ? 0 : scaledSize(10)
      }}>
        {isBackIconHide ? <></> : <TouchableOpacity style={{
          flex: .3,
          top:scaledSize(1),
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
          onPress={() => onPressBack ? onPressBack() : navigateToBack()}
        >
          <Icon
            name="arrow-left"
            color={COLORS.THEME_COLOR}
            size={24}
            style={{ marginLeft: scaledSize(10), }}
          />
        </TouchableOpacity>}
        <View style={{
          flex: 1, justifyContent: 'flex-start', 
          alignItems: isBackIconHide ? 'center' : 'flex-start'
        }}>
          <Text style={styles.titleInput}>{props.title}</Text>
        </View>
        {isCloseIconShow ? <View style={{ flex: .2, justifyContent: 'flex-start', alignItems: 'center' }}>
          <CustomVectorIcon iconLibrary="Ionicons" iconName="close-sharp"/>
          {/* <CustomCloseIcon iconSize={24} onPress={() => onPressCloseIcon ? onPressCloseIcon() : console.log('undefined close function')} /> */}
        </View> : <></>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({

  titleInput: {
    color: COLORS.black,
    letterSpacing: 1,
    fontSize: scaledSize(18),
    fontFamily: Fonts.regular
  }
});

export default CustomHeader;
