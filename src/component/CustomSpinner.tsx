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
            <>
              <Text style={styles.progressTitle}>{props.text || 'Scanning files...'}</Text>
              <Progress.Bar
                progress={props.progress / 100}
                width={scaledSize(180)}
                color={theme.themeColor}
                unfilledColor={theme.buttonBGColor}
                borderColor={theme.borderColor}
              />
              <Text style={styles.progressPercentage}>{`${props.progress}%`}</Text>
            </>
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
    width: scaledSize(220),
    paddingVertical: scaledSize(25),
    borderRadius: scaledSize(12),
    backgroundColor: theme.bgColor,
    alignItems: 'center',
    height: scaledSize(150),
    justifyContent: 'center',

    // Android shadow
    elevation: 5,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  text: {
    marginTop: scaledSize(20),
    fontSize: scaledSize(12),
    letterSpacing: 1,
    color: theme.primaryTextColor,
  },
  progressTitle: {
    marginBottom: scaledSize(15),
    fontSize: scaledSize(14),
    color: theme.primaryTextColor,
    fontWeight: '500',
  },
  progressPercentage: {
    marginTop: scaledSize(10),
    fontSize: scaledSize(12),
    color: theme.secondaryTextColor,
    fontWeight: '500',
  },
});