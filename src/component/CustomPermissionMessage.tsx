import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scaledSize } from '../utilies/Utilities';
import CustomVectorIcon from './CustomVectorIcon';

interface Props {
  onPressClose: () => void;
  permissionMessage: string;
}

export default function PremiumPermissionModal({
  onPressClose,
  permissionMessage,
}: Props) {
  return (
    <View
      // colors={['#E0F2F1', '#F1F5F9']}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={onPressClose}
          style={styles.closeBtn}
          activeOpacity={0.8}
        >
          <CustomVectorIcon
            iconLibrary="MaterialIcons"
            iconName="close"
            size={20}
            onPress={onPressClose}
            style={{ color: '#444' }}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Permission Required</Text>

        {/* Red Info Icon */}
        <View style={styles.iconWrapper}>
          <LinearGradient
            colors={['#FF6B6B', '#DC2626']}
            style={styles.iconCircle}
          >
            <Text style={styles.iconText}>i</Text>
          </LinearGradient>
        </View>

        {/* Message */}
        <Text style={styles.message}>
          {permissionMessage}
        </Text>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Linking.openSettings();
            onPressClose();
          }}
        >
          <LinearGradient
            colors={['#0E7490', '#67C6D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Open Settings</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf:'flex-start'
  },

  card: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 25,

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 15 },
    elevation: 15,
  },

  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 25,
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: 25,
  },

  iconCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#DC2626',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },

  iconText: {
    fontSize: 38,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 35,
  },

  button: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});