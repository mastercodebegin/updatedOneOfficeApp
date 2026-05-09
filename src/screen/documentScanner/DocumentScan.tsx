import React, { useState, useEffect, useRef, use, useMemo } from 'react'
import { AppState, BackHandler, Dimensions, FlatList, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import { Button, Overlay } from 'react-native-elements';
import { Chip } from 'react-native-paper'
import RNFS from 'react-native-fs';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../../utilies/Constants';
import { capitalizeFirstLetter, ConfirmPopup, deleteFile, DocumentPicker, fileShare, fileShareMultiple, generateUniqueNumber, getDate, getImageUriByOS, heightFromPercentage, navigateTo, RNImageToPdf, scaledSize, VECTOR_ICON_LIBRARIES, widthFromPercentage } from '../../utilies/Utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clear, cloud, searchIcon, } from '../../assets/GlobalImages';
// import Elevations from 'react-native-elevation'
import { COLORS, FONTS } from '../../utilies/GlobalColors';
import CustomMenu from '../../component/Menu';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import { RadioButton, Searchbar } from 'react-native-paper'
import CustomInput from '../../component/CustomInput';
import CustomInputBox from '../../component/CustomInputBox';
import { folder } from 'jszip';
import FloatingButton from '../../component/FloatingButton';
import CustomeButton from '../../component/CustomButton';
import ImageViewer from 'react-native-image-zoom-viewer';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import { useIsFocused } from '@react-navigation/native';
import CustomFAB from '../../component/CustomFAB';
import { zip, unzip } from 'react-native-zip-archive';
import { animation_completed, backup_animation } from '../../assets/animation/AnimationAssets';
import LottieView from 'lottie-react-native';
import CustomCloseIcon from '../../component/CustomCloseIcon';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { CustomErrorToast, CustomSuccessToast } from '../../component/CustomToast';
import CustomPermissionMessage from '../../component/CustomPermissionMessage';
import CustomBannerAdd from '../../component/admob/CustomBannerAdd';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import CustomBottomSheet from '../../component/CustomBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { getLocalData, removeLocalData, setLocalData } from '../../utilies/storageService';
import { FolderLocalService, resetFoldersTable } from '../../db/folderLocalService';
import { DateHelper } from '../../utilies/DateHelper';
import { FileLocalService } from '../../db/fileLocalService';
import { FirebaseService } from '../../service/FirebaseService';
import { GoogleDriveService } from '../../db/googleDriveService';
import { AuthService } from '../../service/AuthService';
import { useGoogleAuth } from '../../customhooks/useGoogleAuth';
import { syncAll } from './SyncFolderAndFiles';
import CustomSpinner from '../../component/CustomSpinner';
import firestore from '@react-native-firebase/firestore';
import { getDB } from '../../../src/db';
import useDebounce from '../../component/useDebounce';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../theme/ThemeSlice';
import { useTheme } from '../theme/useTheme';
import { Theme } from '../theme/ThemeConfig';
import { color } from 'react-native-elements/dist/helpers';
import { tagLocalService } from '../../../src/db/tagLocalService';
import CustomVectorIcon from '../../../src/component/CustomVectorIcon';
import ConfirmationDialog from '../../../src/component/ConfirmationDialog';
import CustomSortModal from '../../../src/component/CustomSortModal';
// import { getAuth } from '@react-native-firebase/auth';



const destinationPath = CONSTANT.SAVED_DOCUMENTS_PATH;
export const DocumentScan = () => {
  const [images, setImages] = useState<Array<any>>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFolderNameChange, setIsFolderNameChange] = React.useState(false);
  const [isTagModalVisible, setIsTagModalVisible] = React.useState(false);
  const [isShowRenderRenameTagModal, setIsShowRenderRenameTagModal] = React.useState(false);
  const [folderId, setFolderId] = React.useState(0)
  const [isMultiDelete, setMultidelete] = useState(false);
  const [selectedFoldersId, setSelectedFoldersId] = useState<any>([]);
  const [isShowConfirmationModal, setIsConfirmationModal] = useState(false);
  const [isShowFolderNameModal, setIsShowFolderNameModal] = useState(false);
  const [data, setData] = useState<any>([])
  const [userTags, setUserTags] = useState<any>([])
  const [folderName, setFolderName] = useState('')
  const [tagName, setTagName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isShowbackupMessage, setIsShowbackupMessage] = useState(false)
  const [isBackupStarted, setIsBackupStarted] = useState(false)
  const [isBackupCompleted, setIsBackupCompleted] = useState(false)
  const [isPermissionDenied, setIsPermissionDenied] = useState(false)
  // const [isPermissionFunctionCalled,setIsPermissionFunctionCalled] = useState(false);
  const isPermissionFunctionCalled = useRef(false); // Use a ref instead of state
  const refForDocShare = useRef<BottomSheetModal>(null);
  const [isLocalDataFetch, setIsLocalDataFetch] = useState(false)
  const [localFiles, setLocalFiles] = useState([])
  const isFocused = useIsFocused();
  const { user, accessToken, signIn, signOut, loading, } = useGoogleAuth();
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebounce({ searchText, delay: 10000 })
  const [isShowDeleteTagConfirmation, setIsShowDeleteTagConfirmation] = useState(false)
  const [isShowSortModal, setIsShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState('')
  const [selectedTag, setSelectedTag] = useState('All');

  // const toggleSwitch = toggleTheme()


  // const theme =useSelector((state:any)=>state.ThemeSlice)
  const { mode, theme, toggleTheme } = useTheme()

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme])

  useEffect(() => {
    console.log('ThemeSlice', theme);
    console.log('mode', mode);
  })


  useEffect(() => {
    return
    let unsubscribeFiles: any;
    let unsubscribeTriggers: any;
    let isSyncing = false; // guard

    const init = async () => {
      const userId = await AuthService.getUserId();
      console.log('userid', userId);

      if (!userId) return;

      // Listener 1 (normal logs)
      unsubscribeFiles = firestore()
        .collection('files')
        .where('userId', '==', userId)
        .onSnapshot(snapshot => {
          if (!snapshot) {
            console.log('snapshot null');
            return;
          }
          // if (snapshot) return;
          snapshot.docChanges().forEach(change => {
            console.log('SYNC TRIGGERED 1');
            handleSync()
            // syncAll(); // runs for added + modified + removed

          });
        });

      // Listener 2 (trigger sync)
      unsubscribeTriggers = firestore()
        .collection('folders')
        .where('userId', '==', userId)
        .onSnapshot(async snapshot => {
          if (!snapshot) {
            console.log('snapshot null');
            return;
          }
          // prevent multiple calls
          if (isSyncing) return;

          isSyncing = true;

          try {
            console.log('SYNC TRIGGERED 2');
            await handleSync();
          } catch (e) {
            console.log('Sync error', e);
          } finally {
            isSyncing = false;
          }
        });
    };

    init();

    return () => {
      if (unsubscribeFiles) unsubscribeFiles();
      if (unsubscribeTriggers) unsubscribeTriggers();
    };
  }, []);
  useEffect(() => {
    console.log('debouncedSearchText', debouncedSearchText);
    ApiHandler()

  }, [debouncedSearchText])

  const ApiHandler = () => {
    console.log('function callled----', debouncedSearchText)
  }

  const getfiles = async () => {
    const files = await FileLocalService.getAllFiles()
    console.log('files====', files);
    setLocalFiles(files);
  }

  useEffect(() => {
    if (!isFocused) return;

    const fetchData = async () => {
      try {
        const folders = await FolderLocalService.getActiveFolders();
        const tags = await tagLocalService.getTags();

        console.log('folders=====1st', folders);

        setData(folders);
        setUserTags(tags);

        setIsLocalDataFetch(true);
        getfiles()
      } catch (error) {
        console.log('fetch error:', error);
      }
    };

    fetchData();
  }, []);

  const fullReset = async () => {
    try {
      console.log("RESET START");

      // 1. clear DB
      const db = await getDB();
      await db.executeSql(`DELETE FROM files`);
      await db.executeSql(`DELETE FROM folders`);


      // 2. clear files
      const dir = CONSTANT.SAVED_DOCUMENTS_PATH;
      const exists = await RNFetchBlob.fs.isDir(dir);

      if (exists) {
        await RNFetchBlob.fs.unlink(dir);
      }

      // 3. clear cache (optional)
      const cacheDir = RNFetchBlob.fs.dirs.CacheDir;
      const cacheFiles = await RNFetchBlob.fs.ls(cacheDir);

      for (const file of cacheFiles) {
        await RNFetchBlob.fs.unlink(`${cacheDir}/${file}`);
      }
      await removeLocalData(asyncStorageKeyName.LAST_SYNC_TIME)
      await removeLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID)

      // ⛔ wait before fetching
      const folders = await FolderLocalService.getActiveFolders()
      const files = await FileLocalService.getAllFiles()
      setData(folders)
      setLocalFiles(files)

      console.log("RESET COMPLETE");
    } catch (e) {
      console.log("RESET ERROR", e);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await signIn();

      // console.log('Result:', res);

      const token = res?.accessToken;


    } catch (error) {
      console.log('Login error:', error);
    }
  };
  const handleSync = async () => {
    if (isLoading) return; // 🔥 prevent double click
    try {
      setIsLoading(true);
      console.log('Syncing all files... started', accessToken);

      await syncAll();
      // setTimeout(async() => {
      const folders = await FolderLocalService.getActiveFolders()
      const files = await FileLocalService.getAllFiles()
      console.log('folders-------2nd', folders);

      setLocalFiles(files);

      setData(folders);
      // }, 500);
    } catch (e) {
      console.log('Sync error document scanner:', e);
    } finally {
      console.log('finally triggered');
      setIsLoading(false); // 🔥 ALWAYS runs
    }
  }
  const renderButton = () => {
    return (<><Button title="Login" onPress={handleLogin} />

      <Button title="Sync" onPress={handleSync} />
      {/* <Button title="CREATE" onPress={async () => {
        console.log('hi');

        const created = await FolderLocalService.createFolder
          ('', 'name-voter-1' + Math.random(),
            null, 'coveruri', 'gooleDrivefolderName', 0)
        console.log('created', created);

      }} /> */}
      {/* <Button title="Update" onPress={async () => {
        await FolderLocalService.updateFolderById({ id: 1, name: Math.random().toString(), isDeleted: 0 })
      }} /> */}
      <Button title="Reset"
        onPress={async () => {
          // await FileLocalService.resetFilesTable()
          // await resetFoldersTable()
          fullReset()

        }} />
      <Button title="Logout" onPress={async () => { await signOut() }} />
    </>

    )
  }
  const createDoc = () => {
    const uri = 'file:///data/user/0/com.shopax.pdfviewer/cache/0da5b438-7c50-4674-a437-cf9aaf583dc1/66ed542140d11c5ab60c5cd22efca90b2415a022.jpeg'
    // user logged in flow new user
    accessToken
    const folders = []
  }
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


  const requestCameraPermission = async () => {
    try {
      const result = await request(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
      );

      if (result === RESULTS.GRANTED) {
        console.log('Camera permission granted');
        scanDocument()
        setIsPermissionDenied(false)

      } else {
        console.log('Camera permission denied');
        setIsPermissionDenied(true)

      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };
  const backButtonHandler = () => {
    console.log(
      'before permission function called successfully',
      isPermissionFunctionCalled.current
    );
    if (!isPermissionFunctionCalled.current) {
      isPermissionFunctionCalled.current = true; // Set the flag
      // requestCameraPermission();
      console.log(
        'permission function called successfully',
        isPermissionFunctionCalled.current
      );
    }
  };

  useEffect(() => {
    // deleteKey()
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        backButtonHandler(); // Only trigger when app is active
      }
    });

    // Cleanup listener on unmount
    return () => {
      appStateListener.remove();
    };
  }, []);



  const resetDB = async () => {
    resetFoldersTable()
  }



  const scanDocument = async () => {
    // start the document scanner

    const { scannedImages } = await DocumentScanner.scanDocument()


    // get back an array with scanned image file paths
    if (scannedImages.length > 0) {
      // console.log('scanned',scannedImages);
      console.log('scanned', scannedImages);

      // set the img src, so we can view the first scanned image
      try { setImages(scannedImages) }
      catch (e) {
        console.log('error', e);

      }
      setIsShowFolderNameModal(true)
    }
  }




  const copyFilesToDirectory = async () => {
    try {
      console.log('scanned images:', images);

      await RNFS.mkdir(destinationPath);

      const folderDisplayName =
        folderName?.trim() || 'New Folder';

      // 👉 First image for cover
      const firstFileName = images[0]?.split('/').pop() || '';
      const firstExtension = firstFileName.includes('.')
        ? firstFileName.split('.').pop()
        : 'jpg';

      const coverUri = `${folderDisplayName}_0.${firstExtension}`;

      // 1. Create folder
      // const folder = await FolderLocalService.createFolder(
      //   folderDisplayName,
      //   coverUri
      // );
      const folder = await FolderLocalService.createFolder
        ('', folderDisplayName,
          null, '', '', 0, 0)
      console.log('created', folder);


      const folderId = folder.id;

      // 2. Process images
      for (let i = 0; i < images.length; i++) {
        const uri = images[i];

        const originalFileName = uri.split('/').pop() || '';
        const extension = originalFileName.includes('.')
          ? originalFileName.split('.').pop()
          : 'jpg';

        // ✅ SINGLE SOURCE NAME
        // let finalName = `${folderDisplayName}_${i}.${extension}`;
        // let destinationFilePath = `${destinationPath}/${finalName}`;

        let displayName = `${folderDisplayName}`;
        console.log('display name', displayName);

        let finalName = `${folderDisplayName + "_" + Date.now()}.${extension}`;
        let destinationFilePath = `${destinationPath}/${finalName}`;

        // ✅ handle duplicate safely
        let count = 1;
        while (await RNFS.exists(destinationFilePath)) {
          finalName = `${folderDisplayName}_${i}_${count}.${extension}`;
          destinationFilePath = `${destinationPath}/${finalName}`;
          count++;
        }

        console.log('Saving as:', finalName);

        // Copy file
        await RNFS.copyFile(uri, destinationFilePath);
        // ✅ SAME NAME IN DB
        await FileLocalService.createFile({
          name: finalName, // exact match with FS
          displayName: folderDisplayName + '_' + [i], // without extension
          size: 0,
          lastModified: Date.now(),
          folderId: folderId,
        });
      }
      const files = await FileLocalService.getFilesByFolder(folderId)
      console.log('files=======', files);

      const updatedFolder = await FolderLocalService.updateFolderById({ id: folderId, coverUri: files[0].name })

      console.log('updatedFolder cover uri', updatedFolder);
      console.log('✅ All files saved');

      const updatedFolders = await FolderLocalService.getActiveFolders();
      setData(updatedFolders);

      setIsShowFolderNameModal(false);
      setFolderName('');

    } catch (error) {
      console.log('❌ Error:', error);
    }
  };
  const readFilesFromDirectory = async () => {
    try {
      console.log('Reading files from directory: ', destinationPath);

      const files = await RNFS.readDir(destinationPath);

      console.log('✅ Files found:', files.length);

    } catch (error) {
      console.log('Error reading directory:', error);
    }

  };


  const checkIsEditable = (id: number) => {
    // console.log(id, 'id');
    // console.log(folderId, 'folderId');

    if (isFolderNameChange && folderId == id) {
      console.log('return true');

      return true
    }
    else {
      // console.log('return false');
      return false

    }
  }
  const renameFolder = async () => {

    if (folderName.length == 0) {
      alert('Folder name cannot be empty')
      return
    }
    await FolderLocalService.updateFolderById({ id: folderId, name: folderName, isDeleted: 0 })

    // await FolderLocalService.updateFolder(folderId, folderName, existingFolder.coverUri)
    const updatedFolder = await FolderLocalService.getActiveFolders()

    // ✅ update UI
    setData(updatedFolder);
    setIsFolderNameChange(false)

  };


  const checkisFolderSelected = (id: number) => {
    // console.log('selectedfolder', selectedFoldersId);

    return selectedFoldersId.find(item => item.id === id)
  }

  const onSelectFolders = (item: any) => {
    if (checkisFolderSelected(item.id)) {
      setSelectedFoldersId(selectedFoldersId.filter(selectfolderId => selectfolderId.id != item.id))
    }
    else {
      setSelectedFoldersId([...selectedFoldersId, item])
    }

  }
  const deleteMultipleFolder = async () => {
    console.log('folder------', selectedFoldersId);
    const updatedData = [...data];
    updatedData.forEach((item, index) => {
      if (selectedFoldersId.some(selectedItem => selectedItem.id === item.id)) {
        updatedData.splice(index, 1);
      }
    });

    setData(updatedData)
    await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, JSON.stringify(updatedData))
    setSelectedFoldersId([])
    try {
      for (const filePath of selectedFoldersId) {
        // deleteFile(filePath)
      }
      console.log('Files deleted successfully!');
    } catch (error) {
      console.error('Error deleting files:', error);
    }
    setMultidelete(false)
  }

  const generateAndSharePdfs = async (selectedFolders: any) => {

    console.log('selectedFolders', selectedFolders);
    console.log('selectedFolders', selectedFolders.length);

    try {
      const pdfFilePaths: string[] = [];

      // Loop through each selected folder
      for (let i = 0; i < selectedFolders.length; i++) {
        const folderImages = selectedFolders[i].files.map(item => item.path);
        const folderName = `folder_${i + 1}`; // Unique name for each folder PDF

        const options = {
          imagePaths: folderImages,
          name: folderName,
          maxSize: {
            width: 900,
            height: Math.round(Dimensions.get('window').height / Dimensions.get('window').width * 900),
          },
          quality: 1,
        };

        console.log(`Generating PDF for folder ${folderName}`, options);

        const pdf = await RNImageToPdf.createPDFbyImages(options);
        pdfFilePaths.push(pdf.filePath); // Store generated PDF path

        console.log(`PDF Generated: ${pdf.filePath}`);
      }

      // Share all PDFs together
      shareMultiplePdfFiles(pdfFilePaths);

    } catch (e) {
      console.log('Error:', e);
    }
  };

  const shareMultiplePdfFiles = async (filePaths: string[]) => {
    try {
      const shareableUris = await Promise.all(
        filePaths.map(async (path) => {
          const base64Data = await RNFetchBlob.fs.readFile(path, 'base64');
          return `data:application/pdf;base64,${base64Data}`;
        })
      );

      Share.open({
        urls: shareableUris, // Share multiple PDFs at once
      });

      console.log("PDFs Shared Successfully!");
      refForDocShare.current?.close()
    } catch (err) {
      console.log('Error Sharing PDFs:', err);
    }
  };

  const deleteSingleFolder = async (obj: any) => {
    try {
      console.log('Deleting folder:', obj.id);

      // 1. Get all files of this folder
      // const files = data.photos.filter((item:any) => item.folderId === obj.id);
      const files = await FileLocalService.getFilesByFolder(obj.id)
      FolderLocalService.deleteFolderById(obj.id)
      console.log('Files to delete:', files);

      // 2. Delete files from storage
      await Promise.all(
        files.map(async (file: any) => {
          const path = `${destinationPath}${file.name}`;
          const exists = await RNFS.exists(path);

          if (exists) {
            await RNFS.unlink(path);
          }
        })
      );

      // 3. Delete files from DB
      const updatedData = await FolderLocalService.getActiveFolders()

      setData(updatedData);



      // Reset UI states
      setSelectedFoldersId([]);
      setMultidelete(false);

      console.log('✅ Folder deleted successfully');
    } catch (error) {
      console.log('❌ Error deleting folder:', error);
    }
  };

  const deleteFilesFromFolder = async (photos: Array<any>) => {
    console.log('photos===', photos);

    // try {
    //   for (const file of folder.files) {
    //     if (file.uri) {
    //       await deleteFile(file.uri); // your RNFS / RNFetchBlob logic
    //     }
    //   }
    //   console.log('Files deleted successfully!');
    // } catch (error) {
    //   console.error('Error deleting files:', error);
    // }
  };

  const deleteFoldersConfirmationForMultipleItem = () => {
    ConfirmPopup(() => deleteMultipleFolder());
  };
  const deleteFoldersConfirmationForSingleItem = (item: any) => {
    ConfirmPopup(() => deleteSingleFolder(item));
  };
  const onPressSelectAll = () => {
    if (selectedFoldersId.length == data.length) {
      setSelectedFoldersId([])
    }
    else {
      setSelectedFoldersId(data.map(item => item))
    }
  }
  const onPressItem = async (item) => {

    if (isMultiDelete) {
      onSelectFolders(item)
    }
    else {
      // const obj = data.find((v) => v.id === item.id)
      // const selectedFolder: any = { id: obj.id, folderName: obj.folderName, files: obj.files }

      const files = await FileLocalService.getFilesByFolder(item.id)
      navigateTo('DisplayMultipleDocumentImage', { folderName: item.name, folderId: item.id, files: files })
      console.log('files=======', files);

    }
  }

  const shareFile = async (item: Array<any>) => {
    console.log('item', item);
    // refForDocShare.current?.present()

    let data = []
    // for (let i = 0; i < item.files.length; i++) {
    const files = await FileLocalService.getFilesByFolder(item.id)
    const folderFiles = files.map(element => ({
      path: CONSTANT.SAVED_DOCUMENTS_PATH + element.name
    }));

    console.log('files', files);
    data = [...data, ...folderFiles]; // Accumulate file paths from all folders
    console.log('data', data);



    // refForDocShare.current?.close()
    await fileShareMultiple(data)



  }

  const readDirectory = () => {
    readFilesFromDirectory

  }


  const getTagColor = (isSelected: boolean) => {
    if (mode == 'light') {
      if (isSelected) {
        return { bgColor: 'red', iconColor: theme.primaryTextColor, textColor: theme.primaryTextColor }
      }
      else {
        return { bgColor: 'lightgray', iconColor: theme.primaryTextColor, textColor: theme.primaryTextColor }
      }
    }
    else if (mode == 'dark')
      if (isSelected) {
        return { bgColor: theme.buttonBGColor, iconColor: theme.secondaryTextColor, textColor: theme.secondaryTextColor }
      }
      else {
        return { bgColor: theme.secondaryButtonBGColor, iconColor: theme.primaryTextColor, textColor: theme.primaryTextColor }
      }
    else {
      return { bgColor: '', iconColor: theme.secondaryTextColor, textColor: theme.primaryTextColor }
    }
  }

  const renderTags = () => {
    return (
      <View style={styles.tagsWrapper}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.tagsContainer
          }>
          {/* <Text style={{color:theme.primaryTextColor,top:10}}>tags.  </Text> */}
          <View style={{ height: 32, marginRight: scaledSize(10), marginTop: scaledSize(11) }}>
            <MaterialIcons name="local-offer" size={scaledSize(22)} color={theme.themeColor} />
          </View>

          {userTags.map((item: any) => {
            const isSelected =
              selectedTag?.id === item.id;

            return (
              <View style={{ height: 32, marginRight: 10, marginTop: 10 }} key={item.id}>

                <Chip
                  onPress={() => { setSelectedTag(item) }}
                  onClose={() => { alert('close') }}
                  mode='flat'
                  selected={isSelected}
                  showSelectedCheck={false}


                  // showSelectedCheckmark={false}

                  style={{
                    backgroundColor: isSelected ? theme.themeColor : theme.buttonBGColor,
                  }}
                  closeIcon={() =>
                    <CustomMenu
                      Icon={<VECTOR_ICON_LIBRARIES.MaterialDesignIcons name="dots-horizontal" size={18} color="#555" />}
                      menuOptionstyle={{
                        padding: scaledSize(13),
                        width: scaledSize(150),
                        height: scaledSize(50),
                      }}
                      menuOption={[
                        {
                          onSelect: () => {
                            setIsShowRenderRenameTagModal(true),
                              setSelectedTag(item), setTagName(item.name)
                          }, label: 'Rename'
                        },
                        {
                          onSelect: () => {
                            setIsShowDeleteTagConfirmation(true),
                            setSelectedTag(item)
                          }, label: 'Delete'
                        },
                      ]}
                    />
                  }
                  textStyle={{ color: getTagColor(isSelected).textColor, letterSpacing: 0.5, fontSize: scaledSize(13) }}
                >

                  {item.name}
                </Chip>
              </View>
            );
          })}

          {/* Add Tag */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addTagButton}>

            <Ionicons
              name="add"
              size={20}
              color={theme.themeColor}
            />

            <Text style={styles.addTagText}>
              Add Tag
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderGradientButton = (iconName: any, color = 'white', onPress: any) => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={mode === 'light' ? ['white', 'white'] :
            [theme.buttonBGColor, theme.buttonBGColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.uploadButton}>

          <Ionicons
            name={iconName}
            size={scaledSize(18)}
            color={color}
          />
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const renderHeader = () => {
    return (
      <SafeAreaView style={styles.headerContainer}>

        {/* Top Row */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.workspaceText}>
              {/* WORKSPACE */}
            </Text>

            <Text style={styles.heading}>
              My{' '}
              <Text style={styles.primaryText}>
                Documents
              </Text>
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={requestCameraPermission}>
            <LinearGradient
              colors={mode === 'light' ? ['white', 'white'] :
                [theme.buttonBGColor, theme.buttonBGColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadButton}>

              {/* <Ionicons
                name={iconName}
                size={scaledSize(18)}
                color={mode === 'light' ? 'white' : color}
              /> */}
              <Text style={{
                color: mode === 'light' ? theme.iconColor : theme.iconColor,
                letterSpacing: 1, fontSize: scaledSize(14), fontWeight: '500'
              }}>AK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search + Filter */}
        <View style={styles.searchRow}>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={26}
              color="#3E4047"
            />

            <TextInput
              placeholder="Search document..."
              placeholderTextColor="#3E4047"
              style={styles.input}
            />
          </View>
          {renderGradientButton('filter', theme.iconColor, () => setIsShowSortModal(true))}

        </View>
      </SafeAreaView>
    );
  };
  const renderParentItem = ({ item }) => {
    const isSelected = checkisFolderSelected(item.id);
    const isEditable = checkIsEditable(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPressItem(item)}
        onLongPress={() => {
          setMultidelete(!isMultiDelete);
          onSelectFolders(item);
        }}
        style={[
          styles.card,
          isSelected && {
            borderColor: '#3CF28A',
          },
        ]}>

        {/* Left Section */}
        <View style={styles.leftContainer}>
          <View style={styles.thumbnailWrapper}>
            <Image
              source={{
                uri: getImageUriByOS(
                  destinationPath + item?.coverUri,
                ),
              }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>

          <View style={styles.content}>

            <>
              <Text
                numberOfLines={1}
                style={[
                  styles.title,
                  { color: theme.primaryTextColor },
                ]}>
                {capitalizeFirstLetter(item?.name || '')}
              </Text>

              <Text style={styles.date}>
                {DateHelper.getDateByMomentFormat(item?.createdAt, 
                  DateFormat.DATE_WITH_MONTH_NAME)}
              </Text>

              <View style={styles.tagContainer}>
                <View style={styles.greenLine} />

                <Text style={styles.tagText}>
                  IMAGE
                </Text>
              </View>
            </>

          </View>
        </View>

        {/* Right Actions */}
        {!isMultiDelete && (
          <View style={{ ...styles.actionRow, flex: .7, }}>

            {renderGradientButton('share-social-sharp', theme.iconColor, () => shareFile(item))}
            {renderGradientButton('pencil', theme.iconColor, () => {
              setIsFolderNameChange(true);
              setFolderId(item.id);
            })}
            {renderGradientButton('trash-outline', 'red', () => deleteFoldersConfirmationForSingleItem(item))}




          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTagBtn = () => {
    return (<TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setIsTagModalVisible(true)}
      style={styles.addTagButton}
      onLongPress={() => alert('test')}
    >

      <Ionicons
        name="add"
        size={18}
        color={theme.themeColor}
      />

      <Text style={styles.addTagText}>
        Add Tag
      </Text>
    </TouchableOpacity>)
  }


  const addTagHandler = async () => {
    alert('add tag' + tagName)
    const createdTags = await tagLocalService.addTag({ userId: '', name: tagName, color: '#3CF28A' })
    console.log('createdTags===', createdTags);
    const tags = await tagLocalService.getTags()
    console.log('existing tags===', tags);
    setUserTags(tags)
    setIsTagModalVisible(false)
    setIsShowRenderRenameTagModal(false)
    setTagName('')
  }

  const renameTagHandler = async () => {
    if (tagName.length == 0) {
      alert('Tag name cannot be empty')
      return
    }
    const existingTag = await tagLocalService.getTagById(selectedTag.id)
    console.log('existingTag===', existingTag);
    const updatedTags = await tagLocalService.updateTag(selectedTag.id, { name: tagName })
    console.log('updatedTags===', updatedTags);
    const tags = await tagLocalService.getTags()
    console.log('existing tags===', tags);
    setUserTags(tags)
    setIsTagModalVisible(false)
    setIsShowRenderRenameTagModal(false)
    setTagName('')
  }

  const deleteTagHandler = async () => {
    const existingTag = await tagLocalService.getTagById(selectedTag.id)
    console.log('existingTag===', existingTag);
    const updatedTags = await tagLocalService.updateTag(selectedTag.id, { isDeleted: 1 })
    console.log('updatedTags===', updatedTags);
    const tags = await tagLocalService.getTags()
    console.log('existing tags===', tags);
    setUserTags(tags)
    setIsTagModalVisible(false)
    setIsShowRenderRenameTagModal(false)
    setIsShowDeleteTagConfirmation(false)
    setTagName('')
  }
  const renderAddTagModal = () => {
    return (
      <Modal
        // visible={true}
        visible={isTagModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsTagModalVisible(false)
        }>

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            {/* Header */}
            <Text style={styles.modalTitle}>
              Add tag
            </Text>

            <Text style={styles.modalSubtitle}>
              Enter a new tag name
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                value={tagName}
                onChangeText={setTagName}
                placeholder="Tag name"
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonRow}>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cancelButton}
                onPress={() =>
                  setIsTagModalVisible(false)
                }>

                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.renameButton}
                onPress={addTagHandler}>

                <LinearGradient
                  colors={[
                    theme.themeSecondaryColor,
                    theme.themeColor,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}>

                  <Text style={styles.renameText}>
                    Create
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };


  const renderRenameTagModal = () => {
    return (
      <Modal
        visible={isShowRenderRenameTagModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsShowRenderRenameTagModal(false)
        }>

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            {/* Header */}
            <Text style={styles.modalTitle}>
              Rename Tag
            </Text>

            <Text style={styles.modalSubtitle}>
              Enter a new tag name
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                value={tagName}
                onChangeText={setTagName}
                placeholder="Tag name"
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonRow}>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cancelButton}
                onPress={() =>
                  setIsShowRenderRenameTagModal(false)
                }>

                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.renameButton}
                onPress={() => renameTagHandler()}>

                <LinearGradient
                  colors={[
                    theme.themeSecondaryColor,
                    theme.themeColor,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}>

                  <Text style={styles.renameText}>
                    Rename
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  const renderRenameModal = () => {
    return (
      <Modal
        // visible={true}
        visible={isFolderNameChange}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsFolderNameChange(false)
        }>

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            {/* Header */}
            <Text style={styles.modalTitle}>
              Rename Folder
            </Text>

            <Text style={styles.modalSubtitle}>
              Enter a new folder name
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                value={folderName}
                onChangeText={setFolderName}
                placeholder="Folder name"
                placeholderTextColor="#9CA3AF"
                style={styles.modalInput}
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonRow}>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cancelButton}
                onPress={() =>
                  setIsFolderNameChange(false)
                }>

                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.renameButton}
                onPress={renameFolder}>

                <LinearGradient
                  colors={[
                    theme.themeSecondaryColor,
                    theme.themeColor,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}>

                  <Text style={styles.renameText}>
                    Rename
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // const getFiles = () => {
  //   if (isLocalDataFetch) {

  //     if (searchQuery.length > 0) {
  //       return data.filter(file =>
  //         file.name.toLowerCase().includes(searchQuery.toLowerCase())
  //       );
  //     } else {
  //       return data;
  //     }
  //   }
  //   else {
  //     console.log('returned------', data);

  //     return []
  //   }
  // };
  const getFiles = () => {
  if (!isLocalDataFetch) {
    return [];
  }

  let filteredData = [...data];

  // search
  if (searchQuery?.length > 0) {
    filteredData = filteredData.filter(
      file =>
        file.name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase(),
          ),
    );
  }

  // tag filter
  if (selectedTag) {
    filteredData =
      filteredData.filter(
        file =>
          file.tagId ===
          selectedTag.id,
      );
  }

  // sorting
  filteredData =
    onApplySortHandler(
      selectedSort,
      filteredData,
    );

  return filteredData;
};


  const backupFolderPath = CONSTANT.ASYNC_STORAGE_STRING_INTO_JSON_BAKUP_PATH;
  const jsonPath = `${CONSTANT.BACKUP_PATH}/path.json`;
  const downloadPath = `${CONSTANT.BACKUP_PATH}/document_backup.zip`; // Downloads path

  const saveAsyncStorageToFile = async () => {
    try {
      // Fetch data from AsyncStorage
      const storedData = await AsyncStorage.getItem(asyncStorageKeyName.DOCUMENTS);
      const jsonData = { imagePaths: JSON.parse(storedData) || [] };

      const fileExists = await RNFS.exists(jsonPath);

      if (fileExists) {
        // Delete the file if it exists
        await RNFS.unlink(jsonPath);
        console.log(`Existing file deleted at: ${jsonPath}`);
      }

      // Convert to string and save to JSON file
      await RNFS.writeFile(jsonPath, JSON.stringify(jsonData), 'utf8');
      console.log('AsyncStorage data saved to JSON file:', jsonPath);
      return jsonPath; // Return the path to include it in the zip
    }
    catch (error) {
      console.error('Error saving AsyncStorage to file:', error);
    }
  }

  const createBackup = async () => {
    try {
      // Get the image paths from AsyncStorage

      const storedImages = await AsyncStorage.getItem(asyncStorageKeyName.DOCUMENTS);
      const imagePaths = JSON.parse(storedImages) || [];
      if (imagePaths.length == 0) {
        console.log('imagePaths is zero :', imagePaths);
        setIsBackupStarted(false)
        CustomErrorToast('you have no images to backup. Please make sure you have images before attempting to backup. :)');
        return

      }
      console.log('imagePaths:', imagePaths[0].files);

      const arr = imagePaths.flatMap(item => item.files.map(fileItem => fileItem.path));
      console.log('arrrr=====', arr);
      // Ensure backup directory exists
      // await RNFS.mkdir(backupFolderPath);

      // Save AsyncStorage data to a JSON file
      const jsonFilePath = await saveAsyncStorageToFile();
      // console.log('jsonFilePath======', jsonFilePath);
      // Create a list of files to zip (images + JSON file)
      const fileExists = await RNFS.exists(downloadPath);
      if (fileExists) {
        await RNFS.unlink(downloadPath);
        console.log('Existing file deleted in Downloads:', downloadPath);
      }

      const filesToZip = [...arr, jsonFilePath];
      console.log('filesToZip======', filesToZip);

      // Create a zip archive of the images and JSON file
      console.log('fdownloadPath======', downloadPath);
      const result = await zip(filesToZip, downloadPath);

      setTimeout(() => {
        setIsBackupCompleted(true)
        console.log('Backup created at:', result);
      }, 3000);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const importBackup = async (zipFile: any) => {
    console.log('zipfile-----', zipFile);



    const extractedPath = await unzip(zipFile.fileCopyUri, CONSTANT.SAVED_DOCUMENTS_PATH);
    console.log('extractedPath-----', extractedPath);
    try {
      // Read the JSON file content
      const fileContent = await RNFS.readFile(`${CONSTANT.SAVED_DOCUMENTS_PATH}path.json`, 'utf8');

      // Parse the JSON content
      const jsonData = JSON.parse(fileContent);

      // Save parsed JSON to AsyncStorage (assuming you want to save it with a specific key)
      console.log('AsyncStorage saved with JSON data:', jsonData);
      await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, JSON.stringify(jsonData.imagePaths));
      setData(jsonData.imagePaths)
      console.log('AsyncStorage saved with JSON data:', jsonData);

    } catch (error) {
      console.error('Error reading or saving JSON data:', error);
    }




  }


  const openFile = async () => {
    console.log('open file===');


    try {
      const res = await DocumentPicker({ isMultipleSelection: false })
      let fileExtension = ''
      let uri = ''

      if (res) {
        // console.log('name--------------', res[0].localUri);
        // fileExtension = res[0].localUri.split('.').pop()
        // uri = res[0].localUri
        const uri = getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + 'kpo_0.jpg')

        console.log('uri', uri);

        const accessToken = getLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN) || ''
        const folderId = await GoogleDriveService.getOrCreateGDriveFolderName(accessToken, asyncStorageKeyName.DRIVE_FOLDER_NAME)
        await GoogleDriveService.uploadImage(uri, accessToken, folderId)
        console.log('accesstoken', accessToken);
        console.log('folderId', folderId);
        console.log('localUri====', uri);


      }


      console.log('fileExtension--------------', fileExtension);
      console.log('uri--------------', uri);





    }
    catch (error) {
      console.log('openFile error-----', error);
    }
  }
  const onApplySortHandler = (sortType: string,sorted: any[]) => {
     
  switch (sortType) {
    case 'latest':

      return sorted.sort(
        (a, b) =>
          b.createdAt - a.createdAt,
      );

    case 'oldest':
      return sorted.sort(
        (a, b) =>
          a.createdAt - b.createdAt,
      );

    case 'name_asc':
      return sorted.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

    case 'name_desc':
      return sorted.sort((a, b) =>
        b.name.localeCompare(a.name),
      );

    case 'size':
      return sorted.sort(
        (a, b) => b.size - a.size,
      );

    case 'modified':
      return sorted.sort(
        (a, b) =>
          b.updatedAt - a.updatedAt,
      );

    default:
      return sorted;
  }
    setIsShowSortModal(false)
    // implement filter logic here
  }
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTags()}
      <View style={{ height: 40, width: 100, position: 'absolute', top: 150, right: 10 }}>
        {renderTagBtn()}
      </View>


      {/* <View style={{
        height: scaledSize(50),
        alignSelf: 'center',
        marginTop: heightFromPercentage(4)


      }}>
        {isMultiDelete ? <LinearGradient
          colors={['#1385b5', '#2fb2a2']}
          style={{ height: scaledSize(50), }}>
          <View style={{
            justifyContent: 'space-between', flex: 1, width: '100%',
            flexDirection: 'row', alignItems: 'flex-start'
          }}>
            <View style={{
              flex: 1, height: '100%',
              justifyContent: 'center', alignItems: 'flex-start',
            }}>
              <TouchableOpacity onPress={() => { setMultidelete(false), setSelectedFoldersId([]) }}>
                <MaterialIcons name='arrow-back' color={'white'}
                  size={scaledSize(30)} style={{ marginLeft: scaledSize(10), marginRight: scaledSize(4) }} />
              </TouchableOpacity>
            </View>
            <View style={{
              justifyContent: 'center', flexDirection: 'row',
              height: scaledSize(50), alignItems: 'center'
            }}>
              <View style={{ width: scaledSize(50) }}>

                <Text style={{
                  fontSize: scaledSize(16), color: 'white', fontWeight: 'bold',
                  letterSpacing: 1, fontFamily: FONTS.QuicksandBold,
                }}>{selectedFoldersId.length}</Text>
              </View>
              <TouchableOpacity onPress={onPressSelectAll} style={{ width: scaledSize(100) }}>
                <Text style={{
                  fontSize: scaledSize(16), color: 'white',
                  letterSpacing: 1, fontFamily: FONTS.bold
                }}>{data.length == selectedFoldersId.length ? 'Unselect All' : 'Select All'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => refForDocShare.current?.present()}>
                <MaterialIcons name='share' color={'white'} size={scaledSize(24)} style={{ marginLeft: scaledSize(10) }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { deleteFoldersConfirmationForMultipleItem() }}>
                <MaterialIcons name='delete' color={'white'}
                  size={scaledSize(24)} style={{ marginLeft: scaledSize(10), marginRight: scaledSize(4) }} />
              </TouchableOpacity>
            </View>
          </View>

        </LinearGradient> :

          <LinearGradient
            colors={['#0081A7', '#00AFB9']}
            style={{
              flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
              width: '95%', alignSelf: 'center',
              borderRadius: scaledSize(8),
            }}>
            <View style={{
              width: widthFromPercentage(78),
              height: scaledSize(43),
              justifyContent: 'center', alignItems: 'center',
              alignSelf: 'center',
            }}>
              <Searchbar
                placeholder="Search"
                style={{
                  borderRadius: scaledSize(0), height: scaledSize(43), marginRight: scaledSize(20),
                  backgroundColor: 'white', textAlign: 'center', borderWidth: 1, borderColor: '#e7ebf3',
                  alignSelf: 'center'
                }}
                defaultValue={searchText}
                onChangeText={(value) => setSearchText(value)}

                inputStyle={{ fontSize: scaledSize(14), alignSelf: 'center' }}
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
            <View style={{
              width: scaledSize(45), height: scaledSize(40), justifyContent: 'center',
              alignItems: 'center', marginLeft: scaledSize(10), right: 14,
            }}>
              <MaterialCommunityIcons name='cloud-upload-outline' size={scaledSize(24)}
                color={'white'} onPress={() => openFile()} />
            </View>
          </LinearGradient>
        }

      </View> */}
      {/* ----------------------------- */}
      <View style={{ flex: 1, marginTop: heightFromPercentage(0.5) }}>
        {getFiles().length > 0 ? <FlatList
          showsVerticalScrollIndicator={false}
          data={getFiles()}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          keyExtractor={(item) => item.id}
          renderItem={renderParentItem}
        /> :
          <>
            {isPermissionDenied ?
              <View style={{ flex: 1 }}>
                <Modal visible={isPermissionDenied} transparent>
                  <CustomPermissionMessage permissionMessage={'Please Allow Camera Permission'}
                    onPressClose={() => setIsPermissionDenied(false)} />
                </Modal>
              </View>
              :
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => openFile()}>
                  <Image source={cloud} style={{ height: scaledSize(150), width: scaledSize(200) }} />

                </TouchableOpacity>
                <Text style={{ fontSize: scaledSize(16), letterSpacing: 1 }} >{'Import backup'}</Text>
              </View>
            }
          </>

        }

      </View>
      {/* <View style={{
        height: scaledSize(50), position: "absolute", left: scaledSize(20),
        top: heightFromPercentage(72)
      }}>
        <Text style={{ color: 'black' }}>{localFiles.length}</Text>
        {localFiles.map((item) => (
          <Text key={item?.id} style={{ color: 'black' }}>{'Drive' + item.driveFileId}
            {'   isSync ' + item?.isSynced}{'  is deleted ' + item?.isDeleted}{'  name ' + item?.name}</Text>
        ))}
      </View> */}

      <View style={{
        height: scaledSize(50), position: "absolute", left: scaledSize(270),
        top: heightFromPercentage(72)
      }}>
        <CustomFAB
        style={{borderWidth:.5, borderColor: theme.iconColor}}
          icon={<Ionicons name='camera-outline' size={scaledSize(24)}
            color={mode === 'light' ? 'white' : theme.iconColor} />}
          onPress={() => { requestCameraPermission() }}
        // onPress={scanDocument}
        />
      </View>
      <Overlay isVisible={isShowFolderNameModal} overlayStyle={{ borderRadius: scaledSize(10) }}>
        <View style={{ height: scaledSize(180), width: scaledSize(300), backgroundColor: 'white', }}>
          <View style={{ height: scaledSize(50), backgroundColor: 'white', flexDirection: 'row' }}>
            <View style={{ flex: 2, justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{
                fontSize: scaledSize(14), fontFamily: FONTS.QuicksandBold,
                textAlign: 'center', marginTop: scaledSize(4),
              }}>
                Enter Folder Name
              </Text>
            </View>
            <View style={{ flex: .2, justifyContent: 'flex-start', alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => { setIsShowFolderNameModal(false) }}>
                <MaterialIcons name='close'
                  size={scaledSize(30)} style={{ bottom: scaledSize(4) }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: scaledSize(40), width: scaledSize(300), marginTop: scaledSize(10) }}>
            <CustomInputBox
              onChangeText={setFolderName} value={folderName} placeholder='Enter name' />
          </View>
          <View style={{ height: scaledSize(40), width: scaledSize(300), marginTop: scaledSize(30) }}>
            <CustomeButton name='Save' onPress={() => copyFilesToDirectory()}
              buttonStyle={{ backgroundColor: COLORS.THEME_COLOR, borderRadius: scaledSize(20) }} textStyle={{ color: 'white' }} />
          </View>

        </View>
      </Overlay>

      <Overlay isVisible={isBackupStarted} >
        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            height: scaledSize(300), width: '100%',
            borderWidth: 0, borderColor: '#d3d3d3',
            borderRadius: scaledSize(10),
          }}>
            {isBackupCompleted ?
              <View>
                <View style={{
                  height: scaledSize(250), width: scaledSize(330),
                  borderRadius: scaledSize(8), top: scaledSize(30)
                }}>
                  <View style={{ top: scaledSize(-10), left: scaledSize(280), width: '90%', alignSelf: 'center' }}>
                    <CustomCloseIcon onPress={() => { setIsBackupStarted(false), setIsBackupCompleted(false) }} />
                  </View>

                  <LottieView
                    onAnimationFinish={() => console.log('fininsh')
                    }
                    style={{ flex: 1, }}
                    source={animation_completed}
                    autoPlay loop >
                  </LottieView>
                </View>

              </View>
              :
              <View>


                <View style={{
                  height: scaledSize(250), width: scaledSize(330),
                  borderRadius: scaledSize(8),
                }}>

                  <LottieView
                    onAnimationFinish={() => console.log('fininsh')
                    }
                    style={{ flex: 1, }}
                    source={backup_animation}
                    autoPlay loop >
                  </LottieView>
                </View>
                <Text style={{
                  fontSize: scaledSize(14), color: 'white', fontFamily: Fonts.bold, letterSpacing: .8,
                  textAlign: 'center', top: scaledSize(10)
                }}>
                  Backup in process..
                </Text>
              </View>}
          </View>

        </View>
      </Overlay>
      <CustomSpinner isLoading={isLoading} />

      <View style={{
        height: scaledSize(100), width: '80%',
        flexDirection: 'row', justifyContent: "space-between"
      }}>
        {/* <Image
          resizeMode="contain"
          source={{ uri: getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + '1777791940638Ght.jpg') }}
          style={{
            height: '100%', width: '30%', top: scaledSize(0), alignSelf: 'flex-end'
          }}
        /> */}
        <Switch
          trackColor={{ false: '#767577', true: 'green' }}
          thumbColor={mode == 'dark' ? 'green' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleTheme()}
          value={mode == 'dark' ? true : false}

        />
        {/* {renderButton()} */}
        {/* <CustomeButton onPress={() => readFilesFromDirectory()} name={'Read'}
            buttonStyle={{ backgroundColor: 'blue', borderWidth: .3 }} textStyle={{ color: 'white' }} /> */}
      </View>

      <CustomBottomSheet title='Option' headerColor='#f5f5f5'
        ref={refForDocShare} bottomShitSnapPoints={['30', '30', '50']} >
        <View style={{ backgroundColor: '#f5f5f5', padding: scaledSize(10) }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: scaledSize(16), letterSpacing: 1, fontFamily: FONTS.regular }}>Share as</Text>
          </View>

          <View
            style={{ flex: 1, marginTop: scaledSize(10), justifyContent: "center", alignItems: 'center' }}>
            <TouchableOpacity style={styles.shareOptionS} onPress={() => generateAndSharePdfs(selectedFoldersId)}>
              <Text style={{ fontSize: scaledSize(16), fontFamily: FONTS.regular }}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.shareOptionS, { marginTop: scaledSize(10) }]}
              onPress={() => shareFile(selectedFoldersId)}>
              <Text style={{ fontSize: scaledSize(16), fontFamily: FONTS.regular }}>Images</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.shareOptionS, { marginTop: scaledSize(20), }]}
              onPress={() => refForDocShare.current?.close()}>
              <Text style={{ fontSize: scaledSize(16), fontFamily: FONTS.regular, color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>
      {renderRenameModal()}
      {renderAddTagModal()}
      {renderRenameTagModal()}
      <CustomSortModal isvisible={isShowSortModal}
        onPressClear={() => {
          setIsShowSortModal(false);
          setSelectedSort('');
        }}
        onPressApply={(sort) => {setSelectedSort(sort),setIsShowSortModal(false)}}
        onPressClose={() => setIsShowSortModal(false)}
      />
      <ConfirmationDialog visible={isShowDeleteTagConfirmation} mode='delete'
        onCancel={() => setIsShowDeleteTagConfirmation(false)} onSubmit={() => deleteTagHandler()} />
    </SafeAreaView>
  )
}



