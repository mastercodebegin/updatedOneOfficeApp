import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useMemo } from 'react'
import Spinner from 'react-native-loading-spinner-overlay';
import { scaledSize } from '../utilies/Utilities';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import * as Progress from 'react-native-progress';

interface S {
  isLoading: boolean;
  text?: string;
  progress?: number;
  filesFound?: number;
}

export default function CustomSpinner(props: S) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const showProgress = props.progress !== undefined && props.progress >= 0;

  return (
    <Spinner
      visible={props.isLoading}
      animation="fade"
      overlayColor="rgba(0, 0, 0, 0.3)" // dim background
      customIndicator={
        <View style={styles.box}>
          {showProgress ? (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Text style={styles.progressTitle}>{props.text || 'Scanning your device...'}</Text>
              <Text style={styles.filesFoundText}>{`${props.filesFound || 0} files found`}</Text>
              <Progress.Bar
              indeterminate={props.progress === 0}
                progress={props.progress / 100}
                width={scaledSize(220)}
                height={scaledSize(12)}
                borderRadius={scaledSize(6)}
                color={theme.themeColor}
                unfilledColor={theme.buttonBGColor}
                borderColor={theme.borderColor}
                style={{ marginTop: scaledSize(18) }}
                useNativeDriver={true}
              />
              <Text style={styles.progressPercentage}>{`${props.progress || 0}% complete`}</Text>
            </View>
          ) : (
            <>
              <ActivityIndicator
                size="large"
                color={theme.themeColor}
              />
              <Text style={styles.text}>{props.text || 'Loading...'}</Text>
            </>
          )}
        </View>
      }
    />
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  box: {
    width: scaledSize(280),
    paddingVertical: scaledSize(35),
    borderRadius: scaledSize(24),
    backgroundColor: theme.bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  text: {
    marginTop: scaledSize(20),
    fontSize: scaledSize(14),
    letterSpacing: 0.5,
    color: theme.primaryTextColor,
  },
  progressTitle: {
    marginBottom: scaledSize(12),
    fontSize: scaledSize(18),
    color: theme.primaryTextColor,
    fontWeight: '600',
  },
  filesFoundText: {
    fontSize: scaledSize(13),
    color: theme.secondaryTextColor,
    marginBottom: scaledSize(18),
  },
  progressPercentage: {
    marginTop: scaledSize(16),
    fontSize: scaledSize(14),
    color: theme.secondaryTextColor,
    fontWeight: '500',
  },
});