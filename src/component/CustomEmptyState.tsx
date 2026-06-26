import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import { scaledSize } from '../utilies/Utilities';
import { Fonts } from '../assets/fonts/GlobalFonts';
import CustomVectorIcon from './CustomVectorIcon';

interface CustomEmptyStateProps {
  onPressReload: () => void;
}

const CustomEmptyState: React.FC<CustomEmptyStateProps> = ({ onPressReload }) => {
  const { theme, mode } = useTheme();
  const styles = createStyles(theme, mode);

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>No files found</Text>
      <Text style={styles.subtitle}>
        There are no files to display. Try refreshing to load files.
      </Text>
      <TouchableOpacity style={styles.reloadButton} onPress={onPressReload} activeOpacity={0.8}>
        <MaterialCommunityIcons name="refresh" size={scaledSize(18)} color={theme.themeColor} />
        <Text style={styles.buttonText}>Reload</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme, mode: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: scaledSize(24),
      backgroundColor: theme.bgContainor,
    },
    illustrationContainer: {
      width: scaledSize(180),
      height: scaledSize(100),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scaledSize(32),
    },
    icon: {
      opacity: 0.5,
      color:theme.themeColor
    },
    floatingElement: {
      position: 'absolute',
      backgroundColor: theme.buttonBGColor,
      borderRadius: 999,
      opacity: mode === 'dark' ? 0.2 : 0.5,
    },
    elementOne: {
      width: scaledSize(40),
      height: scaledSize(40),
      top: scaledSize(10),
      left: scaledSize(20),
    },
    elementTwo: {
      width: scaledSize(24),
      height: scaledSize(24),
      bottom: scaledSize(30),
      right: scaledSize(10),
    },
    elementThree: {
      width: scaledSize(16),
      height: scaledSize(16),
      top: scaledSize(40),
      right: scaledSize(30),
    },
    title: {
      fontSize: scaledSize(16),
      letterSpacing:1,
      fontFamily: Fonts.regular,
      color: theme.primaryTextColor,
      textAlign: 'center',
      marginBottom: scaledSize(16),
    },
    subtitle: {
      fontSize: scaledSize(12),
      fontFamily: Fonts.regular,
      color: theme.secondaryTextColor,
      textAlign: 'center',
      lineHeight: scaledSize(22),
      maxWidth: '80%',
      marginBottom: scaledSize(32),
    },
    reloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      height: scaledSize(46),
      width: scaledSize(140),
      borderRadius: scaledSize(10),
      // borderWidth: .5,
      borderColor: theme.themeColor,
    },
    buttonText: {
      color: theme.primaryTextColor,
      fontSize: scaledSize(15),
      fontFamily: Fonts.regular,
      marginLeft: scaledSize(8),
    },
  });

export default CustomEmptyState;