import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

interface CustomProgressBarProps {
  progress: number;
}

const CustomProgressBar: React.FC<CustomProgressBarProps> = ({ progress }) => {
  const isComplete = progress === 100;

  return (
    <View style={[styles.container, isComplete && styles.glow]}>
      <Progress.Bar
        indeterminate={false}
        progress={progress / 100}
        width={null} // Use flex-grow to fill width
        height={10}
        borderRadius={999}
        color={'#34C759'}
        unfilledColor={'#2A2A2A'}
        borderColor={'transparent'} // Border is handled by the container
        useNativeDriver={true}
        style={styles.progressBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2A2A2A', // The track color
  },
  progressBar: {
    width: '100%',
    height: '100%',
  },
  glow: {
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default CustomProgressBar;