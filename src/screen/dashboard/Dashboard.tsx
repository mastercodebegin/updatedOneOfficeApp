import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Switch,
  Text, StyleSheet,
  View, TouchableOpacity, SafeAreaView
  , useWindowDimensions, Image,
  Platform, BackHandler, AppState,
  Modal,
  Alert, KeyboardAvoidingView,
  ScrollView,
  Button,
  NativeModules,
} from 'react-native';
import { deleteFile, getFilesFromPhoneByFileExtention, scaledSize, toastForDeleteFile, Utility, widthFromPercentage, } from '../../utilies/Utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import StaticServer from 'react-native-static-server';
// const StaticServer = require('react-native-static-server').default;
import RNFS from 'react-native-fs';
// import Icon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Feather';
import CustomMenu from '../../component/Menu'
import ReadSystemFile from '../../component/ReadSystemFile'
import CustomProgressBar from '../../component/CustomProgressBar';
import ImagesToPdfConverter from '../../component/ImagesToPdfConverter'
import { Searchbar } from 'react-native-paper'
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Share from 'react-native-share';
// import { TabView, SceneMap, TabBar, SceneRendererProps } from 'react-native-tab-view';
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
import { checkIsUserViewedPdf, clearSelectedFiles, getBankList } from './FileSlice';
import { ErrorToast } from '../../component/CustomToast';
import mobileAds, { BannerAdSize } from 'react-native-google-mobile-ads';
import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';
import PPTFilesList from '../PPTFilReader/PPTFilesList';
import CustomErrorMsgModal from '../../component/CustomErrorMsgModal';
import CustomVectorIcon from '../../component/CustomVectorIcon';
import { CustomPhotoOrCameraSelectOption } from '../../component/CustomPhotoOrCameraSelectOption';
import { pick, types } from '@react-native-documents/picker'
import { useGoogleAuth } from '../../customhooks/useGoogleAuth';
import { getLocalData, setLocalData } from '../../utilies/storageUtility';
import { FileLocalService } from '../../db/fileLocalService';
import { resetFoldersTable } from '../../db/folderLocalService';
import { FolderLocalService } from '../../db/folderLocalService';
import { FirebaseService } from '../../service/FirebaseService';
import { GoogleDriveService } from '../../db/googleDriveService';
import { AuthService } from '../../service/AuthService';

import CustomSortModal from '../../component/CustomSortModal';
import { useTheme } from '../theme/useTheme';
import ManageExternalStorage from 'react-native-manage-external-storage';

