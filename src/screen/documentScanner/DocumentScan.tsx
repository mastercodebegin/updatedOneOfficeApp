import React, { useState, useEffect, useRef } from 'react'
import { AppState, BackHandler, Dimensions, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import { Button, Overlay } from 'react-native-elements';
import RNFS from 'react-native-fs';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../../utilies/Constants';
import { capitalizeFirstLetter, ConfirmPopup, deleteFile, DocumentPicker, fileShare, fileShareMultiple, generateUniqueNumber, getDate, getImageUriByOS, heightFromPercentage, navigateTo, RNImageToPdf, scaledSize, widthFromPercentage } from '../../utilies/Utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clear, cloud, searchIcon, } from '../../assets/GlobalImages';
import Elevations from 'react-native-elevation'
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
import { getData, getLocalData, removeLocalData, setLocalData } from '../../utilies/storageService';
import { FolderLocalService, resetFoldersTable } from '../../db/folderLocalService';
import { DateHelper } from '../../utilies/DateHelper';
import { FileLocalService } from '../../db/fileLocalService';

const imagesURI = [{
  // Simplest usage.
  url: 'https://avatars2.githubusercontent.com/u/7970947?v=3&s=460',

  // width: number
  // height: number
  // Optional, if you know the image size, you can set the optimization performance
}]
const destinationPath = CONSTANT.SAVED_DOCUMENTS_PATH;

export const DocumentScan = () => {
  const [images, setImages] = useState<Array<any>>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFolderNameChange, setIsFolderNameChange] = React.useState(false);
  const [folderId, setFolderId] = React.useState(0)
  const [isMultiDelete, setMultidelete] = useState(false);
  const [selectedFoldersId, setSelectedFoldersId] = useState<any>([]);
  const [isShowConfirmationModal, setIsConfirmationModal] = useState(false);
  const [isShowFolderNameModal, setIsShowFolderNameModal] = useState(false);
  const [data, setData] = useState<any>([])
  const [folderName, setFolderName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isShowbackupMessage, setIsShowbackupMessage] = useState(false)
  const [isBackupStarted, setIsBackupStarted] = useState(false)
  const [isBackupCompleted, setIsBackupCompleted] = useState(false)
  const [isPermissionDenied, setIsPermissionDenied] = useState(false)
  // const [isPermissionFunctionCalled,setIsPermissionFunctionCalled] = useState(false);
  const isPermissionFunctionCalled = useRef(false); // Use a ref instead of state
  const refForDocShare = useRef<BottomSheetModal>(null);
  const [isLocalDataFetch, setIsLocalDataFetch] = useState(false)

  const isFocused = useIsFocused();


 

  useEffect(() => {
  if (!isFocused) return;

  const fetchData = async () => {
    try {
      const folders = await FolderLocalService.getAllFolders();

      console.log('folders=====', folders);

      setData(folders);

      setIsLocalDataFetch(true);
    } catch (error) {
      console.log('fetch error:', error);
    }
  };

  fetchData();
}, [isFocused]);


   

  const getTestData = () => {
    const d = getLocalData(asyncStorageKeyName.DOCUMENTS)
    console.log('d====', d);


  }

  const deleteAsyncStorage = async () => {
    AsyncStorage.removeItem(asyncStorageKeyName.DOCUMENTS)
    setData([])
  }
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

  // useEffect(() => {
  //   // This will be triggered when Screen A comes into focus

  //   const backHandler = BackHandler.addEventListener("hardwareBackPress",backButtonHandler );
  //   if (isFocused) {
  //     console.log('Screen A is focused');

  //     requestCameraPermission()
  //   }

  //   // Cleanup function to reset the StatusBar when leaving Screen A
  //   return () => {
  //    // backHandler.remove(); // Removes the event listener


  //   };
  // }, [isFocused]);

  const resetDB = async () => {
    resetFoldersTable()
  }

   const getAndCreateFileData = async (isCreate: boolean, name: string) => {
    let finalName = name
    if (isCreate) {
        // file.name,
        // file.path,
        // file.size,
        // file.lastModified,

        console.log('started file created===');
        const obj={name:'p1',size:'20Mb',folderId:1,lastModified:Date.now()}
        const res = await FileLocalService.createFile(obj)
        console.log('file created===', res);
        // if (res) {
        //   const date = DateHelper.getDateByMomentFormat()
        //   console.log('date===', date);
        //   finalName = finalName+'-' + date
        // }
    }

    else {
      const folders = await FileLocalService.getAllFiles()
      console.log('files folders-----', folders);

    }
  }

  const getAndCreateFolderData = async (isCreate: boolean, name: string) => {
    let finalName = name
    if (isCreate) {
      Math.random()
        const res = await FolderLocalService.isFolderExists(name)
        console.log('res===', res);
        if (res) {
          const date = DateHelper.getDateByMomentFormat()
          console.log('date===', date);
          finalName = finalName+'-' + date
        }



      const cname = await FolderLocalService.createFolder(finalName)
      console.log('name===', cname);

    }

    else {
      const folders = await FolderLocalService.getAllFolders()
      console.log(' folders id -----', folders);

    }
  }

  const updateFolderNameHandler = async (name:string,id:number) => {
    const existing=await FolderLocalService.getFolderById(1)
   const update =  await FolderLocalService.updateFolder(id, existing.name,'testuri')
   console.log('updated----',update);
   
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

    // 🔥 Single timestamp for entire operation
    const baseTimestamp = Date.now();

    // 👉 First image (for cover)
    const firstFileName = images[0]?.split('/').pop() || '';
    const firstExtension = firstFileName?.includes('.')
      ? firstFileName.split('.').pop()
      : 'jpg';

    const coverUri = `${baseTimestamp}_0.${firstExtension}`;

    console.log('coverUri:', coverUri);

    // 1. Create folder with cover image
    const folderDisplayName =
      folderName?.length > 0 ? folderName : 'New Folder';

    const folder = await FolderLocalService.createFolder(
      folderDisplayName,
      coverUri
    );

    const folderId = folder.id;
    console.log('folderId:', folderId);

    // 2. Process all images
    for (let i = 0; i < images.length; i++) {
      const uri = images[i];

      const originalFileName = uri.split('/').pop() || '';
      const extension = originalFileName?.includes('.')
        ? originalFileName.split('.').pop()
        : 'jpg';

      // 🔥 Same timestamp used here
      const uniqueName = `${baseTimestamp}_${i}.${extension}`;
      const destinationFilePath = `${destinationPath}/${uniqueName}`;

      console.log('Copying:', uri);
      console.log('Saving as:', destinationFilePath);

      // Copy file
      await RNFS.copyFile(uri, destinationFilePath);

      // Save file in DB
      await FileLocalService.createFile({
        name: uniqueName,
        size: 0, // you can calculate later if needed
        lastModified: Date.now(),
        folderId: folderId,
      });
    }

    console.log('✅ All files copied successfully');
   const updatedFolders= await FolderLocalService.getAllFolders()
   setData(updatedFolders)
    setIsShowFolderNameModal(false)
    setFolderName('')
  } catch (error) {
    console.log('❌ Error in copyFilesToDirectory:', error);
  }
};
const readFilesFromDirectory = async () => {
  try {
    console.log('Reading files from directory: ', destinationPath);

    const files = await RNFS.exists(destinationPath+'1775636794547_0.jpg');

    // if (files.length === 0) {
    //   console.log('❌ No files found');
    //   return;
    // }

    console.log('✅ Files found:', files);

  } catch (error) {
    console.log('Error reading directory:', error);
  }
  // try {
  //   const path = destinationPath

  //   const files = await RNFS.readDir(path);

  //   for (const file of files) {
  //     if (file.isFile()) {
  //       await RNFS.unlink(file.path);
  //     }
  //   }

  //   console.log('All files deleted successfully');
  // } catch (error) {
  //   console.log('Error deleting files:', error);
  // }
};

  const deleteKey = async () => {
    await AsyncStorage.removeItem(asyncStorageKeyName.DOCUMENTS)
  }

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
    setIsFolderNameChange(false);

    let existingFolder = await FolderLocalService.getFolderById(folderId)
    await FolderLocalService.updateFolder(folderId,folderName,existingFolder.coverUri)
    const updatedFolder = await FolderLocalService.getAllFolders()
    console.log();

    // ✅ update UI
    setData(updatedFolder);
    setIsFolderNameChange(false)

  };

  const deleteFolder = async () => {
    const updatedData = [...data]
    updatedData.forEach((item, index) => {
      if (item.id === folderId) {
        updatedData.splice(index, 1)
      }
    })
    setData(updatedData)
    await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, JSON.stringify(updatedData))
  }
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

    console.log('Files to delete:', files);

    // 2. Delete files from storage
    // await Promise.all(
    //   files.map(async (file:any) => {
    //     const path = `${destinationPath}${file.name}`;
    //     const exists = await RNFS.exists(path);

    //     if (exists) {
    //       await RNFS.unlink(path);
    //     }
    //   })
    // );

    // 3. Delete files from DB
    await FolderLocalService.deleteFoldersWithFiles([obj.id])
    const updatedData=await FolderLocalService.getAllFolders()
   
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
      navigateTo('DisplayMultipleDocumentImage', {folderName:item.name,folderId:item.id,files:files})
