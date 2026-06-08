import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import {useTheme}  from '../screen/theme/useTheme';
import { scaledSize } from '../utilies/Utilities';
import { Theme } from 'src/screen/theme/ThemeConfig';

type Props = {
  onPress: () => void;
  isLoading?: boolean;
};

export default function CustomGoogleBtn({
  onPress,
  isLoading = false,
}: Props) {
const {theme,mode} = useTheme();

const styles = useMemo(
  () => createStyles(theme,mode),
  [theme],
);


  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isLoading}
      onPress={onPress}
      style={styles.button}
    >
      <Image
        source={{
          uri: 'https://developers.google.com/identity/images/g-logo.png',
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.text}>
        {isLoading
          ? 'Please wait...'
          : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme,mode:string) => {
  return StyleSheet.create({
    button: {
      height: scaledSize(52),

      borderRadius: scaledSize(28),

      borderWidth: 1.2,

      borderColor: theme.borderColor,

      backgroundColor: theme.bgContainor,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: scaledSize(20),

      marginHorizontal: scaledSize(20),

      shadowOpacity:
        theme.bgColor === '#222222'
          ? 0
          : 0.15,

      shadowRadius: 6,

      elevation: 2,
    },

    logo: {
      width: scaledSize(24),

      height: scaledSize(24),

      marginRight: scaledSize(14),
    },

    text: {
      color: theme.primaryTextColor,

      fontSize: scaledSize(17),

      fontWeight: '600',

      letterSpacing: 0.3,
    },
  });
};