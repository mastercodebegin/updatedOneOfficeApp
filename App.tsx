import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { View, useWindowDimensions, PermissionsAndroid, Image, Text, StatusBar, Alert, Linking, Platform } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
// import GoogleAdd from './src/component/DisplayAdd';
import Dashboard from './src/screen/dashboard/Dashboard';
import ImagesToPdfConverter from './src/component/ImagesToPdfConverter';
// import Admob from './src/component/Admob';
import Splashscreen from './src/screen/splash/Splashscreen';
import { Provider } from 'react-redux';
import Store from './src/redux/Store';
import { heightFromPercentage, navigationRef, scaledSize, scaleRatio, setNavigator } from './src/utilies/Utilities';
import {Root as PopupRootProvider} from '@sekizlipenguen/react-native-popup-confirm-toast';
// import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import PdfViewer from './src/component/PdfView';
import ReadSystemFile from './src/component/ReadSystemFile';

import ManageExternalStorage from 'react-native-manage-external-storage';
import MultiplePdfView from './src/component/MultiplePdfView';
import ContactUs from './src/screen/contactus/ContactUs';
import WordReader from './src/screen/wordFileReader/WordReader';
import WordFilesList from './src/screen/wordFileReader/WordFilesList';
import { ToastProvider } from 'react-native-toast-notifications'
import { Book, Converter, Home, MSExcel } from './src/assets/GlobalImages';
import XslxFilesList from './src/screen/XlsxFilReader/XslxFilesList';
import XslxReader from './src/screen/XlsxFilReader/XslxReader';
import PPTReader from './src/screen/PPTFilReader/PPTReader';
import PPTFilesList from './src/screen/PPTFilReader/PPTFilesList';
import EditImage from './src/screen/imageEditor/EditImage';
import MultipleDocumentImageView from './src/screen/documentScanner/DisplayMultipleDocumentImage';
import DisplayMultipleDocumentImage from './src/screen/documentScanner/DisplayMultipleDocumentImage';
import DocumentScan from './src/screen/documentScanner/DocumentScan';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS } from './src/utilies/GlobalColors';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';  // Import the Toast component
// import { Fonts } from './src/assets/fonts/GlobalFonts';
// import { checkForUpdate } from './src/utilies/InAppUpdates'

// import VersionCheck from 'react-native-version-check';

// import { CONSTANT } from './src/utilies/Constants';