console.log('files=======',files);

    }
  }

  const shareFile = async (item: Array<any>) => {
    console.log('item', item);

    let data = []
    // for (let i = 0; i < item.files.length; i++) {
    const folderFiles = item.files.map(element => ({
      path: element.path
    }));

    data = [...data, ...folderFiles]; // Accumulate file paths from all folders



    console.log('data', data);
    refForDocShare.current?.close()
    await fileShareMultiple(data)



  }

  const readDirectory=()=>{
    readFilesFromDirectory

  }
  const renderParentItem = ({ item }) => {
    console.log('parent-item', item);

    const isSelected = checkisFolderSelected(item.id);
    const isEditable = checkIsEditable(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPressItem(item)}
        onLongPress={() => {
          setMultidelete(!isMultiDelete);
          onSelectFolders(item);
        }}
        style={[
          styles.card,
          {
            backgroundColor: isSelected ? '#E6F7F5' : '#FFFFFF',
            borderWidth: isSelected ? 1 : 0,
            borderColor: isSelected ? '#2FB2A2' : 'transparent',
          },
        ]}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: getImageUriByOS(destinationPath+item?.coverUri) }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!isEditable ? (
            <>
              <Text style={styles.title} numberOfLines={1}>
                {capitalizeFirstLetter(item?.name || '')}
              </Text>
              <Text style={styles.date}>{getDate(item?.createdAt)}</Text>
            </>
          ) : (
            <>
              <CustomInputBox
                value={capitalizeFirstLetter(item?.name || '')}
                onChangeText={setFolderName}
                isEditable={true}
              />
              <Text style={styles.date}>{getDate(item?.date)}</Text>
            </>
          )}
        </View>

        {/* Actions */}
        {!isMultiDelete && (
          <View style={styles.actionColumn}>
            {!isEditable ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setIsFolderNameChange(true);
                    setFolderId(item.id);
                  }}
                >
                  <MaterialIcons name="edit" size={18} color="#209DA1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    deleteFoldersConfirmationForSingleItem(item)
                  }
                >
                  <MaterialIcons name="delete" size={18} color="#E4003A" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    deleteFoldersConfirmationForSingleItem(item)
                  }
                >
                  <MaterialIcons name="reset" size={18} color="green" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => shareFile(item)}
                >
                  <Ionicons
                    name="share-outline"
                    size={18}
                    color="#209DA1"
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={renameFolder}
                >
                  <Ionicons
                    name="checkmark-sharp"
                    size={20}
                    color="#209DA1"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsFolderNameChange(false)}
                >
                  <MaterialIcons name="close" size={18} color="#999" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getFiles = () => {
    // getting search value from dashboard and filtering it
    console.log('data getFiles======', data);
    if (isLocalDataFetch) {

      if (searchQuery.length > 0) {
        return data.filter(file =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // return []
        console.log('log==', data.folders);

        return data;
      }
    }
    else {
      console.log('returned------', data);

      return []
    }
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
    try {
      const res = await DocumentPicker.pickSingle({
        copyTo: 'cachesDirectory',
        type: [DocumentPicker.types.zip,]
      })
      // console.log('response-----', res);
      // i want a file extension
      const fileExtension = res.name.split('.').pop()
      console.log('fileExtension--------------', res);
      console.log('fileExtension--------------', fileExtension);
      importBackup(res)


    }
    catch (error) {
      console.log('openFile error-----', error);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{
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
                onChangeText={(value) => setSearchQuery(value)}
                // placeholderTextColor="#d5d5d5"
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
              <MaterialCommunityIcons name='cloud-upload-outline' size={scaledSize(24)} color={'white'} onPress={() => setIsShowbackupMessage(true)} />
            </View>
          </LinearGradient>
        }

      </View>
      {/* ----------------------------- */}
      <View style={{ flex: 1, marginTop: heightFromPercentage(0.5) }}>
        {getFiles().length > 0 ? <FlatList
          showsVerticalScrollIndicator={false}
          data={getFiles()}
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

      <View style={{
        height: scaledSize(50), position: "absolute", left: scaledSize(270),
        top: heightFromPercentage(72)
      }}>
        <CustomFAB
          icon={<Ionicons name='camera-outline' size={scaledSize(24)} color={'white'} />}
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
              <TouchableOpacity onPress={() => { setIsShowFolderNameModal(false), copyFilesToDirectory() }}>
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


        <Image source={{ uri:  destinationPath+'1775636939365_0.jpg' }} style={{ height: 100, width: 100, }} />
        <View style={{ height: scaledSize(50), width: 50, flexDirection: 'row', margin: 20 }}>

          <CustomeButton onPress={() => readFilesFromDirectory()} name={'Read'}
            buttonStyle={{ backgroundColor: 'blue', borderWidth: .3 }} textStyle={{ color: 'white' }} />
        </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ height: scaledSize(50), width: 50, flexDirection: 'row', margin: 20 }}>

          <CustomeButton onPress={() => getAndCreateFileData(true, 'jolo')} name={'Insert'}
            buttonStyle={{ backgroundColor: 'blue', borderWidth: .3 }} textStyle={{ color: 'white' }} />
        </View>
        <View style={{ height: scaledSize(50), width: 50, margin: 20 }}>
          <CustomeButton onPress={() => getAndCreateFileData(false, '')} name={'Get '} buttonStyle={{ backgroundColor: 'green' }} textStyle={{ color: 'white' }} />
        </View>
        <View style={{ height: scaledSize(50), width: 60, margin: 20 }}>
          <CustomeButton onPress={() => updateFolderNameHandler('ayan',1)} name={'Update '} 
          buttonStyle={{ backgroundColor: 'green' }} textStyle={{ color: 'white' }} />
        </View>
        <View style={{ height: scaledSize(50), width: 50, margin: 20 }}>
          <CustomeButton onPress={() => FileLocalService.resetFilesTable()} name={'Reset-file'}
            buttonStyle={{ backgroundColor: 'red' }} textStyle={{ color: 'white' }} />
        </View>
        <Image source={{ uri: getImageUriByOS(destinationPath+'1775636794547_0.jpg') }} style={{ height: 30, width: 30 }} />
        {/* <CustomBannerAdd onPressAddClose={()=>getTestData()} /> */}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ height: scaledSize(50), width: 50, flexDirection: 'row', margin: 20 }}>

          <CustomeButton onPress={() => getAndCreateFolderData(true, 'jolo')} name={'Insert'}
            buttonStyle={{ backgroundColor: 'blue', borderWidth: .3 }} textStyle={{ color: 'white' }} />
        </View>
        <View style={{ height: scaledSize(50), width: 50, margin: 20 }}>
          <CustomeButton onPress={() => getAndCreateFolderData(false, '')} name={'Get '} buttonStyle={{ backgroundColor: 'green' }} textStyle={{ color: 'white' }} />
        </View>
        <View style={{ height: scaledSize(50), width: 60, margin: 20 }}>
          <CustomeButton onPress={() => updateFolderNameHandler('ayan',1)} name={'Update '} 
          buttonStyle={{ backgroundColor: 'green' }} textStyle={{ color: 'white' }} />
        </View>
        <View style={{ height: scaledSize(50), width: 50, margin: 20 }}>
          <CustomeButton onPress={() => resetFoldersTable()} name={'Reset'}
            buttonStyle={{ backgroundColor: 'red' }} textStyle={{ color: 'white' }} />
        </View>
        {/* <CustomBannerAdd onPressAddClose={()=>getTestData()} /> */}
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
    </SafeAreaView>
  )
}

export default DocumentScan;

const styles = StyleSheet.create({
  shareOptionS: {
    height: scaledSize(40), backgroundColor: 'white',
    width: '100%', flexDirection: 'row', borderRadius: scaledSize(10),
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: scaledSize(16),
    marginTop: scaledSize(14),
    padding: scaledSize(8),
    borderRadius: scaledSize(16),
    alignItems: 'center',

    elevation: 4,
  },

  thumbnailWrapper: {
    width: scaledSize(80),
    height: scaledSize(80),
    borderRadius: scaledSize(14),
    overflow: 'hidden',
    backgroundColor: '#F3F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    marginLeft: scaledSize(16),
    justifyContent: 'center',
  },

  title: {
    fontSize: scaledSize(14),
    // fontWeight: '600',
    color: '#1F1F1F',
    letterSpacing: 1,
    // fontFamily:Fonts.regular
  },

  date: {
    marginTop: scaledSize(6),
    fontSize: scaledSize(14),
    color: '#8A8A8A',
  },

  actionColumn: {
    justifyContent: 'space-between',
    height: heightFromPercentage(12),
  },

  actionButton: {
    width: scaledSize(28),
    height: scaledSize(28),
    borderRadius: scaledSize(18),
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
