import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Linking, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { scaledSize, Utility } from '../../utilies/Utilities';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Theme } from '../theme/ThemeConfig';
import { getLocalData } from '../../utilies/storageUtility';
import { asyncStorageKeyName } from '../../utilies/Constants';
import { useGoogleAuth } from '../../customhooks/useGoogleAuth';
import CustomSpinner from '../../component/CustomSpinner';

const SettingsScreen = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState();
  const {signIn,signOut,loading} = useGoogleAuth()

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const data = getLocalData(asyncStorageKeyName.USER_DETAILS)
    setUser(data)
  }, [])

  const handleSupportEmail = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Support Request');
  };

  const handleNavigateToUsers = () => {
    Utility.navigation.navigateTo('SaveUserCardDetails');
  };

  const handleLogin = () => {
    signIn();
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Feather name="user" size={scaledSize(40)} color={theme.themeColor} />
        </View>
        <View>
          <Text style={styles.profileName}>{user ? 'John Doe' : 'Guest User'}</Text>
          <Text style={styles.profileEmail}>{user ? 'john.doe@example.com' : 'guest@example.com'}</Text>
        </View>
      </View>

      <View style={styles.settingsList}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="theme-light-dark" size={scaledSize(22)} color={theme.secondaryTextColor} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: theme.themeColor }}
            thumbColor={theme.bgColor}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={mode === 'dark'}
          />
        </View>

        <TouchableOpacity style={styles.settingRow} onPress={handleNavigateToUsers}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="account-group-outline" size={scaledSize(22)} color={theme.secondaryTextColor} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>User Management</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={scaledSize(24)} color={theme.secondaryTextColor} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleSupportEmail}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="email-outline" size={scaledSize(22)} color={theme.secondaryTextColor} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Support</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={scaledSize(24)} color={theme.secondaryTextColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        {user ? (
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={scaledSize(20)} color={'#FF3B5C'} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <MaterialCommunityIcons name="login" size={scaledSize(20)} color={theme.themeColor} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
      <CustomSpinner isLoading={loading}/>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgContainor,
  },
  header: {
    padding: scaledSize(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  headerTitle: {
    fontSize: scaledSize(22),
    fontWeight: 'bold',
    color: theme.primaryTextColor,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaledSize(20),
    backgroundColor: theme.bgColor,
    margin: scaledSize(16),
    borderRadius: scaledSize(16),
  },
  avatar: {
    width: scaledSize(70),
    height: scaledSize(70),
    borderRadius: scaledSize(35),
    backgroundColor: theme.buttonBGColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaledSize(16),
  },
  profileName: {
    fontSize: scaledSize(18),
    fontWeight: 'bold',
    color: theme.primaryTextColor,
  },
  profileEmail: {
    fontSize: scaledSize(14),
    color: theme.secondaryTextColor,
    marginTop: 4,
  },
  settingsList: {
    marginHorizontal: scaledSize(16),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaledSize(16),
    backgroundColor: theme.bgColor,
    paddingHorizontal: scaledSize(16),
    borderRadius: scaledSize(12),
    marginBottom: scaledSize(12),
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: scaledSize(16),
  },
  settingLabel: {
    fontSize: scaledSize(16),
    color: theme.primaryTextColor,
  },
  footer: {
    paddingHorizontal: scaledSize(16),
    paddingVertical: scaledSize(20),
    // marginTop: 'auto',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.buttonBGColor,
    paddingVertical: scaledSize(16),
    borderRadius: scaledSize(12),
    // borderWidth: 1,
    borderColor: theme.themeColor,
  },
  buttonIcon: {
    marginRight: scaledSize(10),
  },
  buttonText: {
    fontSize: scaledSize(16),
    fontWeight: '500',
    color: theme.themeColor,
  },
  logoutButton: {
    borderColor: '#FF3B5C',
  },
  logoutButtonText: {
    color: '#FF3B5C',
  },
});

export default SettingsScreen;