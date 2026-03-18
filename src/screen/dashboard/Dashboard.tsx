import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Text, StyleSheet,
  View, TouchableOpacity, SafeAreaView
  , useWindowDimensions, Image,
  Platform, BackHandler, AppState,
  Modal,
  Alert, KeyboardAvoidingView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { deleteFile, generateUniqueNumber, getConvertedPdfFileFromPhoneStorage, getFilesFromPhoneByFileExtention, navigateTo, scaledSize, toastForDeleteFile, widthFromPercentage, } from '../../utilies/Utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';


// import Icon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Feather';
import CustomMenu from '../../component/Menu'
import ReadSystemFile from '../../component/ReadSystemFile'
import ImagesToPdfConverter from '../../component/ImagesToPdfConverter'
import { Searchbar } from 'react-native-paper'
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Share from 'react-native-share';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import CustomSpinner from '../../component/CustomSpinner';
import VideoAddMob from '../../component/admob/VideoAdd';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../../utilies/GlobalColors';
import { clear, searchIcon } from '../../assets/GlobalImages';
import { AppShare, asyncStorageKeyName, CONSTANT } from '../../utilies/Constants';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import { useFocusEffect } from '@react-navigation/native';

import { Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import SaveUserCardDetails from './SaveUserCardDetails';
import WordReader from '../wordFileReader/WordReader';
import WordFilesList from '../wordFileReader/WordFilesList';
import XslxReader from '../XlsxFilReader/XslxReader';
import XslxFilesList from '../XlsxFilReader/XslxFilesList';
import { PermissionsAndroid } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';
import { checkIsUserViewedPdf, getBankList } from './FileSlice';
import { ErrorToast } from '../../component/CustomToast';
import mobileAds, { BannerAdSize } from 'react-native-google-mobile-ads';
import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';
import PPTFilesList from '../PPTFilReader/PPTFilesList';
import CustomErrorMsgModal from '../../component/CustomErrorMsgModal';
import CustomVectorIcon from '../../component/CustomVectorIcon';
import { CustomPhotoOrCameraSelectOption } from '../../component/CustomPhotoOrCameraSelectOption';
import { Overlay } from 'react-native-elements';
const pdfs = [
  {
    "ctime": null, "id": 86185, "mtime": "2024-10-17T09:51:47.024Z",
    "name": "4315XXXXXXXX7005_739857_Retail_Amazon_NORM.pdf",
    "path": "/storage/emulated/0/Download/4315XXXXXXXX7005_739857_Retail_Amazon_NORM.pdf",
    "size": 722729
  },
  {
    "ctime": null, "id": 826185, "mtime": "2024-10-17T09:51:47.024Z",
    "name": "HDFC.pdf",
    "path": "/storage/emulated/0/Download/4315XXXXXXXX7005_739857_Retail_Amazon_NORM.pdf",
    "size": 722729
  },
  {
    "ctime": null, "id": 8262185, "mtime": "2024-10-17T09:51:47.024Z",
    "name": "Axis.pdf",
    "path": "/storage/emulated/0/Download/4315XXXXXXXX7005_739857_Retail_Amazon_NORM.pdf",
    "size": 722729
  },
]

function Dashboard({ navigation, route }) {


  type DocumentTypes = {
    pdfFiles: Array<{ name: string }>;
    wordFiles: Array<{ name: string }>;
    xlsxFiles: Array<{ name: string }>;
    pptFiles: Array<{ name: string }>;
  };

  const [images, setImages] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [convertFilterData, setConvertFilterData] = useState([]);
  const [pdfData, setPdfData] = useState([]);
  const [documents, setDocuments] = useState<DocumentTypes>({
    pdfFiles: [],
    wordFiles: [],
    xlsxFiles: [],
    pptFiles: [],
  });
  const readPdfFileRef = React.useRef()
  const readConvertedPdfFileRef = React.useRef()

  const [convertedFiles, setConvertedFiles] = useState(
    []);

  const layout = useWindowDimensions();
  const [randomNumber, setRandomNumber] = useState(1)
  const [count, setCount] = useState('')
  const [isUserBack, setIsUserBack] = useState(false);
  const [isShowCardModal, setIsShowCardModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => setSearchQuery(query);
  const [uniqueNumber, setUniqueNumber] = React.useState(0)
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: asyncStorageKeyName.PDF_FILES, title: 'Pdf', },
    { key: asyncStorageKeyName.WORD_FILES, title: 'Word' },
    // { key: asyncStorageKeyName.XLSX_FILES, title: 'Excel' },
    // { key: asyncStorageKeyName.PPT_FILES, title: 'Ppt' },

  ]);
  const [screeName, setScreenName] = React.useState('Pdf')
  const toast = useToast();
  const dispatch = useDispatch();
  const response = useSelector((state) => state.FileSlice);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    console.log('response', response.files.map((v) => v.id));

  })



  const getPermission = async () => {
    try {
      const granted = PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      )
      if (await granted) { console.log("Granted"); }
      else { console.log("Not Granted"); }
    }
    catch (error) { console.log('error---------', error); }

  }
  useEffect(() => {
    const res = fetch('https://api.jsonsilo.com/public/fb20cc0e-8ad8-4e0d-971b-a4e7cbba310c').then(res => res.json()).then(res => console.log()).catch(err => console.log('err', err))
    // console.log('res=====',res);

    // dispatch(getBankList())
    getPermission()
  })

  const DesendingreadPdfFiles = async () => {
    console.log('Decending order by date-------');

    setIsLoading(true)
    setDocuments({
      pdfFiles: [],
      wordFiles: [],
      xlsxFiles: [],
      pptFiles: [],
    })
    const files = await getFilesFromPhoneByFileExtention(1)
    console.log('DesendingreadPdfFiles: ', files);

    setDocuments(files)
    setIsLoading(false)
    setUniqueNumber(generateUniqueNumber())
  }

  const readPdfFiles = async () => {
    console.log('Accending order by date-------');

    setIsLoading(true)
    const files = await getFilesFromPhoneByFileExtention(1)
    console.log('readPdfFiles:', files);

    setDocuments(files)
    setIsLoading(false)
    setUniqueNumber(generateUniqueNumber())
  }
  useEffect(() => {

    if (isFocused) {
      console.log('index', screeName)

      AsyncStorage.getItem(asyncStorageKeyName.ALL_FILES).then((check) => {
        const obj = JSON.parse(check)


        if (check && obj.pdfFiles.length > 0) {
          setDocuments(obj);
        }
        else {
          // console.log('else part-----');
          setIsLoading(true)

          const getAllFiles = async () => {
            let files = await getFilesFromPhoneByFileExtention(1)
            //  console.log('all files function called',files);
            setDocuments(files)
            setIsLoading(false)
            setUniqueNumber(generateUniqueNumber())


          }
          getAllFiles()

        }

      })

    }
  }, [])



  //Linking 
  useEffect(() => {
    let isRead = true

    Linking.addEventListener('url', (url) => {
      console.log('addEventListener', url);

      navigation.navigate('PdfViewer', { uri: url.url })
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setIsUserBack(true)

    });

    if (route?.params?.pdf) { setIsUserBack(true) }

    if (!isUserBack) {

      Linking.getInitialURL()
        .then((url) => {
          if (url && route?.params?.pdf == undefined) {
            console.log('listener2', url);

            navigation.navigate('PdfViewer', { uri: url })
          }
        })
        .catch((err) => {
          console.error('Error getting initial URL:', err)
        })
        ;
    }

    if (route?.params?.pdf == 'pdf' && pdfData.length == 0) {
      //checkStorage()
    }
    return () => {
      backHandler.remove();
    };


  }, [navigation, route, isFocused]);


  const deleteLocalStorageData = async () => {
    await AsyncStorage.removeItem('pdfFiles')
  }

  const deleteFileHandler = async (item) => {
    //@ts-ignore
    // console.log(item);

    try {
      setIsLoading(true)
      let files = await AsyncStorage.getItem(asyncStorageKeyName.ALL_FILES)
      const data = JSON.parse(files).filter((citem: { name: string, mtime: any }) => citem.name !== item.name && citem.mtime !== item.mtime)
      AsyncStorage.setItem('pdfFiles', JSON.stringify(files))
      deleteFile(item.path)
      setPdfData(data)
      setIsLoading(false)
      toastForDeleteFile(toast, 'File deleted successfully')


      // getPdfFilesFromPhoneStorage()
    }
    catch (err) {
      console.log('error-----', err);

    }
  }

  // will implement later if user add/download file needs to update

  // const checkStorage = async () => {
  //   const eventEmitter = new NativeEventEmitter();
  //   const subscription = eventEmitter.addListener('RNFSFileChanged', async (changedFiles) => {
  //     // Handle file system changes here
  //     console.log('File(s) changed:-----------------------------------------------', changedFiles);

  //   });
  //   const check = await AsyncStorage.getItem('pdfFiles')
  //   console.log('local storage=======', check);
  //   const obj = JSON.parse(check)
  //   console.log('obj storage=======', obj);
  //   if (check && obj.length > 0) {
  //     setPdfData(obj);
  //     console.log('if=======',);
  //   }
  //   else {
  //     console.log('else =======',);
  //    const files = getPdfFilesFromPhoneStorage()
  //    setPdfData(files)
  //   }

  //   // Return a cleanup function to remove the event listener when the component unmounts
  //   return () => {
  //     //watcher.remove();
  //   };

  // }



  const addCardDetails = () => {
    setIsShowCardModal(true)
  }

  const search = (data) => {
    // sending search text to readsystemfile screen to filter data
    setSearchQuery(data)


  }

  const convertedFilesearch = (data) => {
    setSearchQuery(data)
    console.log('value', data);
    // /console.log('pdfData--', pdfData);
    const result = convertedFiles.filter((item) => item.name.toUpperCase().startsWith(data.toUpperCase()))
    console.log('search-----', result);
    setConvertFilterData(result)
    //setFiles(result)

  }



  const openFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        copyTo: 'cachesDirectory',
        type: [DocumentPicker.types.pdf,
        DocumentPicker.types.docx,
        DocumentPicker.types.xlsx,
        DocumentPicker.types.images,
        DocumentPicker.types.ppt]
      })
      // console.log('response-----', res);
      // i want a file extension
      const fileExtension = res.name.split('.').pop()
      console.log('fileExtension--------------', res);
      console.log('fileExtension--------------', fileExtension);


      if (fileExtension === 'pdf') {
        console.log('in pdf');

        navigation.navigate('PdfViewer', { uri: res.fileCopyUri })
      }
      else if (fileExtension === 'docx') {
        navigation.navigate('WordReader', { uri: res.uri })
      }
      else if (fileExtension === 'xlsx') {
        navigation.navigate('XslxReader', { uri: res.uri })
      }
      else if (fileExtension === 'ppt') {
        navigation.navigate('PowerPointReader', { uri: res.uri })
      }


    }
    catch (error) {
      console.log('openFile error-----', error);
    }
  }


  const updateCount = async () => {
    let number = await AsyncStorage.getItem('number')
    setRandomNumber(Math.floor(Math.random() * 333))

    // console.log('number updateCount--------------', number);

    if (number == null) {
      // console.log('number null--------------', number);
      AsyncStorage.setItem('number', '0')

    }
    else {
      if (number == '5') {
        AsyncStorage.setItem('number', '0')
      }
      else {
        const updatedCount = JSON.parse(number)
        // console.log('before-------', updatedCount);
        // console.log('after-------------', updatedCount + 1);
        setCount(updatedCount + 1)
        AsyncStorage.setItem('number', JSON.stringify(updatedCount + 1))
      }

    }

  }


  const getLinearColors = () => {

    switch (screeName) {
      case 'Pdf':
        return ['#0081A7', '#00AFB9']
      case 'Word':
        return ['#0066cc', '#0099cc']
      case 'Excel':
        return ['#1A5319', '#729762',]
      default: return ['#597445', '#729762']

    }
  }

  const renderScene = ({ route, jumpTo }) => {

    switch (route.key) {
      case asyncStorageKeyName.PDF_FILES:
        return <ReadSystemFile searchValue={searchQuery} key={uniqueNumber}
          ref={readPdfFileRef} pdfFiles={documents.pdfFiles}
          onReLoad={readPdfFiles} isLoading={isLoading} />;
      case asyncStorageKeyName.WORD_FILES:
        return <WordFilesList key={uniqueNumber} searchValue={searchQuery} wordFiles={documents.wordFiles} onReLoad={readPdfFiles} isLoading={isLoading} />;
      // case asyncStorageKeyName.XLSX_FILES:
      //   return <XslxFilesList key={uniqueNumber} searchValue={searchQuery} xlsxFiles={documents.xlsxFiles} onReLoad={readPdfFiles} isLoading={isLoading} />;
      //   case asyncStorageKeyName.PPT_FILES:
      // return <PPTFilesList key={uniqueNumber} searchValue={searchQuery} pptFiles={documents.pptFiles} onReLoad={readPdfFiles} isLoading={isLoading}/>;
    }
  };


  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.THEME_COLOR, height: 1 }}
      style={{ backgroundColor: 'white', }}
      labelStyle={{ color: 'black', fontSize: scaledSize(14) }}
      lazy
      lalazyPreloadDistance={1}
      onTabPress={({ route }) => {
        // Do something when a tab is pressed, e.g., show its name
        setScreenName(route.title)
        setTimeout(() => {

          StatusBar.setBackgroundColor(getLinearColors()[0]);
          //double tap to update color


        }, 50);

        // Cleanup the focus listener when the component is unmounted
        //return unsubscribeFocus;

        console.log('Tab pressed:', route.title);
      }}

    />
  );

  const shareApp = () => {
    Platform.OS == 'android' ?
      Share.open({ url: AppShare.ANDROID_SHARE_LINK, message: 'Give a shot to pdfViewer and converter', }) :
      Share.open({ url: AppShare.IOS_SHARE_LINK, message: 'Give a shot to pdfViewer and converter', })

  }

  const onPressMultiPdfViewer = () => {
    if (response.files.length < 2) {
      setErrorMsg('Please select atleast 2 Pdfs to see MultiPle PDFs')
      setIsShowErrorModal(true)
    }
    else {

      navigateTo('MultiplePdfView', pdfs)
      dispatch(checkIsUserViewedPdf(true))
    }
  }

  const renderHeaderIcons = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: scaledSize(24),
          marginRight: scaledSize(4)
        }}
      >
        {response.files.length > 0 && <TouchableOpacity 
        onPress={() => dispatch(checkIsUserViewedPdf(true))} style={{flexDirection:'row'}}>
            <CustomVectorIcon iconLibrary='MaterialCommunityIcons' iconName='select-off' style={{color:'red'}}  onPress={() => dispatch(checkIsUserViewedPdf(true))}/>
          {/* <Text style={{  letterSpacing: .5, fontFamily: Fonts.bold,top:scaledSize(2) }}>Clear</Text> */}
        </TouchableOpacity>
        }

        {response.files.length > 1 && <TouchableOpacity onPress={onPressMultiPdfViewer}>
          <MaterialCommunityIcons
            name="file-multiple-outline"
            size={scaledSize(20)}
            color={COLORS.THEME_COLOR}
          />
        </TouchableOpacity>}

        <TouchableOpacity onPress={addCardDetails}>
          <Feather name="user" size={scaledSize(20)} color="#555" />
        </TouchableOpacity>

        <MaterialCommunityIcons
          name="refresh"
          size={scaledSize(22)}
          color="#555"
          onPress={() => readPdfFiles()}
        />

        <TouchableOpacity onPress={openFile}>
          <Feather name="folder" size={scaledSize(18)} color="#555" />
        </TouchableOpacity>

        <CustomMenu
          Icon={<Feather name="more-vertical" size={18} color="#555" />}
          menuOptionstyle={{
            padding: scaledSize(13),
            width: scaledSize(150),
            height: scaledSize(50),
          }}
          menuOption={[
            { onSelect: () => shareApp(), label: 'Share' },
            { onSelect: () => navigation.navigate('contactus'), label: 'Contact us' },
          ]}
        />

      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} >
      <View style={{ position: 'relative', marginTop: scaledSize(10) }}>
        <CustomSpinner isLoading={isLoading} />
      </View>
      <LinearGradient
        colors={['white', 'white']}

        style={{ flex: .2, flexDirection: 'column', backgroundColor: 'red' }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ height: scaledSize(60), flexDirection: 'row', }}>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', }}>
            </View>

            {renderHeaderIcons()}
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ width: '96%', height: scaledSize(50), justifyContent: 'center', alignItems: 'center' }}>

              <Searchbar
                placeholder="Search"
                style={{
                  borderRadius: scaledSize(45), letterSpacing: 1, height: scaledSize(44),
                  backgroundColor: '#F3F4F6',
                }}
                onChangeText={(value) => index == 0 ? search(value) : convertedFilesearch(value)}
                placeholderTextColor="#9CA3AF"
                inputStyle={{ fontSize: scaledSize(14), letterSpacing: 1, alignSelf: 'center' }}
                loading={false}
                icon={() => <Image source={searchIcon} style={{
                  height: scaledSize(16), width: scaledSize(16),
                }}

                />}
                clearIcon={() => searchQuery.length > 0 ? <TouchableOpacity onPress={() => {
                  setSearchQuery(''), console.log('press search')
                }}>
                  <Image source={clear} style={{
                    height: scaledSize(16), width: scaledSize(16),

                  }} />
                </TouchableOpacity> : <></>
                }
                value={searchQuery}
              />


            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      {/* =================================TabBar Started================================ */}
      <View style={{ flex: 1, backgroundColor: 'white' }}>

        {/* <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={(i) => { setIndex(i), setSearchQuery('') }}
          initialLayout={{ width: layout.width, height: '100%' }}

        /> */}
      </View>

      {isShowErrorModal && <CustomErrorMsgModal errorMessage={errorMsg} onPressClose={() => setIsShowErrorModal(false)} />}
      {count >= 8 ? <VideoAddMob count={randomNumber} /> : null}
      <Modal visible={isShowCardModal}>
        <SaveUserCardDetails onPress={() => setIsShowCardModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ///

  loading: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    fontSize: scaledSize(18),
  },
  mainView: {
    height: scaledSize(80),
    width: "100%",
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    // marginTop: .6,
    backgroundColor: '#FFFF'
  },
  icon: {
    height: scaledSize(30),
    width: scaledSize(30),
    marginLeft: scaledSize(6)
  },
  fileNameParentView: {
    width: widthFromPercentage(66),
    height: scaledSize(40),
    // backgroundColor: 'red',
    flexDirection: "column"
  },

  fileNameView: {
    flex: 1,
    // backgroundColor:'red',
    // height:scaledSize(50),
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  dateAndSizeParentView: {
    flex: 1,
    // backgroundColor: 'tomato',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateView: {
    flex: 1,
    // backgroundColor: 'purple',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'

  },
  fileSizeView: {
    flex: 1,
    // backgroundColor: 'orange',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  favAndUnfavoriteView: {
    width: widthFromPercentage(10),
    height: scaledSize(50),
    justifyContent: 'center',
    alignItems: 'center'
  },
  shareFileView: {
    width: widthFromPercentage(10),
    height: scaledSize(50),
    justifyContent: 'center'
  },

  fontStyle: {
    fontSize: scaledSize(12),
    fontWeight: '400',
  },
  searchBarContainer: {
    backgroundColor: 'white',
    borderWidth: 0,
    height: scaledSize(70),
    width: scaledSize(330),
    borderColor: 'red',
    borderTopColor: 'white',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
});
export default Dashboard;