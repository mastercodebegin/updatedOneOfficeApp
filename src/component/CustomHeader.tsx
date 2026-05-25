import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, SafeAreaView } from "react-native";

// import Icon from "react-native-vector-icons/EvilIcons";
import Icon from "react-native-vector-icons/FontAwesome5";
import CustomVectorIcon from "./CustomVectorIcon";
import CustomCloseIcon from "./CustomCloseIcon";
import { scaledSize, Utility } from "../utilies/Utilities";
import { COLORS } from "../utilies/GlobalColors";
import { Fonts } from "../assets/fonts/GlobalFonts";
import { Theme } from "../screen/theme/ThemeConfig";
import { useTheme } from "../screen/theme/useTheme";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface myProps {
  title: any;
  isBackIconHide?: boolean;
  isCloseIconShow?: boolean;
  onPressBack?: () => any;
  onShare?: () => any;
  isHeaderTransparent?: boolean
  isShareIconShow: boolean
  onPressCloseIcon?: () => any;
}

const window = Dimensions.get("window");



const CustomHeader = (props: myProps) => {
  const { title, isBackIconHide = false, onPressBack = () => { }, onShare = () => { },
    isHeaderTransparent = false,
    onPressCloseIcon, isCloseIconShow = false, isShareIconShow = false } = props

  const { theme, mode } = useTheme()

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme, mode])


  return (
    <>
      <View style={{
        flex: 1, flexDirection: 'row',
      }}>
        <SafeAreaView style={{ ...styles.header, backgroundColor: isHeaderTransparent ? 'transparent' : theme.bgColor }}>

          {/* Back Button */}
          {isBackIconHide ? <></> : <TouchableOpacity
            style={{ ...styles.iconBtn, left: isBackIconHide ? 0 : scaledSize(10) }}
            onPress={() => {
              onPressBack()
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.iconColor} />
          </TouchableOpacity>}

          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {Utility.string.getFirstLetterCapitalize(title)}
          </Text>

          {/* Right Actions */}
          <View style={styles.rightActions}>

            {/* <TouchableOpacity
              style={styles.iconBtn}
            >
              <Text style={styles.iconLabel}>PDF</Text>
            </TouchableOpacity> */}

            {isShareIconShow && <TouchableOpacity
              style={styles.iconBtn}
              onPress={onShare}
            >
              <MaterialIcons name="share" size={22} color={theme.iconColor} />
            </TouchableOpacity>}

            {isCloseIconShow && <TouchableOpacity
              style={styles.iconBtn}
            // onPress={() => shareFile(data)}
            >
              <CustomVectorIcon iconLibrary="Ionicons" iconName="close-sharp" style={{ color: theme.iconColor }} />
            </TouchableOpacity>}


          </View>

        </SafeAreaView>
      </View>
    </>
  );
};

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({

  titleInput: {
    color: COLORS.black,
    letterSpacing: 1,
    fontSize: scaledSize(18),
    fontFamily: Fonts.regular
  },
  title: {
    flex: 1,
    fontSize: scaledSize(16),
    left: scaledSize(10),
    fontWeight: '500',
    color: theme.primaryTextColor,
    marginHorizontal: scaledSize(8),
    fontFamily: Fonts.regular,
    letterSpacing: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgColor,
    // marginTop:20,
    paddingHorizontal: 8,
    paddingVertical: scaledSize(10),
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#ddd',
  },

  iconBtn: {
    height: scaledSize(32),
    paddingHorizontal: scaledSize(8),
    borderRadius: scaledSize(6),
    backgroundColor: theme.buttonBGColor,   // dark filled background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaledSize(4),
  },
  iconLabel: {
    fontSize: scaledSize(11),
    fontWeight: '700',
    color: theme.primaryTextColor,             // white text on dark bg
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledSize(4),
  },
});

export default CustomHeader;
