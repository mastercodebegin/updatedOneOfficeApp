import React, { useState, useEffect, useRef } from 'react'
import { AppState, BackHandler, Dimensions, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import { Button, Overlay } from 'react-native-elements';
import RNFS from 'react-native-fs';
import { asyncStorageKeyName, CONSTANT } from '../../utilies/Constants';
import { capitalizeFirstLetter, ConfirmPopup, deleteFile, DocumentPicker, fileShare, fileShareMultiple, generateUniqueNumber, getDate, heightFromPercentage, navigateTo, RNImageToPdf, scaledSize, widthFromPercentage } from '../../utilies/Utilities';
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

const imagesURI = [{
  // Simplest usage.
  url: 'https://avatars2.githubusercontent.com/u/7970947?v=3&s=460',

  // width: number
  // height: number
  // Optional, if you know the image size, you can set the optimization performance
}]
const destinationPath = CONSTANT.SAVED_DOCUMENTS_PATH;

export const DocumentScan = () => {
  const [images, setImages] = useState<Array<{ name: string }>>();
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


  // useEffect(() => {
  //   if (isFocused) {
  //     console.log('is focused',);
  //     AsyncStorage.getItem(asyncStorageKeyName.DOCUMENTS).then((value) => {
  //       if (value) {
  //         setData(JSON.parse(value));
  //       }
  //     });

  //   }
  // }, [isFocused])
  useEffect(() => {
    if (!isFocused) return;
    if (isLocalDataFetch == false) {


      let localData = getLocalData(asyncStorageKeyName.DOCUMENTS) || {}
      // 🔥 normalize safely
      localData.folders = Array.isArray(localData.folders) ? localData.folders : [];
      localData.photos = Array.isArray(localData.photos) ? localData.photos : [];
      console.log('data=====', localData);
      setData(localData)
      setIsLocalDataFetch(true)
    }



    // const loadData = async () => {
    //   try {
    //     console.log('is focused');

    //     const value = await AsyncStorage.getItem(
    //       asyncStorageKeyName.DOCUMENTS
    //     );

    //     if (value) {
    //       setData(JSON.parse(value));
    //     } else {
    //       setData([]);
    //     }
    //   } catch (error) {
    //     console.log('AsyncStorage error:', error);
    //   }
    // };

    // loadData();
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
      //copyFilesToDirectory(scannedImages)
    }
  }

  const copyFilesToDirectory = async () => {
    try {
      console.log('scannedimages', images);

      await RNFS.mkdir(destinationPath);

      // 1. Get existing data (MMKV - sync)
      let data = getLocalData(asyncStorageKeyName.DOCUMENTS) || {}

      // 🔥 normalize safely
      data.folders = Array.isArray(data.folders) ? data.folders : [];
      data.photos = Array.isArray(data.photos) ? data.photos : [];
      console.log('data=====', data);


      // 2. Create new folder
      const folderId = Date.now().toString();
      console.log('fo;derid', folderId);

      const folderDisplayName =
        folderName.length > 0 ? folderName : 'New Folder';

      const newFolder = {
        id: folderId,
        name: folderDisplayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoCount: images.length,
        thumbnailId: null,
        previewUri: images[0],
        isDeleted: false,
        isSynced: false // optional (for folder sync)
      };

      data.folders.push(newFolder);

      // 3. Process images
      const newPhotos = [];

      for (let i = 0; i < images.length; i++) {
        const uri = images[i];

        const fileName = uri.split('/').pop();
        const extension = fileName.split('.').pop();

        const uniqueName = `${Date.now()}_${i}.${extension}`;
        const destinationFilePath = `${destinationPath}/${uniqueName}`;

        // Copy file
        console.log('copy uri', uri);

        await RNFS.copyFile(uri, destinationFilePath);

        const photoId = `${Date.now()}_${i}`;

        newPhotos.push({
          id: photoId,
          folderId,
          fileId: null,
          thumbnailId: null,
          localPath: `file://${destinationFilePath}`,
          createdAt: new Date().toISOString(),
          isDeleted: false,
          isSynced: false // 🔥 important
        });
      }

      // 4. Add photos to global list
      data.photos = [...data.photos, ...newPhotos];

      // 5. Save once (MMKV sync)
      setLocalData(asyncStorageKeyName.DOCUMENTS, data);

      // 6. Update UI
      setData(data); // your React state
      setIsShowFolderNameModal(false);
      setFolderName('');

      console.log('All files copied successfully!');
    } catch (error) {
      console.log('Error in copyFilesToDirectory:', error);
    }
  };

  const readFilesFromDirectory = async () => {
    // const directoryPath = `/storage/emulated/0/Android/data/${CONSTANT.PACKAGE_NAME}/files/`;
    console.log('Reading files from directory: ', destinationPath);



    // List the files in the directory
    const filesStr = await AsyncStorage.getItem(asyncStorageKeyName.DOCUMENTS); // returns an array of file objects
    console.log('filesStr', filesStr);
    let filesObject = [];
    if (filesStr != null) {
      console.log('if', filesStr);
      filesObject = JSON.parse(filesStr)
    }
    else {
      await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, '[]')
    }
    console.log('filesObject', filesObject);

    setData(filesObject)
    console.log('All files read successfully!');
    return filesObject


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

  const updatedFolders = data.folders.map(item => {
    console.log('itemid b',item.id);
    console.log('folderId b',folderId);
    console.log('folderName b',folderName);
    if (item.id === folderId) {
      console.log('itemid',item.id);
      console.log('folderId',folderId);
      console.log('folderName',folderName);
      
      return {
        ...item,
        name: folderName, // ✅ immutable update
      };
    }
    return item;
  });

  const newData = {
    ...data,
    folders: updatedFolders,
  };
console.log();

  // ✅ update UI
  setData(newData);

  // ✅ persist
  setLocalData(asyncStorageKeyName.DOCUMENTS,newData)
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

    console.log('obj------', obj.id);
    console.log('before', data.folders);
    const updatedData = data.folders.filter(item => item.id !== obj.id);
    console.log('after==========', updatedData);


    // update state
    setData(prev => ({
      ...prev,
      folders: updatedData,
    }));
    const temp = {
      ...data,
      folders: updatedData,
    };
    console.log('data folder', data);

    const photos = data.photos.find(item => item.folderId === obj.id);
    console.log('folders---', photos);

    photos || []; // or folder?.photos

    deleteFilesFromFolder(photos)
    setLocalData(asyncStorageKeyName.DOCUMENTS, temp)

    setSelectedFoldersId([])
    setMultidelete(false)
  }

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
  const onPressItem = (item) => {

    if (isMultiDelete) {
      onSelectFolders(item)
    }
    else {
      const obj = data.find((v) => v.id === item.id)
      // console.log('found', obj);
      const selectedFolder: any = { id: obj.id, folderName: obj.folderName, files: obj.files }
      // console.log(selectedFolder);

      navigateTo('DisplayMultipleDocumentImage', selectedFolder)
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
            source={{ uri: item?.previewUri }}
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
        return data.folders.filter(file =>
          file.folderName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // return []
        console.log('log==',data.folders);
        
        return data.folders;
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



      <View style={{ height: scaledSize(50), width: 50 }}>

        <CustomeButton onPress={() => getTestData()} name={'test----'} />
        <CustomeButton onPress={() => removeLocalData(asyncStorageKeyName.DOCUMENTS)} name={'delete'} buttonStyle={{ backgroundColor: 'red' }} />

        <Image source={{ uri: 'file:///data/user/0/com.shopax.pdfviewer/cache/mlkit_docscan_ui_client/278162982496889.jpg' }} style={{ height: 30, width: 30 }} />
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
