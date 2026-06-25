import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { View, useWindowDimensions, PermissionsAndroid, Image, Text, Alert, Linking, Platform, AppState } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
// import GoogleAdd from './src/component/DisplayAdd';
import Dashboard from './src/screen/dashboard/Dashboard';
import ImagesToPdfConverter from './src/component/ImagesToPdfConverter';
// import Admob from './src/component/Admob';
import Splashscreen from './src/screen/splash/Splashscreen';
import { Provider, useDispatch } from 'react-redux';
import Store from './src/redux/Store';
import { heightFromPercentage, navigationRef, scaledSize, scaleRatio, setNavigator } from './src/utilies/Utilities';
import { useColorScheme } from 'react-native';
// import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import PdfViewer from './src/component/PdfView';
import ReadSystemFile from './src/component/ReadSystemFile';

// import ManageExternalStorage from 'react-native-manage-external-storage';
import MultiplePdfView from './src/component/MultiplePdfView';
import ContactUs from './src/screen/contactus/ContactUs';
// import WordReader from './src/screen/wordFileReader/WordReader';
// import WordFilesList from './src/screen/wordFileReader/WordFilesList';
// import { ToastProvider } from 'react-native-toast-notifications'
// import { Book, Converter, Home, MSExcel } from './src/assets/GlobalImages';
// import XslxFilesList from './src/screen/XlsxFilReader/XslxFilesList';
// import XslxReader from './src/screen/XlsxFilReader/XslxReader';
// import PPTReader from './src/screen/PPTFilReader/PPTReader';
// import PPTFilesList from './src/screen/PPTFilReader/PPTFilesList';
// import EditImage from './src/screen/imageEditor/EditImage';
// import MultipleDocumentImageView from './src/screen/documentScanner/DisplayMultipleDocumentImage';
import DisplayMultipleDocumentImage from './src/screen/documentScanner/DisplayMultipleDocumentImage';
import DocumentScan from './src/screen/documentScanner/DocumentScan';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS } from './src/utilies/GlobalColors';
// import FontAwesome from 'react-native-vector-icons/FontAwesome'
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SaveUserCardDetails from './src/screen/dashboard/SaveUserCardDetails';
import SettingsScreen from './src/screen/settings/SettingsScreen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { initDB } from './src/db/migration';

import { useTheme } from './src/screen/theme/useTheme';
import { getLocalData, removeLocalData, setLocalData } from './src/utilies/storageUtility';
import { asyncStorageKeyName, CONSTANT } from './src/utilies/Constants';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';  // Import the Toast component
// import { Fonts } from './src/assets/fonts/GlobalFonts';
import { checkForUpdate } from './src/utilies/InAppUpdates'
import { Provider as PaperProvider } from 'react-native-paper';

// import VersionCheck from 'react-native-version-check';