const { PdfCacheModule } = NativeModules;

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

  // generate sample file data for renderfiles

  const syncFilesForFolder = async (folder: any, updatedFiles: []) => {
    try {


      console.log('updatedFiles===', updatedFiles);

      for (const file of updatedFiles as any) {

        // 🗑️ delete file
        if (file.isDeleted) {
          await FileLocalService.deleteFile(file.driveFileId);
          continue;
        }

        // 🔍 check existing
        const existingFile = await FileLocalService.getFileById(
          file.driveFileId
        );

        // ➕ create
        if (!existingFile) {
          await FileLocalService.createFile(file);
          console.log('➕ File created:', file.driveFileId);
        }
        // 🔄 update
        else {
          await FileLocalService.updateFile(file);
          console.log('🔄 File updated:', file.driveFileId);
        }
      }

    } catch (err) {
      console.log('❌ File sync error:', err);
    }
  };
  //  const syncAll = async () => {
  //   console.log('syncAll started');

  //   const folders:any = await FirebaseService.getNewOrUpdatedFolders(655757);
  //   const updatedFiles = await FirebaseService.getNewOrUpdatedFiles(folders[0].folderId,656465);

  //   for (const obj of folders as any) {

  //     const existing = await FolderLocalService.getFolderByDriveId(
  //       obj.driveFolderId
  //     );

  //     // 🗑️ delete folder
  //     if (obj.isDeleted) {
  //       await FolderLocalService.deleteFoldersWithFiles(obj.driveFolderId);
  //       continue;
  //     }

  //     // ➕ create
  //     if (!existing) {
  //       await FolderLocalService.createFolder(
  //         obj.name,
  //         obj.id,
  //         obj.coverUri,
  //         obj.driveFolderId,
  //         1
  //       );
  //     } 
  //     // 🔄 update
  //     else if (existing.name !== obj.name) {
  //       await FolderLocalService.updateFolder(
  //         existing.id,
  //         obj.name,
  //         obj.remoteId,
  //         obj.coverUri,
  //         obj.driveFolderId,
  //         1
  //       );
  //     }

  //     // 📂 sync files (separated logic)
  //     await syncFilesForFolder(obj);
  //   }
  // };
  const syncFirebaseToLocal = async () => {
    // resetFoldersTable()
    // return
    const getAllFolders = await FolderLocalService.getAllFolders();
    console.log('getAllFolders>>>', getAllFolders);
    getAllFolders.map((v) => console.log('name>>>', v))
    // return
    const gooleDrivefolderName = await GoogleDriveService.getOrCreateGDriveFolder(asyncStorageKeyName.DRIVE_FOLDER_NAME)
    console.log('gooleDrivefolderName', gooleDrivefolderName);
    let userId = await AuthService.getUserId()

    console.log('userId', userId);

    const firebaseFolders = await FirebaseService.getUpdatedFoldersByUserId()
    // console.log('firebaseFolders', firebaseFolders);

    const localFolders = await FolderLocalService.getAllFolders();
    // console.log('localFolders', localFolders);

    const localMap = new Map(
      localFolders.map(local => [local.firebaseId, local])
    );
    console.log('localMap :', [...localMap.keys()]);



    const firebaseIdSet = new Set(
      firebaseFolders.map(f => f.firebaseId)
    );
    console.log('firebaseIdSet:', [...firebaseIdSet]);
    // console.log('localMap entries:', [...localMap.entries()]);
    // 🔄 Insert / Update
    for (const remote of firebaseFolders as any) { // loop through each folder from Firebase
      console.log('remote', remote);

      const local = localMap.get(remote.firebaseId); // find matching local folder using firebaseId
      console.log('local', local);
      console.log('remote.updatedAt:', remote.updatedAt, typeof remote.updatedAt);
      console.log('local.updatedAt:', local.updatedAt, typeof local.updatedAt);
      console.log('comparison:', remote.updatedAt > local.updatedAt);
      const updatedAt = Date.now();

      if (!local) { // if folder does NOT exist in local DB
        await FolderLocalService.createFolder(
          userId, // current user id
          remote.name, // folder name from Firebase
          remote.firebaseId, // Firebase id → stored as firebaseId locally
          remote.coverUri || '', // cover image (fallback to empty string)
          remote.driveFolderId || '', // Drive folder id (fallback if missing)
          1,// mark as synced (since coming from Firebase)
          updatedAt
        );

      } else if (remote.updatedAt > local.updatedAt) { // if Firebase version is newer than local

        console.log('Else if>>>>>:',);

        await FolderLocalService.updateFolderById({
          id: local.id,
          name: remote.name,
          isDeleted: remote.isDeleted
        });
      }
    }

    // 🗑️ Delete
    // 🔹 Create deleted set from Firebase
    const deletedSet = new Set(
      firebaseFolders
        .filter((f: any) => f.isDeleted === 1) // only deleted items
        .map(f => f.firebaseId)
    );
    console.log('deletedSet:', [...deletedSet]);
    console.log('size:', deletedSet.size);
    console.log('firebaseFolders.length:', firebaseFolders.length);
    console.log('localFolders size:', localFolders.length);
    console.log('localFolders data:', localFolders);
    // 🔹 Apply delete to local
    for (const local of localFolders) {
      console.log('local size:', deletedSet.has(local.firebaseId));
      if (deletedSet.has(local.firebaseId)) {

        console.log('local size:', local);
      }

      if (!local.firebaseId) continue; // skip unsynced local folders

      // 🔹 If Firebase marked it deleted AND local is not deleted yet
      if (deletedSet.has(local.firebaseId) && local.isDeleted === 0) {
        console.log('if>>>>>>.:', deletedSet.has(local.firebaseId));
        console.log('delete started',);
        console.log('delete started', deletedSet.has(local.firebaseId));

        await FolderLocalService.deleteFolderByFirebaseId(local.firebaseId);
      }
    }
    //Push to firebase
    await pushFolders()

    console.log('✅ Sync complete');
  }


  const pushFolders = async () => {
    console.log('pushFolders started');

    const userId = await AuthService.getUserId();
    const unSynced = await FolderLocalService.getUnsynced();

    console.log('unsyn', unSynced);

    for (const folder of unSynced as any) {

      try {
        folder.userId = userId;

        if (!folder.firebaseId) {
          // 🔹 CREATE (new folder)
          const doc = await FirebaseService.createFolderInFirebase(folder);

          await FolderLocalService.updateFirebaseId(
            folder.id,
            doc.firebaseId,
            userId
          );

        } else if (folder.isDeleted === 1) {
          // 🔹 DELETE (soft delete in Firebase)
          console.log('else DELETE here', folder);
          await FirebaseService.updateFolderInFirebase({
            firebaseId: folder.firebaseId,
            isDeleted: 1,
          });

          await FolderLocalService.markAsSynced(folder.id);

        } else {
          // 🔹 UPDATE (rename or changes)
          console.log('else update here', folder);

          await FirebaseService.updateFolderInFirebase(folder);

          await FolderLocalService.markAsSynced(folder.id);
        }

      } catch (e) {
        console.log('Push failed:', e);
      }
    }
  };

  const syncAll = async () => {
    console.log('unSyncdata stated',);


    // Que -user has already data but could not sync and upload 
    // ans - will always sync data first then will push data to firebase

    // const gooleDrivefolderName = await GoogleDriveService.getOrCreateGDriveFolder(asyncStorageKeyName.DRIVE_FOLDER_NAME)
    // console.log('gooleDrivefolderName', gooleDrivefolderName);
    // const userId = await AuthService.getUserId()
    // console.log('userId', userId);
    // console.log('userId', await AuthService.getUserId());
    // const unSyncdata = await FolderLocalService.createFolder(userId, 'name-voter-1', 'firebaseId-test', 'coveruri', gooleDrivefolderName, 0)
    // const unSyncdata =await resetFoldersTable()
    // const unSyncdata =await FolderLocalService.getAllFolders()
    // const unSyncFolders =await FolderLocalService.getUnsynced()
    await syncFirebaseToLocal()

    // const folderId = await getFolderId(accessToken)
    // console.log('unSyncdata',unSyncFolders);
    // console.log('unSyncdata[0].id',unSyncFolders[0].id);
    // const id =unSyncFolders[0].id
    // const updatedFolder= await FolderLocalService.markAsSynced(id,'$234')
    // const updatedFolder= await FolderLocalService.getGoogleDriveFolderIdFromDB()
    // console.log('updatedFolder',updatedFolder);
    // const unSyncFolders = GoogleDriveService.
    // const folder = await GoogleDriveService.deleteFolder(getLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID))
    // const folder = await GoogleDriveService.getOrCreateGDriveFolder(asyncStorageKeyName.DRIVE_FOLDER_NAME)

    // console.log('folder--is', unSyncdata);

    // for(const folder of unSyncFolders){
    //   const isFolderCreatedOnFirebase = await FirebaseService.createFolder(folder.name)
    //   console.log('isFolderCreatedOnFirebase',isFolderCreatedOnFirebase);
    //   console.log('folder.driveFolderId',folder.driveFolderId);

    //   if(isFolderCreatedOnFirebase){
    //    const isuploaded=  await uploadImage(uri,accessToken,folder.driveFolderId)
    //    console.log('isuploaded',isuploaded);

    //     const updatedFolder= await FolderLocalService.markAsSynced(folder.id,'$234')
    //     console.log('updatedFolder',updatedFolder);
    //   }

    // }
    // const Allfolders = await FolderLocalService.getAllFolders()
    // console.log('updatedFolder', Allfolders);

  }

  const [documents, setDocuments] = useState<DocumentTypes>({
    pdfFiles: [],
    wordFiles: [],
    xlsxFiles: [],
    pptFiles: [],
  });
  const readPdfFileRef = React.useRef(null)
  const [isShowSortModal, setIsShowSortModal] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState([]);
  const layout = useWindowDimensions();
  const [randomNumber, setRandomNumber] = useState(1)
  const [count, setCount] = useState(0)
  const [isUserBack, setIsUserBack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileScanProgress, setFileScanProgress] = useState(0);
  const [filesFound, setFilesFound] = useState(0);
  const [foundFilesList, setFoundFilesList] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => setSearchQuery(query);
  const [uniqueNumber, setUniqueNumber] = React.useState(0)
  const [index, setIndex] = React.useState(0);
  const [screeName, setScreenName] = React.useState('Pdf')
  const toast = useToast();
  const dispatch = useDispatch();
  const response = useSelector((state) => state.FileSlice);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false)
  const [isShowEditPdfModal, setIsShowEditPdfModal] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false);
  const [errorMsg, setErrorMsg] = useState('')
  const { user, accessToken, signIn, signOut, loading, } = useGoogleAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'folder' | 'singleline'>('folder');
  const [isShowViewModeModal, setIsShowViewModeModal] = useState(false);
    const [selectedSort, setSelectedSort] = useState('latest')
      const isFocused = useIsFocused();

  const sortOptions = [
    {
      id: 'latest',
      name: 'Latest First',
      icon: 'time-outline',
    },
    {
      id: 'oldest',
      name: 'Oldest First',
      icon: 'calendar-outline',
    },
    {
      id: 'name_asc',
      name: 'Name A - Z',
      icon: 'text-outline',
    },
    {
      id: 'name_desc',
      name: 'Name Z - A',
      icon: 'swap-vertical-outline',
    },
    {
      id: 'size',
      name: 'Size',
      icon: 'swap-vertical-outline',
    },
  ];

  const viewModeOptions = [
    {
      id: 'folder',
      name: 'Grid View',
      icon: 'view-grid-outline',
    },
    {
      id: 'list',
      name: 'List View',
      icon: 'view-list-outline',
    },
    {
      id: 'singleline',
      name: 'Single Line View',
      icon: 'view-headline',
    },
  ];

    const [routes] = React.useState([
    { key: asyncStorageKeyName.PDF_FILES, title: 'PDF', },
    // { key: asyncStorageKeyName.WORD_FILES, title: 'WORD' },
    // { key: asyncStorageKeyName.XLSX_FILES, title: 'Excel' },
    // { key: asyncStorageKeyName.PPT_FILES, title: 'Ppt' },

  ]);
  const webViewRef = React.useRef(null);

  useEffect(() => {
    const loadPreferences = () => {
      const savedViewMode = getLocalData(asyncStorageKeyName.VIEW_MODE);
      if (savedViewMode === 'list' || savedViewMode === 'folder') {
        setViewMode(savedViewMode);
      }
      const savedSortType = getLocalData(asyncStorageKeyName.SORT_TYPE);
      if (savedSortType) {
        setSelectedSort(savedSortType);
      } else {
        setSelectedSort('latest');
      }
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    if (viewMode) setLocalData(asyncStorageKeyName.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (selectedSort) setLocalData(asyncStorageKeyName.SORT_TYPE, selectedSort);
  }, [selectedSort]);

  const handleLogin = async () => {
    try {
      const res = await signIn();

      // console.log('Result:', res);

      const token = res?.accessToken;


    } catch (error) {
      console.log('Login error:', error);
    }
  };



  // useEffect(() => {
  //   const obj = getLocalData(asyncStorageKeyName.ALL_FILES);
  //   console.log('obj', obj);
  //   console.log('obj type of >>>>>>>', typeof obj);
  //   if (obj?.pdfFiles?.length > 0) {

  //     setDocuments(obj);
  //   }
  //   else {

  //     console.log('No  files found, Please allow storage permission and click on refresh button to load files')
  //   }
  // }, [])

  const readPdfFiles = React.useCallback(async () => {

    setIsLoading(true)
    setIsScanning(true)
    setFileScanProgress(0);
    setFilesFound(0);
    setFoundFilesList([]);
    const files = await getFilesFromPhoneByFileExtention(
      1,
      (status: {
        percentage: number,
        filesFound: number,
        allFoundFiles: any[]
      }) => {
        setFileScanProgress(status.percentage);
        setFilesFound(status.filesFound);
        setFoundFilesList(status.allFoundFiles);
      }
    );
    console.log('readPdfFiles:', files);

    setDocuments(files)
    setUniqueNumber(Utility.generateUniqueNumber())
  }, []);




const checkAndReadFiles = () => {
const files = getLocalData(asyncStorageKeyName.ALL_FILES);

const hasFiles =
  files &&
  (
    files.pdfFiles?.length > 0 ||
    files.wordFiles?.length > 0 ||
    files.xlsxFiles?.length > 0 ||
    files.pptFiles?.length > 0
  );
console.log('hashfiles===',hasFiles);

if (!hasFiles && documents.pdfFiles.length === 0) {
  readPdfFiles();
}
else{
  setDocuments(files)
}
};

useEffect(() => {
  if (isFocused) {
    checkAndReadFiles();
  }
}, [isFocused]);

useEffect(() => {
  const subscription = AppState.addEventListener(
    'change',
    nextAppState => {
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isFocused
      ) {
        checkAndReadFiles();
      }

      setAppState(nextAppState);
    },
  );

  return () => {
    subscription.remove();
  };
}, [appState, isFocused, documents.pdfFiles.length]);





  const openPdf = async (uri: string) => {
    console.log('openPdf uri', uri);

    if (!uri) return;

    try {
      if (
        Platform.OS === 'android' &&
        uri.startsWith('content://')
      ) {
        const localPath =
          await PdfCacheModule.copyToCache(
            uri,
          );

        const pdfUri = localPath.startsWith('file://')
          ? localPath
          : `file://${localPath}`;

        console.log('Cached PDF path:', pdfUri);

        const statResult = await RNFS.stat(pdfUri);



        // Construct a file object in the expected format for your app's state
        const newPdfFile = {
          id: Utility.generateUniqueNumber(), // Generate a unique ID for the new file
          name: statResult.path.split('/').pop() || `document-${Date.now()}.pdf`, // Extract name, provide fallback
          path: statResult.path,
          size: statResult.size,
          mtime: statResult.mtime ? new Date(statResult.mtime).toISOString() : new Date().toISOString(), // Ensure mtime is serializable
        };

    


        navigation.navigate(
          'PdfViewer',
          {
            uri: pdfUri,
            name: newPdfFile.name, // Pass the name for the viewer header
          },
        );
      }

      navigation.navigate(
        'PdfViewer',
        {
          uri,
          name: uri.split('/').pop() || 'Document', // Extract name, provide fallback
        },
      );
    } catch (e) {
      console.log('openPdf error', e);
      setErrorMsg('Failed to open the file. It might be corrupted or unsupported.');
      setIsShowErrorModal(true);
    } finally {
      setIsLoading(false); // Always hide loading indicator
    }
  };

  //Linking 
  useEffect(() => {
    let isRead = true

    const linkingSubscription = Linking.addEventListener('url', (url) => {
      console.log('addEventListener', url);
      openPdf(url.url)
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('press back btn');
      setIsShowEditPdfModal(false)
      setIsUserBack(true)

    });

    if (route?.params?.pdf) { setIsUserBack(true) }

    if (!isUserBack) {

      Linking.getInitialURL()
        .then((url) => {
          if (url && route?.params?.pdf == undefined) {
            console.log('listener2', url);
            openPdf(url)
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
      linkingSubscription.remove();
      backHandler.remove();
    };
  }, [navigation, route, isFocused]);






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




  const search = (data: any) => {
    // sending search text to readsystemfile screen to filter data
    setSearchQuery(data)


  }

  const convertedFilesearch = (data: any) => {
    setSearchQuery(data)
    console.log('value', data);
    // /console.log('pdfData--', pdfData);
    const result = convertedFiles.filter((item: any) => item.name.toUpperCase().startsWith(data.toUpperCase()))
    console.log('search-----', result);
    setConvertFilterData(result)
    //setFiles(result)

  }







  const getLinearColors = () => {

    switch (screeName) {
      case 'PDF':
        return ['#0081A7', '#00AFB9']
      case 'WORD':
        return ['#0066cc', '#0099cc']
      case 'EXCEL':
        return ['#1A5319', '#729762',]
      default: return ['#597445', '#729762']

    }
  }

  // const renderScene = ({
  //   route,
  //   jumpTo,
  // }: SceneRendererProps & {
  //   route: { key: 'first' | 'second'; title: string };
  // }) => {

  //   switch (route.key) {
  //     case asyncStorageKeyName.PDF_FILES:
  //       return <ReadSystemFile searchValue={searchQuery} key={uniqueNumber}
  //         ref={readPdfFileRef}
  //         // pdfFiles={pdfs} 
  //         pdfFiles={documents.pdfFiles}
  //         selectedSort={selectedSort}
  //         viewMode={viewMode}
  //         onReLoad={readPdfFiles} isLoading={isLoading} />;
  //     // case asyncStorageKeyName.WORD_FILES:
  //     //   return <WordFilesList key={uniqueNumber} searchValue={searchQuery} wordFiles={documents.wordFiles} onReLoad={readPdfFiles} isLoading={isLoading}
  //     //     selectedSort={selectedSort} viewMode={viewMode} />;
  //     // case asyncStorageKeyName.XLSX_FILES:
  //     //   return <XslxFilesList key={uniqueNumber} searchValue={searchQuery} xlsxFiles={documents.xlsxFiles} onReLoad={readPdfFiles} isLoading={isLoading} />;
  //     //   case asyncStorageKeyName.PPT_FILES:
  //     // return <PPTFilesList key={uniqueNumber} searchValue={searchQuery} pptFiles={documents.pptFiles} onReLoad={readPdfFiles} isLoading={isLoading}/>;
  //   }
  // };


  // const renderTabBar = (props: any) => (
  //   <TabBar
  //     {...props}
  //     indicatorStyle={{
  //       backgroundColor: theme.themeColor,
  //       height: .5,
  //     }}
  //     style={{
  //       backgroundColor: mode === 'dark' ? theme.bgContainor : '#FFFFFF',
  //       elevation: 0,
  //       shadowOpacity: 0,
  //       borderBottomWidth: 1,
  //       borderBottomColor: mode === 'dark' ? theme.borderColor : '#EEF0F4',
  //     }}
  //     tabStyle={{
  //       height: scaledSize(62),
  //     }}
  //     activeColor={theme.themeColor}
  //     inactiveColor={theme.iconColor}
  //     lazy
  //     lalazyPreloadDistance={1}
  //     onTabPress={({
  //       route,
  //     }: {
  //       route: { key: string; title: string };
  //     }) => {
  //       setScreenName(route.title);


  //     }}
  //     labelStyle={{
  //       textTransform: 'uppercase',
  //       fontSize: scaledSize(13),
  //       fontFamily: Fonts.bold,
  //     }}

  //   />
  // );



  const onPressMultiPdfViewer = () => {
    if (response.selectedFiles.length < 2) {
      setErrorMsg('Please select atleast 2 Pdfs to see MultiPle PDFs')
      setIsShowErrorModal(true)
    }
    else {
      console.log('selectedFiles', response.selectedFiles);

      Utility.navigation.navigateTo('MultiplePdfView', response.selectedFiles)
      dispatch(checkIsUserViewedPdf(true))
    }
  }

  const onPressViewMode = () => {
    setIsShowViewModeModal(true);
  }
  const onPressSort = (sort:string) => {
    setIsShowSortModal(false)
    setSelectedSort(sort)
  }

  const onPressViewModeApply = (mode: 'list' | 'folder' | 'singleline') => {
    setViewMode(mode);
    setIsShowViewModeModal(false);
  };

  const renderHeaderIcons = () => {
    const headerIconColor = mode === 'dark' ? theme.iconColor : '#030712';

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: scaledSize(20),
          paddingHorizontal: scaledSize(16),
          minHeight: scaledSize(56),
          alignSelf: 'flex-end'
        }}
      >
        {response.selectedFiles.length > 0 && <TouchableOpacity
          onPress={() => dispatch(clearSelectedFiles(true))}
          style={{ flexDirection: 'row' }}>
          <CustomVectorIcon iconLibrary='MaterialCommunityIcons' iconName='select-off'
            style={{ color: 'red' }}
            onPress={() => dispatch(clearSelectedFiles(true))} />
          {/* <Text style={{  letterSpacing: .5, fontFamily: Fonts.bold,top:scaledSize(2) }}>Clear</Text> */}
        </TouchableOpacity>
        }

        <TouchableOpacity onPress={() => onPressViewMode()}>
          <MaterialCommunityIcons
            name={
              viewMode === 'folder'
                ? 'view-grid-outline'
                : viewMode === 'list'
                ? 'view-list-outline'
                : 'view-headline'
            }
            size={scaledSize(24)}
            color={headerIconColor}
          />
        </TouchableOpacity>


        {response.selectedFiles.length > 1 && <TouchableOpacity onPress={onPressMultiPdfViewer}>
          <MaterialIcons
            name="picture-as-pdf"
            size={scaledSize(22)}
            color={theme.themeColor}
          />
          {/* <CustomVectorIcon iconLibrary='MaterialIcons' iconName='picture-as-pdf' style={{color:COLORS.THEME_COLOR}}/> */}
        </TouchableOpacity>}


        <TouchableOpacity onPress={() => setIsShowSortModal(true)}>
          <MaterialCommunityIcons
            name="sort"
            size={scaledSize(24)} color={headerIconColor} />
        </TouchableOpacity>


        <TouchableOpacity onPress={() => navigation.navigate('SaveUserCardDetails')}>
          <Feather name="user" size={scaledSize(24)} color={headerIconColor} />
        </TouchableOpacity>

        <MaterialCommunityIcons
          name="refresh"
          size={scaledSize(25)}
          color={headerIconColor}
          onPress={() => readPdfFiles()}
        />

        <TouchableOpacity onPress={openFile}>
          <Feather name="folder" size={scaledSize(24)}
            color={theme.themeColor}  />
        </TouchableOpacity>

        {/* <CustomMenu
          Icon={<Feather name="more-vertical" size={scaledSize(22)} color={theme.iconColor} />}
          menuOptionstyle={{
            padding: scaledSize(13),
            width: scaledSize(150),
            height: scaledSize(50),
          }}
          menuOption={[
            { onSelect: () => shareApp(), label: 'Share' },
            { onSelect: () => navigation.navigate('contactus'), label: 'Contact us' },
          ]}
        /> */}

      </View>
    )
  }
  // const handleDownloadPress = () => {
  //   console.log('🟢 RN: Button pressed');

  //   webViewRef.current?.postMessage(
  //     JSON.stringify({ type: 'TRIGGER_DOWNLOAD' })
  //   );
  // };



  const openFile = async () => {
    console.log('open file===');


    try {
      const res: any = await Utility.images.DocumentPicker({ isMultipleSelection: false,fileTypes:[types.pdf] })
      let fileExtension = ''
      let uri = ''

      if (res) {
        console.log('name--------------', res[0].localUri);
        fileExtension = res[0].localUri.split('.').pop()
        uri = res[0].localUri
        const folderId = getLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID)
        console.log('accesstoken', accessToken);
        console.log('folderId', folderId);
        console.log('localUri====', uri);


        // uploadImage(uri, accessToken, folderId)
      }


      console.log('fileExtension--------------', fileExtension);
      console.log('uri--------------', uri);


      if (fileExtension === 'pdf') {
        console.log('in pdf');

        navigation.navigate('PdfViewer', { uri: uri })
      }
      // else if (fileExtension === 'docx') {
      //   navigation.navigate('WordReader', { uri: uri })
      // }
      // else if (fileExtension === 'xlsx') {
      //   navigation.navigate('XslxReader', { uri: uri })
      // }
      // else if (fileExtension === 'ppt') {
      //   navigation.navigate('PowerPointReader', { uri: uri })
      // }


    }
    catch (error) {
      console.log('openFile error-----', error);
    }
  }

  const handleContinue = () => {
    setIsLoading(false);
    setIsScanning(false);
  };

  const handleRescan = () => {
    // The spinner is already visible, just restart the scanning process
    readPdfFiles();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgContainor }} >

      {isScanning ? (
        <Modal visible={isLoading} transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <CustomProgressBar
              progress={fileScanProgress}
              filesFound={filesFound}
              foundFiles={foundFilesList}
              onRescan={handleRescan}
              onContinue={handleContinue}
            />
          </View>
        </Modal>
      ) : (
        <></>
        // <CustomSpinner isLoading={isLoading} text="Loading..." />
      )}
      <LinearGradient
        colors={[
          mode === 'dark' ? theme.bgContainor || '#1C1C1E' : '#FFFFFF',
          mode === 'dark' ? theme.bgContainor || '#1C1C1E' : '#FFFFFF',
        ]}
        style={{
          paddingTop: scaledSize(8),
          paddingBottom: scaledSize(22),
        }}>
        {renderHeaderIcons()}

        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: scaledSize(16) }}>
          <View style={{ width: '92%', height: scaledSize(54), justifyContent: 'center', alignItems: 'center' }}>

            <Searchbar
              placeholder="Search"
              style={{
                width: '100%',
                borderRadius: scaledSize(30),
                letterSpacing: 1,
                height: scaledSize(44),
                // backgroundColor: theme.bgColor,
                backgroundColor: mode === 'dark' ? theme.bgColor : '#FFFFFF',
                borderWidth: 1,
                borderColor: theme.borderColor,
                elevation: mode === 'dark' ? 0 : 5,
                shadowColor: '#9CA3AF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: mode === 'dark' ? 0 : 0.18,
                shadowRadius: 18,
              }}
              onChangeText={(value) => index == 0 ? search(value) : convertedFilesearch(value)}
              placeholderTextColor={mode == 'dark' ? "#9CA3AF" : '#7B8190'}
              inputStyle={{
                fontSize: scaledSize(15),
                letterSpacing: 0,
                alignSelf: 'center',
                color: theme.primaryTextColor,
                minHeight: scaledSize(40),
              }}
              loading={false}
              icon={() => <Image source={searchIcon} style={{
                height: scaledSize(19), width: scaledSize(19),
                tintColor: theme.borderColor
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
      </LinearGradient>
      {/* =================================TabBar Started================================ */}
      <View style={{ flex: 1, backgroundColor: theme.bgContainor }}>

        {/* <TabView
          renderTabBar={renderTabBar}

          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={(i) => { setIndex(i), setSearchQuery('') }}
          initialLayout={{ width: layout.width, height: '100%' }}

        /> */}
        <ReadSystemFile searchValue={searchQuery} key={uniqueNumber}
          ref={readPdfFileRef}
          // pdfFiles={pdfs} 
          pdfFiles={documents.pdfFiles}
          selectedSort={selectedSort}
          viewMode={viewMode}
          onReLoad={readPdfFiles} isLoading={isLoading} />
        
      </View>

       <CustomErrorMsgModal isVisible={isShowErrorModal} errorMessage={errorMsg} onPressClose={() => setIsShowErrorModal(false)} />
      {count >= 8 ? <VideoAddMob count={randomNumber} /> : null}
      <CustomSortModal
        data={sortOptions}
        isvisible={isShowSortModal}
        title="Sort by"
        onPressClear={() => {
          setSelectedSort('latest');
          setLocalData(asyncStorageKeyName.SORT_TYPE, 'latest');
          setIsShowSortModal(false);
        } }
        onPressApply={(sort) =>  onPressSort(sort)}
        onPressClose={() => setIsShowSortModal(false)}
        selectedValue={selectedSort}
      />
      <CustomSortModal
        title="View Mode"
        data={viewModeOptions}
        isvisible={isShowViewModeModal}
        onPressApply={(mode) => onPressViewModeApply(mode as any)}
        onPressClear={() => {
          setViewMode('folder');
          setIsShowViewModeModal(false);
        }}
        onPressClose={() => setIsShowViewModeModal(false)}
        selectedValue={viewMode}
      />
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
