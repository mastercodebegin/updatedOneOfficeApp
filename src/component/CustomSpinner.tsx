import { View, Text,StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import Spinner from 'react-native-loading-spinner-overlay';
import { COLORS } from '../utilies/GlobalColors';
import { scaledSize } from '../utilies/Utilities';

interface S {
  isLoading: boolean;
  text?: string;
}

export default function CustomSpinner(props: S) {
  return (
    <Spinner
      visible={props.isLoading}
      animation="fade"
      overlayColor="rgba(0, 0, 0, 0.3)" // dim background
      customIndicator={
        <View style={styles.container}>
          <View style={styles.box}>
            <View>
            <Spinner
            indicatorStyle={{bottom:scaledSize(20)}}
              visible={true}
              size={scaledSize(36)}

              overlayColor="transparent"
              color={COLORS.THEME_COLOR}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: scaledSize(220),
    paddingVertical: scaledSize(25),
    borderRadius: scaledSize(18),
    backgroundColor: '#fff',
    alignItems: 'center',
    height:scaledSize(150),

    // Android shadow
    elevation: 5,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  text: {
    marginTop: scaledSize(70),
    fontSize: scaledSize(12),
    letterSpacing:1,
    color: '#000',
    fontWeight: '500',
  },
});