// import { CONSTANT } from './src/utilies/Constants';
import { NotificationService } from './src/service/NotificationService'
export default function App(props) {
  const Stack = createNativeStackNavigator();
  const [uri, setUri] = React.useState()
  const [result, setResult] = React.useState(false);
  const size = scaledSize(24)
  const screensData = [
    { name: 'Files', component: Dashboard, focus: (color) => <Ionicons name='documents' color={color} size={size} />, unFocus: (color) => <Ionicons name='documents-outline' color={color} size={size} /> },
    {
      name: 'Document', component: DocumentScan, focus: (color) => <MaterialCommunityIcons name='line-scan' color={color} size={size + 4} style={{ marginBottom: scaledSize(4) }} />, unFocus: (color) => <MaterialCommunityIcons name='line-scan' color={color}
        size={size + 4} style={{ marginBottom: scaledSize(4) }} />
    },
    { name: 'Converter', component: ImagesToPdfConverter, focus: (color) => <Ionicons name='swap-horizontal' color={color} size={size} />, unFocus: (color) => <Ionicons name='swap-horizontal-outline' color={color} size={size} /> },
    { name: 'Settings', component: SettingsScreen, focus: (color) => <Ionicons name='settings' color={color} size={size} />, unFocus: (color) => <Ionicons name='settings-outline' color={color} size={size} /> },
  ]

  const BottomTabs = createBottomTabNavigator();
  // React.useEffect(() => {
  // checkForUpdate()

  // }, [])

  const checkForUpdate = async () => {
    const latestVersion = await VersionCheck.getLatestVersion();
    const currentVersion = VersionCheck.getCurrentVersion();
    console.log('Current Version:', currentVersion);
    console.log('Latest Version:', latestVersion);

    const updateInfo = await VersionCheck.needUpdate({
      currentVersion,
      latestVersion,
    });

    if (updateInfo?.isNeeded) {
      Alert.alert(
        "Update Available",
        "A new version is available. Would you like to update now?",
        [
          { text: "Update Now", onPress: () => Linking.openURL(CONSTANT.ANDROID_SHARE_LINK) },
          { text: "Later", style: "cancel" },
        ]
      );
      console.log('🚨 Update available!');
    } else {

      console.log('✅ App is up to date.');
    }
  };






  React.useEffect(() => {
    (async () => {
      await initDB();

      if (Platform.OS === 'android') {
        const ManageExternalStorage =
          require('react-native-manage-external-storage').default;

        ManageExternalStorage.checkAndGrantPermission(
          () => setResult(false),
          () => setResult(true),
        );
      }
    })();
    NotificationService.requestUserPermission()
    NotificationService.showNotification()
  }, []);
  // React.useEffect(() => {
  //   (async () => {
  //     console.log('Platform:', Platform.OS);

  //     await initDB();

  //     if (Platform.OS === 'android') {
  //       console.log('Android code running');

  //       ManageExternalStorage.checkAndGrantPermission(
  //         () => setResult(false),
  //         () => setResult(true),
  //       );
  //     }
  //   })();
  // }, []);


  function MyTabs() {
    const { theme, mode, toggleTheme } = useTheme();
    const colorScheme = useColorScheme();

    React.useEffect(() => {
      const savedTheme = getLocalData(asyncStorageKeyName.THEME_MODE);
      // On first launch, if no theme is saved, sync with OS theme.
      console.log('colorsec', colorScheme, 'savedthm', savedTheme);

      if (savedTheme == null && colorScheme) {
        if (mode !== colorScheme) {
          // This should handle state update and storage persistence.
          toggleTheme();
        } else {
          // If default theme already matches OS, just save it to prevent re-checking.
          setLocalData(asyncStorageKeyName.THEME_MODE, colorScheme);
        }
      }
    }, [colorScheme]);


    return (
      <BottomTabs.Navigator screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: mode == 'dark' ? theme.bgColor : '#FFFFFF',
          height: heightFromPercentage(8),
          borderTopWidth: 1,
          position: 'absolute',
          borderTopColor: theme.borderColor,
          bottom: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: mode === 'dark' ? 0.2 : 0.05,
          shadowRadius: 5,


        }
      }}>
        {screensData.map((item, key) =>
          <BottomTabs.Screen key={key} name={item.name}
            component={item.component}
            listeners={({ navigation, route }) => ({
              focus: () => {
                setTimeout(() => {
                }, 50);

              },
            })}
            options={{
              tabBarIcon: ({ focused }) => (<View style={{ alignItems: 'center', justifyContent: 'center', top: scaledSize(2) }}>
                {focused ? item.focus(theme.themeColor) : item.unFocus('gray')}
              </View>),
              tabBarLabel: ({ focused }) => (
                <Text style={{
                  color: theme.primaryTextColor,
                  fontSize: scaledSize(8), letterSpacing: 1, top: scaledSize(2)
                }}>{item.name}</Text>
              ),
            }}
          />)}
      </BottomTabs.Navigator>
    );
  }
  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>{/* for gesture handler */}
        <BottomSheetModalProvider>

          <MenuProvider>
            <Provider store={Store}>
              <NavigationContainer ref={navigationRef}>
                <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
                  {/* <Stack.Screen name="Splashscreen" component={Splashscreen} /> */}
                  <Stack.Screen name="Home" component={MyTabs} />
                  <Stack.Screen name="Dashboard" component={Dashboard} />
                  {/* <Stack.Screen name="EditImage" component={EditImage} /> */}
                  <Stack.Screen name="ReadSystemFile" component={ReadSystemFile} />
                  <Stack.Screen name="PdfViewer" component={PdfViewer} />
                  <Stack.Screen name="MultiplePdfView" component={MultiplePdfView} />
                  {/* <Stack.Screen name="WordReader" component={WordReader} /> */}
                  {/* <Stack.Screen name="XslxReader" component={XslxReader} /> */}
                  {/* <Stack.Screen name="PPTReader" component={PPTReader} /> */}
                  {/* <Stack.Screen name="WordFilesList" component={WordFilesList} /> */}
                  <Stack.Screen name="DocumentScan" component={DocumentScan} />
                  <Stack.Screen name="DisplayMultipleDocumentImage" component={DisplayMultipleDocumentImage} />
                  {/* <Stack.Screen name="XslxFilesList" component={XslxFilesList} /> */}
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="SaveUserCardDetails" component={SaveUserCardDetails} />
                  {/* <Stack.Screen name="PPTFilesList" component={PPTFilesList} /> */}
                  <Stack.Screen name="ImagesToPdfConverter" component={ImagesToPdfConverter} />
                  <Stack.Screen name="contactus" component={ContactUs} />
                </Stack.Navigator>
              </NavigationContainer>
            </Provider>
          </MenuProvider>
          {/* <Toast config={toastConfig} /> */}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}