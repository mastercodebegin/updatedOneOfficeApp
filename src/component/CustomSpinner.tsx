import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useMemo } from 'react'
import Spinner from 'react-native-loading-spinner-overlay';
import { scaledSize } from '../utilies/Utilities';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';

interface S {
  isLoading: boolean;
  text?: string;
}

export default function CustomSpinner(props: S) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Spinner
      visible={props.isLoading}
      animation="fade"
      overlayColor="rgba(0, 0, 0, 0.3)" // dim background
      customIndicator={
        <View style={styles.container}>
          <View style={styles.box}>
            <View style={{marginTop: scaledSize(20)}}>
              <ActivityIndicator
                size="large"
                color={theme.themeColor}
              />

            </View>
            <View>

              <Text style={styles.text}>
                {props.text || 'Loading files...'}
              </Text>
            </View>
          </View>
        </View>
      }
    />
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: scaledSize(220),
    paddingVertical: scaledSize(25),
    borderRadius: scaledSize(12),
    backgroundColor: theme.bgColor,
    alignItems: 'center',
    height: scaledSize(150),

    // Android shadow
    elevation: 5,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  text: {
    marginTop: scaledSize(35),
    fontSize: scaledSize(12),
    letterSpacing: 1,
    color: theme.primaryTextColor,
  },
});