export default DocumentScan;

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      theme.bgContainor
  },
  card: {
    height: scaledSize(120),
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginHorizontal: scaledSize(12),
    marginTop: scaledSize(18),

    paddingHorizontal: scaledSize(18),
    paddingVertical: scaledSize(12),

    borderRadius: scaledSize(20),

    backgroundColor: theme.bgColor,

    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowOpacity: 0.18,

    shadowRadius: scaledSize(10),

    shadowOffset: {
      width: 0,
      height: scaledSize(4),
    },

    elevation: mode === 'dark' ? 4 : 0,

  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:'yellow',
    flex: 1,
  },

  thumbnailWrapper: {
    width: scaledSize(62),
    height: scaledSize(62),

    // borderRadius: scaledSize(30),


  },

  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: scaledSize(4),
  },

  content: {
    flex: 1,

    marginLeft: scaledSize(16),

    justifyContent: 'center',
  },

  title: {
    fontSize: scaledSize(15),
    fontFamily: FONTS.regular,
    letterSpacing: 0.5,
    color: theme.primaryTextColor,
  },

  date: {
    marginTop: scaledSize(6),

    fontSize: scaledSize(12),
    fontFamily: FONTS.regular,
    letterSpacing: 0.5,

    color: mode === 'dark' ? '#808080' : 'gray',

    fontWeight: '500',
  },

  tagContainer: {
    marginTop: scaledSize(10),

    alignSelf: 'flex-start',

    flexDirection: 'row',

    alignItems: 'center',

    paddingLeft: scaledSize(0),
    paddingRight: scaledSize(14),

    height: scaledSize(20),

    borderRadius: scaledSize(6),

    backgroundColor: theme.buttonBGColor,
    borderWidth: mode === 'light' ? .4 : 0,
    borderColor: '#d3d3d3',

    overflow: 'hidden',
  },

  greenLine: {
    width: scaledSize(5),

    height: '100%',

    backgroundColor: theme.themeColor,
    // backgroundColor: '#00E676',


    borderTopLeftRadius: scaledSize(6),
    borderBottomLeftRadius: scaledSize(6),

    marginRight: scaledSize(10),
  },

  tagText: {
    color: theme.themeColor,


    fontSize: scaledSize(12),
    // fontFamily: FONTS.PTSerifBold,

    fontWeight: '500',

    letterSpacing: 0.5,
  },

  actionRow: {
    flexDirection: 'row',

    alignItems: 'center',

    // marginLeft: scaledSize(12),
  },

  actionButton: {
    width: scaledSize(37),
    height: scaledSize(37),
    fontSize: scaledSize(18),

    borderRadius: scaledSize(10),

    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth:.5,
    // borderColor: mode === 'dark' ? '#46F28D' : 'green',

    marginLeft: scaledSize(6),
    backgroundColor: theme.buttonBGColor,

  },
  headerContainer: {
    paddingHorizontal: scaledSize(18),
    paddingTop: scaledSize(18),
    paddingBottom: scaledSize(10),

    backgroundColor: theme.bgContainor,
  },

  topRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },

  workspaceText: {
    fontSize: scaledSize(14),

    letterSpacing: 0.5,

    color: theme.secondaryTextColor,

    fontWeight: '600',
  },

  heading: {
    marginTop: scaledSize(5),

    fontSize: scaledSize(20),

    fontWeight: '600',

    color: theme.primaryTextColor,
  },

  primaryText: {
    color: theme.themeColor,
  },

  profileContainer: {
    width: scaledSize(50),
    height: scaledSize(50),
    marginTop: scaledSize(5),

    borderRadius: scaledSize(25),

    backgroundColor: theme.buttonBGColor,

    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    fontSize: scaledSize(16),

    fontWeight: '800',

    color: theme.secondaryTextColor,
  },





  searchRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: scaledSize(20),
  },

  searchContainer: {
    flex: 1,

    height: scaledSize(45),

    borderRadius: scaledSize(18),

    backgroundColor: mode === 'dark' ? '#1c1c1e' : '#FFFFFF',

    borderWidth: mode === 'dark' ? .2 : .5,
    borderColor: '#d3d3d3',


    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: scaledSize(18),

    shadowColor: '#D9DDE8',

    shadowOpacity: 0.18,

    shadowRadius: scaledSize(10),

    shadowOffset: {
      width: 0,
      height: scaledSize(4),
    },

    elevation: 4,
  },

  input: {
    flex: 1,

    marginLeft: scaledSize(10),

    color: '#161735',

    fontSize: scaledSize(12),
    letterSpacing: 1,
    // fontFamily: FONTS.regular,

    // fontWeight: '500',

    padding: 0,

    backgroundColor: 'transparent',
  },


  uploadButton: {
    width: scaledSize(36),
    height: scaledSize(36),

    borderRadius: scaledSize(12),

    justifyContent: 'center',
    alignItems: 'center',

    // shadowColor: theme.themeColor,
    shadowOpacity: 0.45,
    marginLeft: scaledSize(6),

    shadowRadius: scaledSize(4),

    shadowOffset: {
      width: 0,
      height: scaledSize(4),
    },

    elevation: 2,
  },
  // ****************render tab******************
  tagsWrapper: {
    marginTop: 20,
  },

  tagsContainer: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },


  tagName: {
    marginHorizontal: 12,

    fontSize: 16,

    fontWeight: '700',
  },

  tagIconContainer: {
    width: 32,
    height: 32,

    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',
  },


  editBtn: {
    marginLeft: 16,

    justifyContent: 'center',
    alignItems: 'center',
  },

  activeArrow: {
    position: 'absolute',

    bottom: -8,

    alignSelf: 'center',

    left: '50%',

    marginLeft: -8,

    width: 16,
    height: 16,

    backgroundColor: theme.themeColor,

    transform: [{ rotate: '45deg' }],
  },

  addTagButton: {
    height: 64,

    paddingHorizontal: 22,

    borderRadius: 22,

    borderWidth: 1.5,

    borderStyle: 'dashed',

    borderColor: '#D9E1EC',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  addTagText: {
    marginLeft: 8,

    fontSize: 16,

    fontWeight: '700',

    color: theme.themeColor,
  },

  // ********************* Rename Modal ***********************
  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.45)',

    justifyContent: 'center',

    paddingHorizontal: scaledSize(20),
  },

  modalContainer: {
    borderRadius: scaledSize(20),

    padding: scaledSize(20),

    backgroundColor: theme.bgColor,

    borderWidth: 1,

    borderColor: theme.borderColor,
  },

  modalTitle: {
    fontSize: scaledSize(20),

    fontWeight: '800',

    color: theme.primaryTextColor,
  },

  modalSubtitle: {
    marginTop: scaledSize(6),

    fontSize: scaledSize(12),

    color: '#8B93A7',
  },

  inputContainer: {
    height: scaledSize(50),

    borderRadius: scaledSize(14),

    marginTop: scaledSize(20),

    backgroundColor: theme.buttonBGColor,

    borderWidth: 1,

    borderColor: theme.borderColor,

    justifyContent: 'center',

    paddingHorizontal: scaledSize(12),
  },

  modalInput: {
    fontSize: scaledSize(12),

    color: theme.primaryTextColor,

    padding: 0,
  },

  modalButtonRow: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginTop: scaledSize(24),
  },

  cancelButton: {
    height: scaledSize(46),

    paddingHorizontal: scaledSize(18),

    borderRadius: scaledSize(12),

    backgroundColor: theme.buttonBGColor,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: scaledSize(10),
  },

  cancelText: {
    fontSize: scaledSize(12),

    fontWeight: '700',

    color: theme.primaryTextColor,
  },

  renameButton: {
    borderRadius: scaledSize(12),

    overflow: 'hidden',
  },

  gradientButton: {
    height: scaledSize(46),

    paddingHorizontal: scaledSize(20),

    justifyContent: 'center',

    alignItems: 'center',
  },

  renameText: {
    fontSize: scaledSize(12),

    fontWeight: '800',

    color: theme.secondaryTextColor,
  },

  // ************* tag btn ****************
  addTagButton: {
    height: scaledSize(40),
    paddingHorizontal: scaledSize(14),

    borderRadius: scaledSize(12),

    // borderWidth: 1.5,

    // borderStyle: 'dashed',

    borderColor: theme.themeColor,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',


  },
  // ******************* Sort Modal ******************


  sortModalContainer: {
    width: '98%',

    backgroundColor:
      theme.bgContainor,

    borderRadius: scaledSize(6),

    paddingTop: scaledSize(18),

    paddingBottom: scaledSize(18),

    paddingHorizontal: scaledSize(18),

    borderWidth: scaledSize(1),

    borderColor: theme.borderColor,
  },

  headerRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    marginBottom: scaledSize(20),
  },

  sortTitle: {
    fontSize: scaledSize(18),

    fontWeight: '700',

    color: theme.primaryTextColor,
  },

  closeBtn: {
    width: scaledSize(30),

    height: scaledSize(30),

    borderRadius: scaledSize(16),

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor:
      theme.buttonBGColor,
  },

  sortRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: scaledSize(20),
    paddingVertical: scaledSize(6),
  },

  radioOuter: {
    width: scaledSize(20),

    height: scaledSize(20),

    borderRadius: scaledSize(12),

    borderWidth: scaledSize(1),

    borderColor: '#B8BDC9',

    justifyContent: 'center',

    alignItems: 'center',
  },

  radioInner: {
    width: scaledSize(10),

    height: scaledSize(10),

    borderRadius: scaledSize(5),

    backgroundColor:
      theme.themeColor,
  },

  sortLabel: {
    marginLeft: scaledSize(14),

    fontSize: scaledSize(12),

    color: theme.primaryTextColor,

    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginTop: 10,

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor: theme.borderColor,
  },

  clearButton: {
    height: 44,

    paddingHorizontal: 18,

    borderRadius: 12,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor:
      theme.buttonBGColor,

    marginRight: 10,
  },

  clearText: {
    fontSize: 15,

    fontWeight: '600',

    color: theme.primaryTextColor,
  },

  applyButton: {
    height: 44,

    paddingHorizontal: 22,

    borderRadius: 12,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor:
      theme.themeColor,
  },

  applyText: {
    fontSize: 15,

    fontWeight: '700',

    color: theme.secondaryTextColor,
  },



});