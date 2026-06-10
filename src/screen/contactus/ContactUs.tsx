import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
} from 'react-native';

import HeaderComponent from '../../component/CustomHeader';
import { scaledSize } from '../../utilies/Utilities';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import { useTheme } from '../theme/useTheme';
import { mediumBG } from '../../assets/GlobalImages';

export default function ContactUs({ navigation }) {
  const { mode, theme } = useTheme();

  const isDark = mode === 'dark';

  const colors = {
    background: isDark ? theme.bgContainor : '#F8FAFC',

    title: isDark ? '#FFFFFF' : '#0F172A',

    description: isDark ? '#94A3B8' : '#64748B',

    card: isDark ? theme.bgColor : '#FFFFFF',

    border: isDark ? theme.borderColor : '#E2E8F0',

    primary: theme.themeColor,

    primaryLight: isDark
      ? 'rgba(37,99,235,0.15)'
      : '#EFF6FF',

    buttonText: '#FFFFFF',

    footer: isDark ? '#64748B' : '#94A3B8',
  };

  const onEmailPress = () => {
    Linking.openURL('mailto:oriontech900@gmail.com');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}>
      <View style={styles.header}>
        <HeaderComponent
          title="Contact Us"
          onPressBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Support Illustration */}
        <Image
          source={mediumBG}
          resizeMode="contain"
          style={styles.image}
        />

        <Text
          style={[
            styles.title,
            {
              color: colors.title,
            },
          ]}>
          We're here to help!
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.description,
            },
          ]}>
          Questions, feedback, or feature requests?
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.description,
            },
          ]}>
          Reach out — we'll get back to you fast.
        </Text>

        {/* Email Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onEmailPress}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}>
            <Text style={styles.icon}>✉️</Text>
          </View>

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.title,
                },
              ]}>
              Email Support
            </Text>

            <Text
              style={[
                styles.email,
                {
                  color: theme.themeColor,
                },
              ]}>
              OrionTech900@gmail.com
            </Text>

            <Text
              style={[
                styles.replyText,
                {
                  color: colors.description,
                },
              ]}>
              {/* We usually reply within 24 hours. */}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onEmailPress}
          style={[
            styles.button,
            {
              backgroundColor: theme.buttonBGColor,
              borderColor:theme.borderColor
            },
          ]}>
          <Text
            style={[
              styles.buttonText,
              {
                color: theme.iconColor,
              },
            ]}>
            Send Email
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.footer,
            {
              color: colors.footer,
            },
          ]}>
          Thank you for using our app!
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: scaledSize(90),
  },

  content: {
    paddingHorizontal: scaledSize(24),
    paddingBottom: scaledSize(40),
    alignItems: 'center',
  },

  image: {
    width: scaledSize(260),
    height: scaledSize(220),
    marginTop: scaledSize(10),
  },

  title: {
    fontSize: scaledSize(24),
    fontFamily: Fonts.PTSerifBold,
    marginTop: scaledSize(10),
    textAlign: 'center',
  },

  description: {
    fontSize: scaledSize(15),
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginTop: scaledSize(6),
    lineHeight: scaledSize(22),
  },

  card: {
    width: '100%',
    marginTop: scaledSize(35),
    borderRadius: scaledSize(12),
    borderWidth: 1,
    padding: scaledSize(18),
    paddingTop: scaledSize(14),
    paddingBottom: scaledSize(10),
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: scaledSize(50),
    height: scaledSize(50),
    borderRadius: scaledSize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: scaledSize(24),
  },

  cardContent: {
    flex: 1,
    marginLeft: scaledSize(14),
  },

  cardTitle: {
    fontSize: scaledSize(16),
    fontFamily: Fonts.regular,
    
  },

  email: {
    fontSize: scaledSize(15),
    fontFamily: Fonts.regular,
    marginTop: scaledSize(4),
    letterSpacing:.5
  },

  replyText: {
    fontSize: scaledSize(13),
    fontFamily: Fonts.regular,
    marginTop: scaledSize(4),
  },

  button: {
    width: '100%',
    height: scaledSize(56),
    borderWidth:.5,
    borderRadius: scaledSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaledSize(24),

    // shadowOpacity: 0.12,
    // shadowRadius: 10,
    // shadowOffset: {
    //   width: 0,
    //   height: 5,
    // },
    // elevation: 3,
  },

  buttonText: {
    fontSize: scaledSize(13),
    fontFamily: Fonts.regular,
    letterSpacing:1
  },

  footer: {
    marginTop: scaledSize(50),
    fontSize: scaledSize(14),
    fontFamily: Fonts.regular,
  },
});