export default function App(props) {
  const Stack = createNativeStackNavigator();
  const [uri, setUri] = React.useState()
  const [result, setResult] = React.useState(false);
  const size = scaledSize(24)
  const screensData = [
    { name: 'Documents', component: Dashboard, focus: <Ionicons name='documents' color={COLORS.THEME_COLOR} size={size} />, unFocus: <Ionicons name='documents' color={'gray'} size={size} /> },
    { name: 'Scan', component: DocumentScan, focus: <FontAwesome5 name='camera' color={COLORS.THEME_COLOR} size={size + 10} style={{ marginBottom: scaledSize(4) }} />, unFocus: <FontAwesome5 name='camera' color={'gray'} size={size + 10} style={{ marginBottom: scaledSize(4) }} />, },
    { name: 'Converter', component: ImagesToPdfConverter, focus: <FontAwesome name='refresh' color={COLORS.THEME_COLOR} size={size} />, unFocus: <FontAwesome name='refresh' color={'gray'} size={size} />, },
    
  ]
  const BottomTabs = createBottomTabNavigator();

  // React.useEffect(() => {
  //   checkForUpdate()

  // }, [])

  // const checkForUpdate = async () => {
  //   const latestVersion = await VersionCheck.getLatestVersion(); 
  //   const currentVersion = VersionCheck.getCurrentVersion();   
  //   console.log('Current Version:', currentVersion);
  //   console.log('Latest Version:', latestVersion);

  //   const updateInfo = await VersionCheck.needUpdate({
  //     currentVersion,
  //     latestVersion,
  //   });

  //   if (updateInfo?.isNeeded) {
  //     Alert.alert(
  //       "Update Available",
  //       "A new version is available. Would you like to update now?",
  //       [
  //         { text: "Update Now", onPress: () => Linking.openURL(CONSTANT.ANDROID_SHARE_LINK) },
  //         { text: "Later", style: "cancel" },
  //       ]
  //     );
  //     console.log('🚨 Update available!');
  //   } else {

  //     console.log('✅ App is up to date.');
  //   }
  // };







  React.useEffect(() => {
    async function AskPermission() {
      await ManageExternalStorage.checkAndGrantPermission(
        err => {
          setResult(false)
        },
        res => {
          setResult(true)
        },
      )
    }
    AskPermission() 
  }, []);

  // const toastConfig = {
    
  //   error: (props) => (
  //     <ErrorToast
  //       {...props}
  //       text1Style={{
  //         fontSize: scaledSize(12),
  //         color: 'black',
  //         fontFamily: Fonts.regular,
  //         letterSpacing: .5,
  //       }}
  //       text2Style={{
  //         fontSize: scaledSize(15),
  //         color: 'blue',

  //       }}

  //     />
  //   ),
   
  //   tomatoToast: ({ text1, text2, props }) => (
  //     <View style={{ height: scaledSize(54), width: '100%', backgroundColor: 'red' }}>
  //       <Text style={{ color: 'white', fontSize: scaledSize(16), fontFamily: FONTS.QuicksandBold }}>{text1}</Text>
  //       <Text style={{ color: 'white', fontSize: scaledSize(14), fontFamily: FONTS.QuicksandBold, marginLeft: scaledSize(10) }}>{text2}</Text>
  //     </View>
  //   )
  // };

  function MyTabs() {
    return (
      <BottomTabs.Navigator screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // backgroundColor:'red'
          height: heightFromPercentage(7),
        }}}>
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
              tabBarIcon: ({ focused }) => (<View style={{ alignItems: 'center', justifyContent: 'center',top:scaledSize(2) }}>
                {focused ? item.focus : item.unFocus}
              </View>),
              tabBarLabel: ({ focused }) => (
                <></>
              ),
            }}
          />)}
      </BottomTabs.Navigator>
    );
  }
  return (
    // <ToastProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>{/* for gesture handler */}
      <BottomSheetModalProvider>
        <PopupRootProvider>

          <MenuProvider>
            <Provider store={Store}>
              <NavigationContainer ref={navigationRef}>
                <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
                  {/* <Stack.Screen name="Splashscreen" component={Splashscreen} /> */}
                  <Stack.Screen name="Home" component={MyTabs} />
                  <Stack.Screen name="Dashboard" component={Dashboard} />
                 <Stack.Screen name="EditImage" component={EditImage} />
                  <Stack.Screen name="ReadSystemFile" component={ReadSystemFile} />
                  <Stack.Screen name="PdfViewer" component={PdfViewer} />
                  <Stack.Screen name="MultiplePdfView" component={MultiplePdfView} />
                  <Stack.Screen name="WordReader" component={WordReader} />
                  <Stack.Screen name="XslxReader" component={XslxReader} />
                  <Stack.Screen name="PPTReader" component={PPTReader} />
                  <Stack.Screen name="WordFilesList" component={WordFilesList} />
                  <Stack.Screen name="DocumentScan" component={DocumentScan} />
                  <Stack.Screen name="DisplayMultipleDocumentImage" component={DisplayMultipleDocumentImage} />
                  <Stack.Screen name="XslxFilesList" component={XslxFilesList} />
                  <Stack.Screen name="PPTFilesList" component={PPTFilesList} />
                  <Stack.Screen name="ImagesToPdfConverter" component={ImagesToPdfConverter} />
                  <Stack.Screen name="contactus" component={ContactUs} />
                </Stack.Navigator>
              </NavigationContainer>
            </Provider>
          </MenuProvider>
        </PopupRootProvider>
        {/* <Toast config={toastConfig} /> */}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>





  );
}