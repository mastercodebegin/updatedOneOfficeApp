import React, { useState, useEffect, useRef, use, useMemo } from 'react'
import { AppState, BackHandler, Dimensions, FlatList, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleProp, StyleSheet, Switch, Text, TextInput, TextProps, TextStyle, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import { Button, Overlay } from 'react-native-elements';
import { Chip } from 'react-native-paper'
import RNFS from 'react-native-fs';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../../utilies/Constants';
import { ConfirmPopup, deleteFile, fileShareMultiple, heightFromPercentage, scaledSize, Utility, VECTOR_ICON_LIBRARIES, widthFromPercentage } from '../../utilies/Utilities';
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
import { types } from '@react-native-documents/picker';
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
import { getLocalData, removeLocalData, setLocalData } from '../../utilies/storageUtility';
import { FolderLocalService, resetFoldersTable } from '../../db/folderLocalService';
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
import CustomErrorMsgModal from '../../component/CustomErrorMsgModal';
import CustomUpdateFolderTagModal from '../../component/CustomUpdateFolderTagModal';
import CustomGoogleBtn from '../../component/CustomGoogleBtn';
import AntDesign from 'react-native-vector-icons/AntDesign'
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
  const [selectedFolder, setSelectedFolder] = useState();
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
  const [isShowFolderDeleteConfirmation, setIsFolderDeleteConfirmation] = useState(false)
  const [isShowErrorModal, setIsShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isShowSortModal, setIsShowSortModal] = useState(false)
  const [isShowImportConfirmation, setIsShowImportConfirmation] = useState(false);
  const [backupFileToImport, setBackupFileToImport] = useState<string | null>(null);
  const [tagToRename, setTagToRename] = useState(null);
  const [isShowDeleteMultipleTagsConfirmation, setIsShowDeleteMultipleTagsConfirmation] = useState(false)
  const [isShowUpdateTagModal, setIsShowUpdateTagModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState('')
  const [selectedTags, setSelectedTags] = useState([]);
  const [folderStats, setFolderStats] = useState<{ [key: number]: { count: number, size: number } }>({});
  const [maxFolderSize, setMaxFolderSize] = useState(0);

  const [selectedFolderTag, setSelectedFolderTag] = useState({});
  const [tagForDeletion, setTagForDeletion] = useState({});

  // const toggleSwitch = toggleTheme()
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
  ];


  // const theme =useSelector((state:any)=>state.ThemeSlice)
  const { mode, theme, toggleTheme } = useTheme()

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme])

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  useEffect(() => {
    if (data.length > 0 && localFiles.length > 0) {
      const stats = {};
      let max = 0;
      data.forEach(folder => {
        const filesInFolder = localFiles.filter(file => file.folderId === folder.id);
        const count = filesInFolder.length;
        const size = filesInFolder.reduce((acc, file) => acc + (file.size || 0), 0);
        stats[folder.id] = { count, size };
        if (size > max) {
          max = size;
        }
      });
      setFolderStats(stats);
      setMaxFolderSize(max);
    } else {
      // Reset stats if there's no data
      setFolderStats({});
      setMaxFolderSize(0);
    }
  }, [data, localFiles]);

  useEffect(() => {
    // console.log('ThemeSlice', theme);
    // console.log('mode', mode);
   const user = getLocalData(asyncStorageKeyName.USER_DETAILS)
   console.log('user',user);
   
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
    setLocalFiles(files);
  }

  useEffect(() => {
    if (!isFocused) return;

    const fetchData = async () => {
      try {
        const folders = await FolderLocalService.getActiveFolders();
        const tags = await tagLocalService.getTags();


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
        ('', selectedFolderTag?.id, folderDisplayName,
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
    setSelectedFolder(item)
    setIsFolderDeleteConfirmation(true)
    //  deleteSingleFolder(item)
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
      Utility.navigation.navigateTo('DisplayMultipleDocumentImage', { folderName: item.name, folderId: item.id, files: files })
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
        return { bgColor: theme.buttonBGColor, iconColor: theme.secondaryTextColor, textColor: theme.primaryTextColor }
      }
      else {
        return { bgColor: theme.secondaryButtonBGColor, iconColor: theme.primaryTextColor, textColor: theme.primaryTextColor }
      }
    else {
      return { bgColor: '', iconColor: theme.secondaryTextColor, textColor: theme.primaryTextColor }
    }
  }
  const selectTagHandler = (tag: any) => {

    const isTagSelected = selectedTags.find((item) => item.id == tag.id)
    if (isTagSelected) {
      const unselectTag = selectedTags.filter((item) => item.id != tag.id)
      setSelectedTags(unselectTag)
      return
    }
    else {
      setSelectedTags(arr => [...arr, tag])
    }
  }
const getTagIcon = (tagName: string) => {
  switch (tagName?.toLowerCase()) {
    case 'photos':
      return 'image';

    case 'others':
      return 'folder';

    case 'documents':
      return 'description';

    case 'videos':
      return 'videocam';

    case 'music':
      return 'music-note';

    default:
      return 'label';
  }
};

const renderTags = () => {
  return (
    <View style={styles.tagsWrapper}>

      {/* LEFT ICON */}

      <TouchableOpacity
        disabled={selectedTags.length === 0}
        onPress={() => {
          if (selectedTags.length > 0) {
            setSelectedTags([]);
          }
        }}
        style={[
          styles.tagIconContainer,
          {
            backgroundColor: theme.bgContainor,
            // borderColor: selectedTags.length > 0 ? theme.deleteIconColor : theme.borderColor,
          },
        ]}
      >
        {selectedTags.length > 0 ?
        <CustomVectorIcon iconLibrary='Fontisto' 
        iconName='close-a' style={{color:theme.primaryTextColor,fontSize:scaledSize(14)}}/>:
        <CustomVectorIcon iconLibrary='MaterialIcons' 
        iconName='local-offer' style={{color:theme.themeColor}}
        onPress={()=>setSelectedTags([])}
        />
        }
        {/* <AntDesign
          name={selectedTags.length > 0 ? 'clear' : "local-offer"}
          size={22}
          color={selectedTags.length > 0 ? theme.deleteIconColor : theme.themeColor}
        /> */}
      </TouchableOpacity>

      {/* TAGS */}
<FlatList
  horizontal
  data={userTags}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.scrollContent}
  keyExtractor={item => item.id.toString()}
  renderItem={({item}) => {
    const isSelected = selectedTags.some(
      tag => tag.id === item.id,
    );

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => selectTagHandler(item)}
        style={[
          styles.tagChip,
          {
            backgroundColor: theme.bgContainor,
            borderColor: isSelected
              ? theme.themeColor
              : theme.borderColor,
          },
        ]}>
        <MaterialIcons
          name={getTagIcon(item.name)}
          size={18}
          color={
            isSelected
              ? theme.themeColor
              : theme.iconColor
          }
        />

        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.tagText,
            {
              color: theme.primaryTextColor,
            },
          ]}>
          {Utility.string.getFirstLetterCapitalize(
            item.name,
          )}
        </Text>

        <CustomMenu
          Icon={
            <MaterialIcons
              name="more-horiz"
              size={18}
              color={theme.secondaryTextColor}
              style={styles.menuIcon}
            />
          }
          menuOption={[
            {
              label: 'Rename',
              onSelect: () => {
                setTagToRename(item);
                setTagName(item.name);
                setIsShowRenderRenameTagModal(true);
              },
            },
            {
              label: 'Delete',
              onSelect: () => {
                setTagForDeletion(item);
                setIsShowDeleteTagConfirmation(
                  true,
                );
              },
            },
          ]}
        />
      </TouchableOpacity>
    );
  }}
  ListEmptyComponent={<Text style={{alignSelf:'center'}}>No Tags</Text>}
/>

      {/* ACTION */}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (selectedTags.length > 0) {
            setIsShowDeleteMultipleTagsConfirmation(true);
          } else {
            setIsTagModalVisible(true);
          }
        }}
        style={[
          styles.actionButton,
          {
            backgroundColor:
              theme.bgContainor,

            borderColor:
              selectedTags.length > 0 ?
                theme.deleteIconColor :
                theme.borderColor,
          },
        ]}
      >
        <MaterialIcons
          name={
            selectedTags.length > 0
              ? 'delete-outline'
              : 'add'
          }
          size={22}
          color={
            selectedTags.length > 0 ?
              theme.deleteIconColor :
              theme.themeColor}
        />
      </TouchableOpacity>

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scaledSize(10) }}>
            
            <View>
              <Text style={styles.heading}>
                My{' '}
                <Text style={styles.primaryText}>
                  Documents
                </Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={requestCameraPermission}>
            <LinearGradient colors={[theme.buttonBGColor, theme.buttonBGColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadButton}>

              {/* <Ionicons
                name={iconName}
                size={scaledSize(18)}
                color={mode === 'light' ? 'white' : color}
              /> */}
              <Text style={{
                color: theme.iconColor,
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
              placeholderTextColor={theme.primaryTextColor}
              onChangeText={setSearchQuery}
              style={styles.input}
            />
            <Ionicons
              name="close-outline"
              size={26}
              color="#3E4047"
            />
          </View>
          {renderGradientButton('filter', theme.iconColor, () => setIsShowSortModal(true))}
          {renderGradientButton('cloud-upload-outline', theme.iconColor, createBackup)}

        </View>
      </SafeAreaView>
    );
  };
  const getTagByIdHandler = (id: number) => {
    console.log('usertags===', userTags);

    const tag: any = userTags.find(
      (t: any) => t.id === id
    );
    return tag ? tag.name : '';

  }
  const renderParentItem = ({ item }) => {
    const isSelected = checkisFolderSelected(item.id);
    const stats = folderStats[item.id] || { count: 0, size: 0 };
    const sizePercentage = maxFolderSize > 0 ? (stats.size / maxFolderSize) * 100 : 0;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPressItem(item)}
        onLongPress={() => {
          setMultidelete(!isMultiDelete);
          onSelectFolders(item);
        }}
        style={[styles.docCard, isSelected && styles.docCardSelected]}
      >
        <View style={styles.docThumbnailContainer}>
          <Image
            source={{
              uri: Utility.images.getImageUriByOS(
                destinationPath + item?.coverUri,
              ),
            }}
            style={styles.docThumbnail}
            resizeMode="cover"
          />
        </View>

        <View style={styles.docContent}>
          <Text style={styles.docTitle} numberOfLines={1}>
            {Utility.string.getFirstLetterCapitalize(item?.name || '')}
          </Text>

          <View style={styles.docMetadata}>
            <Text style={styles.docMetaText}>{Utility.date.getDateByMomentFormat(item?.createdAt, DateFormat.DATE_WITH_MONTH_NAME)}</Text>
            <Text style={styles.docMetaSeparator}>•</Text>
            <Text style={styles.docMetaText}>{stats.count} files</Text>
            <Text style={styles.docMetaSeparator}>•</Text>
            <Text style={styles.docMetaText}>{getTagByIdHandler(item.tagId)}</Text>
          </View>

          <View style={styles.storageInfo}>
            <View style={styles.storageBar}>
              <LinearGradient
                colors={['#47b16a', '#3CF28A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.storageBarFill, { width: `${sizePercentage}%` }]}
              />
            </View>
            <Text style={styles.storageText}>{formatBytes(stats.size)}</Text>
          </View>
        </View>

        {!isMultiDelete && (
          <View style={styles.docActions}>
            <TouchableOpacity style={styles.actionBtnSquare} onPress={() => shareFile(item)}>
              <Ionicons name="share-social-outline" size={scaledSize(18)} color={theme.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnSquare} onPress={() => {
              setIsFolderNameChange(true);
              setFolderId(item.id);
              setFolderName(item.name);
            }}>
              <Ionicons name="pencil-outline" size={scaledSize(18)} color={theme.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnSquare} onPress={() => deleteFoldersConfirmationForSingleItem(item)}>
              <Ionicons name="trash-outline" size={scaledSize(18)} color={theme.deleteIconColor} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTagBtn = (textStyle?: TextStyle) => {
    return (<TouchableOpacity
      activeOpacity={0.85}
      key={Math.random()}
      // onPress={()=>onPress()}
      onPress={() => setIsTagModalVisible(true)}
      style={styles.addTagButton}
      onLongPress={() => alert('test')}
    >

      <Ionicons
        name="add"
        size={18}
        color={theme.themeColor}
      />

      <Text style={[styles.addTagText, textStyle]}>
        Add Tag
      </Text>
    </TouchableOpacity>)
  }


  const addTagHandler = async () => {
    // error
    console.log('tag', tagName);

    const existingTag = await tagLocalService.getTagByName(tagName)
    console.log('existingTag', existingTag);
    if (tagName.length == 0) {
      setIsShowErrorModal(true)
      setErrorMessage('Tag name is invalid')
      return
    }
    if (existingTag != undefined) {
      setIsShowErrorModal(true)
      setErrorMessage('Tag already exist')
      return
    }


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
    if (!tagName?.trim()) {
      setIsShowErrorModal(true)
      setErrorMessage('Tag name is invalid')
      return
    }

    const existingTagWithName = await tagLocalService.getTagByName(tagName.trim());
    if (existingTagWithName && existingTagWithName.id !== tagToRename?.id) {
      setIsShowErrorModal(true);
      setErrorMessage('A tag with this name already exists.');
      return;
    }

    await tagLocalService.updateTag(tagToRename.id, { name: tagName })
    const tags = await tagLocalService.getTags()
    setUserTags(tags)
    handleCancelRename();
  }

  const handleCancelRename = () => {
    setIsShowRenderRenameTagModal(false);
    setTagName('');
    setTagToRename(null);
  };
  const deleteTagHandler = async () => {
    if (tagForDeletion?.id == undefined) {
      return
    }
    const updatedTags = await tagLocalService.updateTag(tagForDeletion.id, { isDeleted: 1 })
    const tags = await tagLocalService.getTags()
    setTagForDeletion({})
    setUserTags(tags)
    setSelectedTags([])
    setIsShowDeleteTagConfirmation(false)
    setIsTagModalVisible(false)
    setIsShowRenderRenameTagModal(false)
    setIsShowDeleteTagConfirmation(false)
    setTagName('')
  }

  const deleteMultipleTagsHandler = async () => {
    if (selectedTags.length === 0) return;
    try {
      for (const tag of selectedTags) {
        await tagLocalService.updateTag(tag.id, { isDeleted: 1 });
      }
      const tags = await tagLocalService.getTags();
      setUserTags(tags);
      setSelectedTags([]);
      setIsShowDeleteMultipleTagsConfirmation(false);
      CustomSuccessToast(`${selectedTags.length} tag(s) deleted`);
    } catch (error) {
      CustomErrorToast('Failed to delete tags');
    }
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
          handleCancelRename()
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
                    onPress={handleCancelRename}>

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

  const getFiles = () => {
    if (!isLocalDataFetch) {
      return [];
    }

    let filteredData = [...data];

    // search
    if (searchQuery?.length > 0) {
      console.log('in search===');

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
    if (selectedTags.length > 0) {
      console.log('selecteds===', selectedTags);

      filteredData =
        filteredData.filter(
          file =>
            selectedTags.some(tag => tag.id === file.tagId)
        );
    }

    if (selectedSort) {

      // sorting
      filteredData =
        onApplySortHandler(
          selectedSort,
          filteredData,
        );
    }



    return filteredData;
  };

  const createBackup = async () => {
    setIsLoading(true);
    setIsBackupStarted(true);
    setIsBackupCompleted(false);

    try {
      // 1. Get all data from the database
      const folders = await FolderLocalService.getAllFolders();
      const files = await FileLocalService.getAllFiles();
      const tags = await tagLocalService.getTags();

      if (files.length === 0) {
        CustomErrorToast('No documents to backup.');
        setIsLoading(false);
        setIsBackupStarted(false);
        return;
      }

      // 2. Prepare metadata JSON
      const backupData = {
        folders,
        files,
        tags,
        version: 1, // for future migrations
      };

      // 3. Create a temporary directory for zipping
      const tempBackupDir = `${RNFS.CachesDirectoryPath}/backup_${Date.now()}`;
      await RNFS.mkdir(tempBackupDir);

      // 4. Save metadata to a file inside the temp directory
      const metadataPath = `${tempBackupDir}/metadata.json`;
      await RNFS.writeFile(metadataPath, JSON.stringify(backupData), 'utf8');

      // 5. Copy all document files to a 'documents' subfolder in the temp directory
      const documentsSourceDir = CONSTANT.SAVED_DOCUMENTS_PATH;
      const documentsDestDir = `${tempBackupDir}/documents`;
      await RNFS.mkdir(documentsDestDir);

      for (const file of files) {
        const sourcePath = `${documentsSourceDir}${file.name}`;
        const destPath = `${documentsDestDir}/${file.name}`;
        if (await RNFS.exists(sourcePath)) {
          await RNFS.copyFile(sourcePath, destPath);
        }
      }

      // 6. Zip the temporary directory
      const backupFileName = `OneOffice_Backup_${Utility.date.getDateByMomentFormat(new Date(), 'YYYYMMDD_HHmm')}.zip`;
      const finalZipPath = `${RNFS.DownloadDirectoryPath}/${backupFileName}`;

      // Ensure Download directory exists
      await RNFS.mkdir(RNFS.DownloadDirectoryPath);

      // Delete old backup if it exists
      if (await RNFS.exists(finalZipPath)) {
        await RNFS.unlink(finalZipPath);
      }

      await zip(tempBackupDir, finalZipPath);

      // 7. Clean up temporary directory
      await RNFS.unlink(tempBackupDir);

      setIsBackupCompleted(true);
      CustomSuccessToast(`Backup created: ${backupFileName}`);

    } catch (error) {
      console.error('Error creating backup:', error);
      CustomErrorToast('Backup failed. Please try again.');
    } finally {
      // Use a timeout to show the completion animation
      setTimeout(() => {
        setIsLoading(false);
        setIsBackupStarted(false);
        setIsBackupCompleted(true)
      }, 3000);
    }
  };

  const importBackup = async (zipFileUri: string) => {
    if (!zipFileUri) return;
    setIsLoading(true);
    try {
      // 1. Unzip to a temporary directory
      const tempExtractDir = `${RNFS.CachesDirectoryPath}/import_${Date.now()}`;
      await RNFS.mkdir(tempExtractDir);
      await unzip(zipFileUri, tempExtractDir);

      // 2. Read metadata.json
      const metadataPath = `${tempExtractDir}/metadata.json`;
      if (!(await RNFS.exists(metadataPath))) {
        throw new Error('Invalid backup file: metadata.json not found.');
      }
      const metadataContent = await RNFS.readFile(metadataPath, 'utf8');
      const backupData = JSON.parse(metadataContent);

      // 3. Clear existing data
      await FileLocalService.resetFilesTable();
      await FolderLocalService.resetFoldersTable();
      await tagLocalService.resetTagsTable();
      await RNFS.unlink(CONSTANT.SAVED_DOCUMENTS_PATH).catch(() => { }); // delete old docs folder
      await RNFS.mkdir(CONSTANT.SAVED_DOCUMENTS_PATH); // create new empty one

      // 4. Import data into database with ID mapping
      if (backupData.tags && backupData.tags.length > 0) {
        for (const tag of backupData.tags) {
          await tagLocalService.addTag({ name: tag.name, color: tag.color, isDeleted: tag.isDeleted });
        }
      }
      const newTags = await tagLocalService.getTags();
      const oldTagIdToNewTagIdMap = new Map();
      backupData.tags.forEach(oldTag => {
        const newTag = newTags.find(nt => nt.name === oldTag.name);
        if (newTag) {
          oldTagIdToNewTagIdMap.set(oldTag.id, newTag.id);
        }
      });

      if (backupData.folders && backupData.folders.length > 0) {
        for (const folder of backupData.folders) {
          const newTagId = oldTagIdToNewTagIdMap.get(folder.tagId) || null;
          await FolderLocalService.createFolder(folder.userId, folder.name, folder.firebaseId, folder.coverUri, folder.driveFolderId, 0, Date.now(), newTagId);
        }
      }
      const newFolders = await FolderLocalService.getAllFolders();
      const oldFolderIdToNewFolderIdMap = new Map();
      backupData.folders.forEach(oldFolder => {
        const newFolder = newFolders.find(nf => nf.name === oldFolder.name);
        if (newFolder) {
          oldFolderIdToNewFolderIdMap.set(oldFolder.id, newFolder.id);
        }
      });

      if (backupData.files && backupData.files.length > 0) {
        for (const file of backupData.files) {
          const newFolderId = oldFolderIdToNewFolderIdMap.get(file.folderId);
          if (newFolderId) {
            await FileLocalService.createFile({ ...file, id: undefined, folderId: newFolderId, isSynced: 0 });
          }
        }
      }

      // 5. Copy document files from temp extracted folder to app's document folder
      const sourceDocsDir = `${tempExtractDir}/documents`;
      if (await RNFS.exists(sourceDocsDir)) {
        const filesToCopy = await RNFS.readDir(sourceDocsDir);
        for (const file of filesToCopy) {
          await RNFS.copyFile(file.path, `${CONSTANT.SAVED_DOCUMENTS_PATH}${file.name}`);
        }
      }

      // 6. Clean up
      await RNFS.unlink(tempExtractDir);

      // 7. Refresh UI
      const folders = await FolderLocalService.getActiveFolders();
      const files = await FileLocalService.getAllFiles();
      setData(folders);
      setLocalFiles(files);

      CustomSuccessToast('Backup restored successfully!');
    } catch (error) {
      console.error('Error restoring backup:', error);
      CustomErrorToast('Failed to restore backup. The file might be invalid or corrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBackup = async () => {
    try {
      const res = await Utility.images.DocumentPicker({
        isMultipleSelection: false,
        fileTypes: [types.zip],
      });

      if (res && res.length > 0) {
        setIsShowImportConfirmation(true);
        setBackupFileToImport(res[0].uri);
      }
    } catch (error) {
      console.error('Error during backup import:', error);
      CustomErrorToast('Failed to import backup.');
    }
  };

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
        const uri = Utility.images.getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + 'kpo_0.jpg')

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
  const onApplySortHandler = (sortType: string, sorted: any[]) => {

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
        return sorted.sort(
          (a, b) =>
            b.createdAt - a.createdAt,
        );;
    }
    setIsShowSortModal(false)
    // implement filter logic here
  }

  const tags = [
    'Work',
    'Personal',
    'Important',
    'Study',
  ];



  // const renderFolderNameModal = () => {
  //   const tags = [
  //     'Work',
  //     'Personal',
  //     'Important',
  //     'Study',
  //   ];

  //   return (
  //     <Overlay
  //       isVisible={isShowFolderNameModal}
  //       onBackdropPress={() =>
  //         setIsShowFolderNameModal(false)
  //       }
  //       overlayStyle={{
  //         backgroundColor: 'transparent',
  //         padding: 0,
  //         elevation: 0,
  //       }}
  //     >
  //       <View
  //         style={{
  //           width: scaledSize(330),
  //           backgroundColor: '#111216',
  //           borderRadius: scaledSize(30),
  //           padding: scaledSize(24),
  //         }}
  //       >
  //         {/* Header */}

  //         <View
  //           style={{
  //             flexDirection: 'row',
  //             justifyContent:
  //               'space-between',
  //             alignItems: 'center',
  //           }}
  //         >
  //           <Text
  //             style={{
  //               color: 'white',
  //               fontSize: scaledSize(26),
  //               fontFamily:
  //                 FONTS.QuicksandBold,
  //             }}
  //           >
  //             Create Folder
  //           </Text>

  //           <TouchableOpacity
  //             onPress={() =>
  //               setIsShowFolderNameModal(
  //                 false
  //               )
  //             }
  //           >
  //             <MaterialIcons
  //               name="close"
  //               color="#8F9196"
  //               size={30}
  //             />
  //           </TouchableOpacity>
  //         </View>

  //         {/* Input */}

  //         <View
  //           style={{
  //             marginTop: scaledSize(28),
  //             backgroundColor:
  //               '#1C1D22',
  //             borderRadius:
  //               scaledSize(18),
  //             paddingHorizontal:
  //               scaledSize(18),
  //           }}
  //         >
  //           <CustomInputBox
  //             value={folderName}
  //             onChangeText={
  //               setFolderName
  //             }
  //             placeholder="Folder name"
  //             placeholderTextColor="#666"
  //             inputStyle={{
  //               color: 'white',
  //             }}
  //           />
  //         </View>

  //         {/* Tags */}

  //         <Text
  //           style={{
  //             color: '#A2A2A2',
  //             marginTop:
  //               scaledSize(24),
  //             marginBottom:
  //               scaledSize(14),
  //             fontSize:
  //               scaledSize(15),
  //           }}
  //         >
  //           Choose Tag
  //         </Text>

  //         <View
  //           style={{
  //             flexDirection: 'row',
  //             flexWrap: 'wrap',
  //             gap: scaledSize(12),
  //           }}
  //         >
  //           {tags.map(item => (
  //             <TouchableOpacity
  //               key={item}
  //               onPress={() =>
  //                 setSelectedTag(
  //                   item
  //                 )
  //               }
  //               style={{
  //                 paddingHorizontal:
  //                   scaledSize(18),
  //                 paddingVertical:
  //                   scaledSize(12),

  //                 borderRadius:
  //                   scaledSize(999),

  //                 backgroundColor:
  //                   selectedTag ===
  //                   item
  //                     ? COLORS.THEME_COLOR
  //                     : '#1D1F24',
  //               }}
  //             >
  //               <Text
  //                 style={{
  //                   color:
  //                     selectedTag ===
  //                     item
  //                       ? '#fff'
  //                       : '#CFCFCF',
  //                   fontSize:
  //                     scaledSize(
  //                       14
  //                     ),
  //                 }}
  //               >
  //                 {item}
  //               </Text>
  //             </TouchableOpacity>
  //           ))}
  //         </View>

  //         {/* Save */}

  //         <CustomeButton
  //           name="Create"
  //           onPress={() =>
  //             copyFilesToDirectory()
  //           }
  //           buttonStyle={{
  //             marginTop:
  //               scaledSize(28),
  //             height:
  //               scaledSize(56),
  //             borderRadius:
  //               scaledSize(18),
  //             backgroundColor:
  //               COLORS.THEME_COLOR,
  //           }}
  //           textStyle={{
  //             fontSize:
  //               scaledSize(18),
  //             color: 'white',
  //             fontFamily:
  //               FONTS.QuicksandBold,
  //           }}
  //         />
  //       </View>
  //     </Overlay>
  //   );
  // };


  const renderFolderNameModal = () => {
    return (
      <Modal
        // visible={true}
        visible={isShowFolderNameModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsShowFolderNameModal(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalContainer}
          >

            {/* Header */}

            <Text
              style={styles.modalTitle}
            >
              Create Folder
            </Text>

            <Text
              style={
                styles.modalSubtitle
              }
            >
              Enter folder name
              and choose tag
            </Text>

            {/* Folder Input */}

            <View
              style={
                styles.inputContainer
              }
            >
              <TextInput
                value={folderName}
                onChangeText={
                  setFolderName
                }
                placeholder="Folder name"
                placeholderTextColor="#9CA3AF"
                style={
                  styles.modalInput
                }
              />
            </View>

            {/* Tags */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>


              <Text
                style={{
                  color: '#9CA3AF',
                  marginTop: scaledSize(20),
                  marginBottom: scaledSize(12),
                  fontSize: scaledSize(12),
                }}
              >
                Select Tag
              </Text>
              <View style={{ marginTop: scaledSize(4) }}>

                {/* {renderTagBtn({ fontSize: scaledSize(12) })} */}
              </View>
            </View>

            <View
              style={{
                flexDirection:
                  'row',
                flexWrap:
                  'wrap',
              }}
            >
              {userTags.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    setSelectedFolderTag(
                      item
                    )
                  }
                  style={{
                    paddingHorizontal:
                      scaledSize(14),
                    paddingVertical:
                      scaledSize(9),

                    marginRight:
                      scaledSize(9),

                    marginBottom:
                      scaledSize(8),

                    borderRadius:
                      999,

                    backgroundColor:
                      selectedFolderTag.id ===
                        item.id
                        ? theme.themeColor
                        : '#2B2B2B',
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme.primaryTextColor,
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* <TouchableOpacity
              onPress={() =>
                setIsTagModalVisible(
                  true
                )
              }
              style={{
                paddingHorizontal:
                  scaledSize(10),

                paddingVertical:
                  scaledSize(8),

                borderRadius:
                  scaledSize(999),


              }}
            >
              <Text
                style={{
                  color:
                    theme.themeColor,
                }}
              >
                + Add
              </Text>
            </TouchableOpacity> */}
              {/* <View style={{position:'absolute',bottom:scaledSize(40),right:scaledSize(1)}}>
            {renderTagBtn()}
            </View> */}
            </View>

            {/* Buttons */}

            <View
              style={
                styles.modalButtonRow
              }
            >
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={() =>
                  setIsShowFolderNameModal(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cancelButton}
                onPress={scanDocument}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons
                    name="refresh"
                    size={scaledSize(16)}
                    color={theme.primaryTextColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.cancelText}>Rescan</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.renameButton
                }
                onPress={() =>
                  copyFilesToDirectory(

                  )
                }
              >
                <LinearGradient
                  colors={[
                    theme
                      .themeSecondaryColor,
                    theme.themeColor,
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.gradientButton
                  }
                >
                  <Text
                    style={
                      styles.renameText
                    }
                  >
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

  const updateFolderTagHandler = async (tag: any) => {
    console.log('folder===', selectedFolder);
    console.log('tag===', tag);
    if (tag.id == undefined) {
      setIsShowErrorModal(true)
      setErrorMessage('Please select tag')
      return
    }
    await FolderLocalService.updateFolderById({ id: selectedFolder.id, tagId: tag.id })
    const allFolders = await FolderLocalService.getActiveFolders()

    setData(allFolders)

    setIsShowUpdateTagModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTags()}
      <View style={{ height: scaledSize(40), width: scaledSize(100), position: 'absolute', top: scaledSize(142), right: scaledSize(10) }}>
        {/* {renderTagBtn()} */}
      </View>
      <View style={{
        height: scaledSize(40), width: scaledSize(100), position: 'absolute',
        top: scaledSize(150), left: scaledSize(10)
      }}>
        
      </View>



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
              !user ? (
                <View style={styles.backupContainer}>
                  {data.length > 0 ? (
                    <>
                      <Text style={styles.backupInfoText}>
                        Create a local backup of your documents. This does not require a Google account.
                      </Text>
                      <TouchableOpacity style={styles.backupButton} onPress={createBackup}>
                        <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={theme.themeColor} />
                        <Text style={styles.backupButtonText}>Create Backup</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.backupInfoText}>No documents found. You can restore from a previous backup file.</Text>
                      <TouchableOpacity style={styles.backupButton} onPress={handleImportBackup}>
                        <MaterialCommunityIcons name="cloud-download-outline" size={22} color={theme.themeColor} />
                        <Text style={styles.backupButtonText}>Import Backup</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scaledSize(20) }}>
                  <Text style={{ color: theme.secondaryTextColor, fontSize: scaledSize(14), textAlign: 'center' }}>
                    No documents found.
                  </Text>
                  <Text style={{ color: theme.secondaryTextColor, fontSize: scaledSize(14), marginTop: 4, textAlign: 'center' }}>
                    Use the camera button to scan new documents.
                  </Text>
                </View>
              )
            }
          </>

        }

      </View>

      <View style={{
        height: scaledSize(50), position: "absolute", left: scaledSize(270),
        top: heightFromPercentage(72)
      }}>
        <CustomFAB
          style={{ borderWidth: .5, borderColor: theme.iconColor }}
          icon={<Ionicons name='camera-outline' size={scaledSize(24)}
            color={mode === 'light' ? 'white' : theme.iconColor} />}
          onPress={() => { requestCameraPermission() }}
        />
      </View>

      {renderFolderNameModal()}
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
      {/* <CustomSpinner isLoading={isLoading} /> */}

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
      <CustomSortModal
        data={sortOptions}
        isvisible={isShowSortModal}
        onPressClear={() => {
          setIsShowSortModal(false);
          setSelectedSort('');
        }}
        onPressApply={(sort) => { setSelectedSort(sort), setIsShowSortModal(false) }}
        onPressClose={() => setIsShowSortModal(false)}
      />

      <CustomUpdateFolderTagModal
        data={userTags}
        isvisible={isShowUpdateTagModal}
        onPressClear={() => {
          setIsShowUpdateTagModal(false);
          setSelectedSort('');
        }}
        onPressApply={(tag) => updateFolderTagHandler(tag)}
        onPressClose={() => setIsShowUpdateTagModal(false)}
      />
      <CustomErrorMsgModal isVisible={isShowErrorModal}
        onPressClose={() => setIsShowErrorModal(false)} errorMessage={errorMessage} />
      <ConfirmationDialog visible={isShowDeleteTagConfirmation} mode='delete'
        onCancel={() => setIsShowDeleteTagConfirmation(false)}
        onSubmit={() => deleteTagHandler()} />
      <ConfirmationDialog visible={isShowDeleteMultipleTagsConfirmation} mode='delete'
        message={`Are you sure you want to delete ${selectedTags.length} selected tag(s)?`}
        onCancel={() => setIsShowDeleteMultipleTagsConfirmation(false)}
        onSubmit={deleteMultipleTagsHandler}
      />
      <ConfirmationDialog visible={isShowFolderDeleteConfirmation} mode='delete'
        onCancel={() => setIsFolderDeleteConfirmation(false)}
        onSubmit={() => deleteTagHandler()} />
    </SafeAreaView>
  )
}



export default DocumentScan;

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      mode === 'dark' ? '#0E1015' : '#F7F8FA'
  },
  docCard: {
    height: scaledSize(120),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgColor,
    borderRadius: 24,
    marginHorizontal: scaledSize(16),
    marginBottom: scaledSize(12),
    padding: scaledSize(12),
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: mode === 'dark' ? '#000' : '#5A6476',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  docCardSelected: {
    borderColor: '#47b16a',
    shadowColor: '#47b16a',
    shadowOpacity: mode === 'dark' ? 0.5 : 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  docThumbnailContainer: {
    width: scaledSize(70),
    height: scaledSize(70),
    borderRadius: 18,
    overflow: 'hidden',
  },
  docThumbnail: {
    width: '100%',
    height: '100%',
  },
  docContent: {
    flex: 1,
    marginLeft: scaledSize(14),
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: scaledSize(2),
  },
  docTitle: {
    fontSize: scaledSize(15),
    fontWeight: 'bold',
    color: theme.primaryTextColor,
    fontFamily: Fonts.bold,
  },
  docMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaledSize(4),
  },
  docMetaText: {
    fontSize: scaledSize(11),
    color: theme.secondaryTextColor,
    fontFamily: Fonts.regular,
  },
  docMetaSeparator: {
    marginHorizontal: scaledSize(5),
    fontSize: scaledSize(11),
    color: theme.secondaryTextColor,
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  storageBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.buttonBGColor,
    borderRadius: 3,
    marginRight: scaledSize(8),
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  storageText: {
    fontSize: scaledSize(10),
    color: theme.secondaryTextColor,
    fontFamily: Fonts.regular,
  },
  docActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaledSize(8),
    height: '100%',
    marginLeft: scaledSize(10),
  },
  actionBtnSquare: {
    width: scaledSize(30),
    height: scaledSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
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

    color: theme.primaryTextColor,

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
  // tagsWrapper: {
  //   marginTop: scaledSize(20),
  // },




  // tagName: {
  //   marginHorizontal: scaledSize(12),

  //   fontSize: scaledSize(16),

  //   fontWeight: '700',
  // },

  // tagIconContainer: {
  //   width: scaledSize(32),
  //   height: scaledSize(32),

  //   borderRadius: scaledSize(12),

  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },


  // editBtn: {
  //   marginLeft: scaledSize(16),

  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },

  // activeArrow: {
  //   position: 'absolute',

  //   bottom: scaledSize(-8),

  //   alignSelf: 'center',

  //   left: '50%',

  //   marginLeft: scaledSize(-8),

  //   width: scaledSize(16),
  //   height: scaledSize(16),

  //   backgroundColor: theme.themeColor,

  //   transform: [{ rotate: '45deg' }],
  // },

  // addTagButton: {
  //   height: scaledSize(60),

  //   paddingHorizontal: scaledSize(22),

  //   borderRadius: scaledSize(22),

  //   borderWidth: 1.5,

  //   borderStyle: 'dashed',

  //   borderColor: '#D9E1EC',

  //   flexDirection: 'row',

  //   alignItems: 'center',

  //   justifyContent: 'center',

  //   backgroundColor: '#FFFFFF',
  // },

  // addTagText: {
  //   marginLeft: 8,

  //   fontSize: 16,

  //   fontWeight: '700',

  //   color: theme.themeColor,
  // },

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

    color: theme.buttonTextColor,
  },

  // ************* tag btn ****************
  // addTagButton: {
  //   height: scaledSize(40),
  //   paddingHorizontal: scaledSize(14),

  //   borderRadius: scaledSize(12),


  //   borderColor: theme.themeColor,

  //   flexDirection: 'row',

  //   alignItems: 'center',

  //   justifyContent: 'center',


  // },
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

  // clearButton: {
  //   height: 44,

  //   paddingHorizontal: 18,

  //   borderRadius: 12,

  //   justifyContent: 'center',

  //   alignItems: 'center',

  //   backgroundColor:
  //     theme.buttonBGColor,

  //   marginRight: 10,
  // },

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

  // *************** render tags**************


  tagsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaledSize(12),
    paddingHorizontal: scaledSize(12),
  },

  tagIconContainer: {
    width: scaledSize(46),
    height: scaledSize(46),

    borderRadius: scaledSize(16),

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: scaledSize(12),

    borderWidth: 1,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    paddingRight: scaledSize(10),
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',

    height: scaledSize(44),

    paddingLeft: scaledSize(14),
    paddingRight: scaledSize(10),

    borderRadius: scaledSize(20),

    marginRight: scaledSize(10),

    borderWidth: 1,
  },

  tagText: {
    marginLeft: scaledSize(8),

    maxWidth: scaledSize(80),

    fontSize: scaledSize(13),
  },

  menuIcon: {
    marginLeft: scaledSize(6),
  },

  actionButton: {
    width: scaledSize(46),
    height: scaledSize(46),

    borderRadius: scaledSize(16),

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: scaledSize(10),

    borderWidth: 1,
  },

  googleSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scaledSize(52),
    width: '90%',
    alignSelf: 'center',
    backgroundColor: theme.themeColor,
    borderRadius: scaledSize(16),
    paddingHorizontal: scaledSize(24),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  googleSignInButtonPressed: {
    opacity: Platform.OS === 'ios' ? 0.7 : 1,
  },
  googleSignInIcon: {
    width: scaledSize(22),
    height: scaledSize(22),
    marginRight: scaledSize(16),
  },
  googleSignInButtonText: {
    color: '#FFFFFF',
    fontSize: scaledSize(15),
    fontWeight: '500',
    fontFamily: Fonts.regular,
    letterSpacing: 0.5,
  },
  backupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scaledSize(52),
    width: '100%',
    backgroundColor: theme.buttonBGColor,
    borderRadius: scaledSize(16),
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  backupButtonText: {
    color: theme.primaryTextColor,
    fontSize: scaledSize(15),
    fontWeight: '500',
    marginLeft: scaledSize(12),
  },
  backupInfoText: {
    color: theme.secondaryTextColor,
    fontSize: scaledSize(13),
    textAlign: 'center',
    lineHeight: scaledSize(20),
    marginBottom: scaledSize(12),
    paddingHorizontal: scaledSize(10),
  },
});