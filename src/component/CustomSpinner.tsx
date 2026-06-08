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
      overlayColor="rgba(0, 0, 0, 0.7)"
      customIndicator={
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.text}>{props.text || 'Loading...'}</Text>
        </View>
      }
    />
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  box: {
    width: scaledSize(120),
    height: scaledSize(120),
    borderRadius: scaledSize(20),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: scaledSize(20),
    fontSize: scaledSize(14),
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});