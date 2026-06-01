import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../screen/theme/useTheme';
import { scaledSize, Utility } from '../utilies/Utilities';
import { Fonts } from '../assets/fonts/GlobalFonts';
import { Theme } from '../screen/theme/ThemeConfig';

interface CustomHeaderProps {
  title: string;
  leftSide?: React.ReactNode;
  rightSide?: React.ReactNode;
  isShowShareBtn?: boolean;
  onSharePress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  leftSide,
  rightSide,
  isShowShareBtn = false, // Default to false to not show share button unless specified
  onSharePress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const DefaultLeft = () => (
    <TouchableOpacity
      style={styles.defaultIconContainer}
      onPress={() => Utility.navigation.navigateToBack()}
    >
      <MaterialIcons name="arrow-back" size={scaledSize(24)} color={theme.primaryTextColor} />
    </TouchableOpacity>
  );

  const DefaultRight = () =>
    isShowShareBtn ? (
      <TouchableOpacity
        style={styles.defaultIconContainer}
        onPress={onSharePress}
      >
        <MaterialIcons name="share" size={scaledSize(22)} color={theme.primaryTextColor} />
      </TouchableOpacity>
    ) : <></>;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideContainer}>
        {leftSide !== undefined ? leftSide : <DefaultLeft />}
      </View>
      <Text style={styles.titleText} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.sideContainer, { alignItems: 'flex-end' }]}>
        {rightSide !== undefined ? rightSide : <DefaultRight />}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    backgroundColor: theme.bgColor,
    paddingHorizontal: scaledSize(8),
  },
  sideContainer: {
    minWidth: scaledSize(50),
    justifyContent: 'center',
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: scaledSize(18),
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: theme.primaryTextColor,
  },
  defaultIconContainer: {
    padding: scaledSize(8),
  },
});

export default CustomHeader;