import { View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView, BackHandler, StyleSheet, StatusBar, TextInput, Animated } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { mediumBG, MSExcel, MSOffice, MSPowerPoint, smallBG } from '../../assets/GlobalImages'
import { asyncStorageKeyName, CONSTANT } from '../../utilies/Constants'
import {  deleteFile, fileShareMultiple, heightFromPercentage, scaledSize, Utility } from '../../utilies/Utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { COLORS, FONTS } from '../../utilies/GlobalColors';
import { Overlay } from 'react-native-elements';
// import i from '../../assets/images/microsoft-word.png'
import { Image as RNImage } from 'react-native'; // Use React Native's Image component to resolve the URI
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { Modal, Switch } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CustomeButton from '../../component/CustomButton';
import CustomInputBox from '../../component/CustomInputBox';
import RNFS from 'react-native-fs';
import DocumentScanner from 'react-native-document-scanner-plugin'
import ImageViewer from 'react-native-image-zoom-viewer';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import CustomLinearGradientView from '../../component/CustomLinearGradientView';
import LinearGradient from 'react-native-linear-gradient';
import EditImage from '../imageEditor/EditImage';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import CustomBottomSheet from '../../component/CustomBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CustomErrorToast } from '../../component/CustomToast';
import { FileLocalService } from '../../db/fileLocalService';
import { FolderLocalService } from '../../db/folderLocalService';
import { useTheme } from '../theme/useTheme';
import { Theme } from '../theme/ThemeConfig';
import ConfirmationDialog from '../../component/ConfirmationDialog';
import CustomRenameModal from '../../component/CustomRenameModal';
import CustomErrorMsgModal from '../../component/CustomErrorMsgModal';
import CustomImagesViewSlider from '../../component/CustomImagesViewSlider';
import CustomFAB from '../../component/CustomFAB';
import CustomSortModal from '../../component/CustomSortModal';

export default function DisplayMultipleDocumentImage(props: any) {

  const [scannedImage, setScannedImage] = useState();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFolderNameChange, setIsFolderNameChange] = React.useState(false);
  const [existingFile, setExistingFile] = React.useState()
  const [isMultiDelete, setMultidelete] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<any>([]);
  const [isShowConfirmationModal, setIsConfirmationModal] = useState(false);
  const [isShowImageView, setIsImageView] = useState(false)
  const [imagePath, setImagePath] = useState('')
  const [data, setData] = useState([])
  const [images, setImages] = useState<Array<{ name: string }>>();
  const [imageUrls, setImageUrls] = useState([]);
  const [fileName, setFileName] = useState('')
  const [isShowFileNameModal, setIsShowFileNameModal] = useState(false);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNewFile, setIsNewFile] = useState(false);
  const [isShowEditImage, setIsShowEditImage] = useState(false);
  const [isShowDeleteImageConfirmation, setIsShowDeleteImageConfirmation] = useState(false);
  const [folderName, setFolderName] = useState('')
  const [editImageUri, setEditImageUri] = useState('')
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('grid')
  const [isShowSortModal, setIsShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState('latest')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const destinationPath = `/storage/emulated/0/Android/data/${CONSTANT.PACKAGE_NAME}/documents/`;
  const itemId = props.route.params.id
  const refForDocShare = useRef<BottomSheetModal>(null);
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const { theme, mode, toggleTheme } = useTheme()
  const { folderId } = props.route.params

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
  useEffect(() => {
    console.log('props',);
    if (data.length == 0) {

      setData(props.route.params.files)
      setFolderName(props.route.params.folderName)
    }
  },)

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme, mode])

  useEffect(() => {
    // This will be triggered when Screen A comes into focus

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      console.log('back press');

      setIsImageView(false);
      return true
    });


    return () => {
      backHandler.remove();
    };
  },);


  const renameFolder = async () => {
    console.log('rename file====');

    if (fileName.length == 0) {
      setIsShowErrorModal(true)
      setErrorMessage('Please enter a valid file name')
      return false
    }
    console.log('existing file', existingFile);

    let existingFileTemp = await FileLocalService.getFileById(existingFile.id)
    console.log('existingFileTemp', existingFileTemp);

    existingFileTemp.displayName = fileName + '.jpg'
    await FileLocalService.renameFile(existingFile.id, existingFileTemp)
    console.log('updateFile');
    const updatedFolder = await FileLocalService.getFilesByFolder(existingFileTemp.folderId)
    setData(updatedFolder)

    setIsShowFileNameModal(false)
    setIsNewFile(false)
    setFileName('')

  }

  const deleteMultipleFolder = async () => {
    const updatedData = [...data]
    console.log('data------', updatedData.map((it: any) => it.id));
    console.log('selected images------', selectedFileIds.map((it: any) => it.id));
    console.log('length', selectedFileIds.length);
    console.log('length', data.length);


    const dataStr = await AsyncStorage.getItem(asyncStorageKeyName.DOCUMENTS)
    const docsArr = JSON.parse(dataStr)
    const removedDeletedFiles = updatedData.filter((item: any) => !selectedFileIds.some((i: any) => item.id == i.id))
    console.log('removedDeletedFiles images------', removedDeletedFiles.map((it: any) => it.id));
    // console.log('removedDeletedFiles================================================================', removedDeletedFiles);
    console.log('docsObject================================================================', docsArr);

    const singleObj = docsArr.find((item: any) => item.id === itemId)
    console.log('singleObj all images------', singleObj.files.map((it: any) => it.id));
    singleObj.files = removedDeletedFiles
    console.log('updated single obj images------', singleObj.files.map((it: any) => it.id));



    const filterObjects = docsArr.filter((item: any) => item.id !== itemId)
    console.log('filterObjects================================================================', filterObjects);
    console.log('obj 2================================================================', JSON.stringify(filterObjects));

    if (data.length == selectedFileIds.length) {
      console.log('selectedFileIds.length', selectedFileIds.length);
      console.log('data.length', data.length);
      setSelectedFileIds([])
      await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, JSON.stringify(filterObjects))
      Utility.navigation.navigateToBack()
    }
    if (data.length != selectedFileIds.length) {
      filterObjects.push(singleObj)
      console.log('if(data.length== not equel', filterObjects[0].files);
      setData(singleObj.files)
      // i think we have to update params or docs Arr is not being updated on dashboard
      await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, JSON.stringify(filterObjects))
      setSelectedFileIds([])
    }
    try {
      for (const filePath of selectedFileIds) {
        //deleteFile(filePath)
      }
      console.log('Files deleted successfully!');
    } catch (error) {
      console.error('Error deleting files:', error);
    }
    setMultidelete(false)

  }



  const deleteSingleFile = async (obj: any) => {
    try {
      console.log('Deleting folder:', obj.id);
      selectedFileIds

      // 1. Get all files of this folder
      // const files = data.photos.filter((item:any) => item.folderId === obj.id);
      const files = await FileLocalService.getFilesByIds([obj.id])

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
      await FileLocalService.deleteFile(obj.id)
      const updatedFiles = await FileLocalService.getFilesByFolder(folderId)
      console.log('updatedFiles----', updatedFiles);

      // if (updatedFiles.length == 0) {
      //   const files = await FileLocalService.getFilesByFolder(obj.id)

      //   console.log('Files to delete:', files);



      //   // 3. Delete files from DB
      //   await FolderLocalService.deleteFoldersWithFiles([folderId])
      //   const updatedData = await FolderLocalService.getAllFolders()
      //   navigateToBack()

      // }

      setData(updatedFiles);



      // Reset UI states
      setSelectedFileIds([]);
      setMultidelete(false);

      console.log('✅ Folder deleted successfully');
    } catch (error) {
      console.log('❌ Error deleting folder:', error);
    }
  };




  const closeDeleteConfirmation = () => {
    setIsShowDeleteImageConfirmation(false)

    if (!isMultiDelete) {
      setSelectedFileIds([])
    }
  }

  const submitDeleteConfirmation = () => {
    setIsShowDeleteImageConfirmation(false)
    deleteMultipleFolder()
  }

  const checkisFolderSelected = (id: number) => {
    // console.log('selectedfolder', selectedFileIds);

    return selectedFileIds.find(item => item.id === id)
  }

  const onSelectFolders = (item: any) => {
    // handling to show select or unselect folder checking id
    //  if does exist so removing if not then adding
    if (checkisFolderSelected(item.id)) {
      setSelectedFileIds(selectedFileIds.filter(selectfolderId => selectfolderId.id != item.id))
    }
    else {
      setSelectedFileIds([...selectedFileIds, item])
    }

  }


  const onPressSelectAll = () => {
    if (selectedFileIds.length == data.length) {
      setSelectedFileIds([])
    }
    else {
      setSelectedFileIds(data.map(item => item))
    }
  }
  const onPressItem = async (item: any) => {

    if (isMultiDelete) {
      onSelectFolders(item)
    }
    else {
      const filter = data.filter(v => v.id !== item.id)
      setImageUrls([item, ...filter]);
      setIsImageView(true)
      setFileName(item.name)
      setImagePath(item.path)
    }
  }
  const onLongPressItem = (item: any) => {
    setMultidelete(true)
    // setting imageurl if image view open accidently while longpress
    setImageUrls(data)
    onSelectFolders(item)
 
  }
  // const copyFilesToDirectory = async () => {
  //   console.log('folderName', folderName);
  //   console.log('scannedimages', folderName.length);
  //   if (fileName.length == 0) {
  //     CustomErrorToast('Please enter File name')
  //     return
  //   }
  //   // Create the destination folder if it doesn't exist
  //   await RNFS.mkdir(destinationPath);

  //   // Loop through the URIs and copy them to the destination
  //   await Promise.all(images.map(async (uri: any, index) => {
  //     console.log('file name=======', fileName);

  //     const name = uri.split('/').pop(); // Extract the file name
  //     const defaultFileName = name.split('.').slice(0, -1).join('.');
  //     console.log('defaultFileName=======', defaultFileName);

  //     const n = uri.split('/').pop(); // Extract the file name
  //     console.log('file n=======', n);
  //     // const [defaultFileName, fileExtension] = fullFileName.split('.');
  //     const destinationFilePath = `${destinationPath}${defaultFileName}`;

  //     await RNFS.copyFile(uri, destinationFilePath);
  //     // const localStoredData = await readFilesFromDirectory()
  //     const localStoredData = await AsyncStorage.getItem(asyncStorageKeyName.DOCUMENTS); // returns an array of file objects

  //     // console.log('files length ---', data.length)

  //     const filesArr = []
  //     for (let i = 0; i < images.length; i++) {

  //       filesArr.push({
  //         id: generateUniqueNumber(),
  //         name: fileName.length > 0 ? `${fileName}` : defaultFileName,
  //         path: destinationFilePath,
  //         mtime: new Date(),
  //         type: 'file',
  //         extension: fileName.split('.').pop(),
  //         size: 0,
  //       })
  //       console.log('arr--------------------------------', filesArr)
  //     }
  //     const combinedFiles = [...data, ...filesArr]
  //     const objParse = JSON.parse(localStoredData)
  //     // console.log(' props.route.params.id ==========', props.route.params.id);
  //     // console.log(' converted objParse==========', objParse);
  //     // console.log('props.route.param.id==========', props.route?.params?.id);
  //     console.log('combinedFiles====', combinedFiles);
  //     const objectsNotEquelToID = objParse.filter((obj) => obj.id !== props.route.params.id)
  //     console.log('objectsNotEquelToID', objectsNotEquelToID);
  //     const objectEquelToId = objParse.find((obj) => obj.id == props.route.params.id)
  //     objectEquelToId.files = combinedFiles
  //     const objIndex = objParse.findIndex((obj) => obj.id == props.route.params.id);
  //     console.log('objindex', objIndex);
  //     objParse.splice(objIndex, 1, objectEquelToId)
  //     console.log('objParse', objParse);


  //     await AsyncStorage.setItem(asyncStorageKeyName.DOCUMENTS, JSON.stringify(objParse))
  //     console.log(`File ${index + 1} copied to ${destinationFilePath}`);
  //     setData(combinedFiles)
  //     setIsShowFileNameModal(false)
  //     setFileName('')
  //     setIsNewFile(false)


  //   }));

  //   console.log('All files copied successfully!');
  //   //readFilesFromDirectory()

  // };

  const copyFilesToDirectory = async () => {
    if (fileName.length == 0) {
      setIsShowErrorModal(true)
      setErrorMessage('Please enter a valid file name')
      return false
    }
    try {
      console.log('scanned images:', images);

      await RNFS.mkdir(destinationPath);

      const baseTimestamp = Date.now();

      for (let i = 0; i < images.length; i++) {
        const uri = images[i];

        const originalFileName = uri.split('/').pop() || '';
        const extension = originalFileName?.includes('.')
          ? originalFileName.split('.').pop()
          : 'jpg';

        // 👉 user provided name OR fallback
        let baseName = fileName?.trim()
          ? fileName.trim()
          : `${baseTimestamp}`;

        let displayName = `${baseName}`;
        console.log('display name', displayName);

        let finalName = `${baseName + "_" + Date.now()}.${extension}`;
        let destinationFilePath = `${destinationPath}/${finalName}`;

        // ✅ if already exists → add random
        while (await RNFS.exists(destinationFilePath)) {
          const random = Math.random().toString(36).slice(2, 6);
          finalName = `${baseName}_${random}.${extension}`;
          destinationFilePath = `${destinationPath}/${finalName}`;
        }

        console.log('Saving uri:', uri);
        console.log('Saving as:', finalName);

        await RNFS.copyFile(uri, destinationFilePath);

        const createdFile = await FileLocalService.createFile({
          name: finalName,
          displayName: displayName,
          size: 0,
          lastModified: Date.now(),
          folderId: folderId,
          isSynced: 0,
          isDeleted: 0,
          folderFirebaseId: '',
        });
        console.log('createdFile====', createdFile);
      }


      const files = await FileLocalService.getFilesByFolder(folderId);
      setData(files);

      setIsShowFileNameModal(false);
      setFileName('')
      console.log('✅ Files saved successfully');

    } catch (error) {
      console.log('❌ Error:', error);
    }
  };

  const onPressEditFile = (item: any) => {
    console.log('onpress edit ', isNewFile);

    setExistingFile(item),
      setIsNewFile(false)

    setFileName(item.displayName?.replace('.jpg', '')
    )
    setIsShowFileNameModal(true)
  }

  const onPressEditImage = (item: any) => {
    setIsShowEditImage(true)
    setEditImageUri(item.path)
  }

  const getFileDateLabel = (item: any) => {
    const dateValue = item?.createdAt || item?.lastModified || item?.updatedAt;

    if (!dateValue) {
      return '';
    }

    return Utility.date.getDateByMomentFormat(new Date(dateValue) as any, 'DD MMM YYYY');
  }

  const getFileTitle = (item: any) => {
    const title = item?.displayName || item?.name || '';
    return Utility.string.getFirstLetterCapitalize(title)?.replace(/\.[^/.]+$/, '');
  }

  const getFileTime = (item: any) => {
    return item?.createdAt || item?.lastModified || item?.updatedAt || 0;
  }

  const getSortedFiles = () => {
    let sorted = [...data];

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();

      sorted = sorted.filter((item: any) =>
        getFileTitle(item).toLowerCase().includes(query)
      );
    }

    switch (selectedSort) {
      case 'oldest':
        return sorted.sort((a: any, b: any) => getFileTime(a) - getFileTime(b));

      case 'name_asc':
        return sorted.sort((a: any, b: any) => getFileTitle(a).localeCompare(getFileTitle(b)));

      case 'name_desc':
        return sorted.sort((a: any, b: any) => getFileTitle(b).localeCompare(getFileTitle(a)));

      case 'latest':
      default:
        return sorted.sort((a: any, b: any) => getFileTime(b) - getFileTime(a));
    }
  }

  const toggleLayoutMode = () => {
    setLayoutMode(layoutMode === 'list' ? 'grid' : 'list')
  }

  const openSearch = () => {
    setIsSearchVisible(true)
    searchOpacity.setValue(0)
    Animated.timing(searchOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }

  const closeSearch = () => {
    Animated.timing(searchOpacity, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setSearchQuery('')
      setIsSearchVisible(false)
    })
  }

  const renderItem = ({ item }) => {
    const isSelected = checkisFolderSelected(item.id);
    const isGridLayout = layoutMode === 'grid';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => onLongPressItem(item)}
        onPress={() => onPressItem(item)}
        style={[
          isGridLayout ? styles.gridCard : styles.card,
          isSelected && styles.selectedCard,
        ]}
      >
        <View style={[styles.thumbnailBox, isGridLayout && styles.gridThumbnailBox]}>
          <MaterialCommunityIcons
            name="image-outline"
            size={scaledSize(34)}
            color={mode === 'dark' ? '#46D3E0' : '#00A5B5'}
          />
          <RNImage
            source={{ uri: Utility.images.getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + item.name) }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </View>

        <View style={[styles.itemContent, isGridLayout && styles.gridItemContent]}>
          <Text style={styles.fileTitle} numberOfLines={1}>
            {getFileTitle(item)}
          </Text>

          <Text style={styles.fileDate} numberOfLines={1}>
            {getFileDateLabel(item)}
          </Text>

          <View style={styles.typePill}>
            <View style={styles.typeDot} />
            <Text style={styles.typeText}>IMAGE</Text>
          </View>
        </View>

        <View style={[styles.actionColumn, isGridLayout && styles.gridActionRow]}>
          <TouchableOpacity
            disabled={isMultiDelete}
            style={styles.actionButton}
            onPress={() => onPressEditFile(item)}
          >
            <MaterialIcons
              name="edit"
              size={scaledSize(20)}
              color={theme.iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            disabled={isMultiDelete}
            onPress={() => {
              setIsShowDeleteImageConfirmation(true)
              setSelectedFileIds([item])
            }}
          >
            <MaterialIcons
              name="delete"
              size={scaledSize(20)}
              color={theme.deleteIconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isMultiDelete}
            style={styles.actionButton}
            onPress={() => Utility.fileShare(CONSTANT.SAVED_DOCUMENTS_PATH + item.name, item.name)}
          >
            <MaterialIcons
              name="share"
              size={scaledSize(20)}
              color={theme.iconColor}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };



  const generatePdf = async (data: Array<any>) => {
    console.log('data>>>>>', data);
    if(data.length==0){
      setIsShowErrorModal(true)
      setErrorMessage('Please select file')
      return
    }

    const arr = await data.map((path: any) => CONSTANT.SAVED_DOCUMENTS_PATH + path.name)
    console.log('arr>>>>>', arr);
    const url = await Utility.images.createImagesToPdf(arr,folderName)
    console.log('url>>>>>>>>>>>>>>>>>>', url);
    await Utility.fileShare(url)
  }

  const sharePdfFiles = (data: any, name: string) => {
    RNFetchBlob.fs
      .readFile(data, 'base64')
      .then(async (data) => {
        Share.open({
          filename: name,
          url: 'data:application/pdf;base64,' + data
        })
      })
      .catch((err) => {
        console.log('error------', err);
      });

    console.log("HI>>>>>>>>>>>>>>");

  }



  const showEditImageModal = () => {
    setIsShowEditImage(true)
  }
  const scanDocument = async () => {
    // start the document scanner

    const { scannedImages } = await DocumentScanner.scanDocument()


    // get back an array with scanned image file paths
    if (scannedImages.length > 0) {
      // console.log('scanned',scannedImages);
      console.log('scanned', scannedImages);

      // set the img src, so we can view the first scanned image
      try {
        setImages(scannedImages)

      }
      catch (e) {
        console.log('error', e);

      }
      setIsShowFileNameModal(true)
      setIsNewFile(true)
    }
  }
  const shareFile = (items: Array<any>) => {
    if(items.length==0){
      setIsShowErrorModal(true)
      setErrorMessage('Please select file ')
      return
    }
    console.log('shared', items);
    let data = []
    const folderFiles = items.map(element => ({
      path: CONSTANT.SAVED_DOCUMENTS_PATH+element.name
    }));

    data = [...data, ...folderFiles]; // Accumulate file paths from all folders

    fileShareMultiple(data)
  }
  const handlePressBack = () => {
    setIsShowEditImage(false)
    console.log('pressed back');

  }

const renderHeaderNoSelection = () => {

  if (isSearchVisible) {
    return (
      <SafeAreaView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: scaledSize(12),
          paddingVertical: scaledSize(8),
        }}>

        <Animated.View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            height: scaledSize(52),
            borderRadius: scaledSize(16),
            paddingHorizontal: scaledSize(14),
            backgroundColor: theme.buttonBGColor,
            opacity: searchOpacity,
          }}>

          <MaterialIcons
            name="search"
            size={scaledSize(20)}
            color="#9CA3AF"
          />

          <TextInput
            autoFocus
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: scaledSize(10),
              color: theme.primaryTextColor,
              fontSize: scaledSize(16),
            }}
          />

          <TouchableOpacity
            onPress={closeSearch}
            style={{
              paddingLeft: scaledSize(10),
            }}>
            <MaterialIcons
              name="close"
              size={scaledSize(20)}
              color={theme.iconColor}
            />
          </TouchableOpacity>

        </Animated.View>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scaledSize(12),
        paddingVertical: scaledSize(8),
      }}>

      {/* Back */}

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          setMultidelete(false);
          setSelectedFileIds([]);
          Utility.navigation.navigateToBack();
        }}>
        <MaterialIcons
          name="arrow-back"
          size={24}
          color={theme.iconColor}
        />
      </TouchableOpacity>

      {/* Title */}

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          marginHorizontal: scaledSize(14),
          color: theme.primaryTextColor,
          fontSize: scaledSize(22),
        }}>
        {/* {Utility.string.getFirstLetterCapitalize(
          props.route.params?.folderName,
        )} */}
      </Text>

      {/* Search */}

      <TouchableOpacity
        style={[styles.iconBtn, { marginLeft: 8 }]}
        onPress={openSearch}>
        <MaterialIcons
          name="search"
          size={scaledSize(20)}
          color={theme.iconColor}
        />
      </TouchableOpacity>

      {/* Sort */}

      <TouchableOpacity
        style={[styles.iconBtn, { marginLeft: 8 }]}
        onPress={() => setIsShowSortModal(true)}>
        <MaterialIcons
          name="sort"
          size={scaledSize(20)}
          color={theme.iconColor}
        />
      </TouchableOpacity>

      {/* Layout */}

      <TouchableOpacity
        style={[styles.iconBtn, { marginLeft: 8 }]}
        onPress={toggleLayoutMode}>
        <MaterialIcons
          name={
            layoutMode === 'list'
              ? 'view-module'
              : 'view-list'
          }
          size={scaledSize(20)}
          color={theme.iconColor}
        />
      </TouchableOpacity>

      {/* PDF */}

      <TouchableOpacity
        style={[styles.iconBtn, { marginLeft: 8 }]}
        onPress={() => generatePdf(data)}>
        <Text
          style={{
            color: theme.buttonTextColor,
            fontWeight: '600',
          }}>
          PDF
        </Text>
      </TouchableOpacity>

      {/* Share */}

      <TouchableOpacity
        style={[styles.iconBtn, { marginLeft: 8 }]}
        onPress={() => shareFile(data)}>
        <MaterialIcons
          name="share"
          size={scaledSize(22)}
          color={theme.iconColor}
        />
      </TouchableOpacity>

    </SafeAreaView>
  );
};
  const renderHeaderMultiSelection = () => {
    return (
      <View style={styles.multiHeader}>

        {/* Back */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            setMultidelete(false)
            setSelectedFileIds([])
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.iconColor} />
        </TouchableOpacity>


        {/* Count Badge */}
        <View style={{ ...styles.iconBtn, left: 10 }}>
          <Text style={{ ...styles.iconLabel, padding: 6, fontFamily: Fonts.regular, fontSize: scaledSize(12) }}>
            {selectedFileIds.length}
          </Text>
        </View>


        <View style={{ flex: 1 }} />


        {/* Select All */}
        <TouchableOpacity style={styles.iconBtn} onPress={onPressSelectAll}>
          <MaterialIcons
            name={
              data.length === selectedFileIds.length
                ? "check-box"
                : "check-box-outline-blank"
            }
            size={22}
            color={theme.iconColor}
          />
        </TouchableOpacity>


        {/* Share */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => refForDocShare.current?.present()}
        >
          <MaterialIcons name="share" size={22} color={theme.iconColor} />
        </TouchableOpacity>


        {/* Delete */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsShowDeleteImageConfirmation(true)}
        >
          <MaterialIcons name="delete" size={22} color={theme.deleteIconColor} />
        </TouchableOpacity>

      </View>
    )
  }

  const renderListControls = () => {
    return (
      <View style={styles.listControls}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={openSearch}
        >
          <MaterialIcons name="search" size={scaledSize(18)} color={theme.iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsShowSortModal(true)}
        >
          <MaterialIcons name="sort" size={scaledSize(18)} color={theme.iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={toggleLayoutMode}
        >
          <MaterialIcons
            name={layoutMode === 'list' ? 'view-module' : 'view-list'}
            size={scaledSize(18)}
            color={theme.iconColor}
          />
        </TouchableOpacity>

        {isSearchVisible && (
          <Animated.View style={[styles.searchBox, { opacity: searchOpacity }]}>
            <MaterialIcons name="search" size={scaledSize(20)} color={mode === 'dark' ? '#9CA3AF' : '#8A94AE'} />
            <TextInput
              autoFocus
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={mode === 'dark' ? '#9CA3AF' : '#8A94AE'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={closeSearch} style={styles.clearSearchBtn}>
              <MaterialIcons name="close" size={scaledSize(18)} color={mode === 'dark' ? '#9CA3AF' : '#8A94AE'} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgContainor }}>
      {/* <StatusBar backgroundColor={'black'}/> */}

      {isMultiDelete ?
        renderHeaderMultiSelection()
        :
        renderHeaderNoSelection()
      }
      {/* {!isMultiDelete && renderListControls()} */}
      <View style={{ flex: 1, }}>


        <FlatList
          key={layoutMode}
          numColumns={layoutMode === 'grid' ? 2 : 1}
          data={getSortedFiles()}
          renderItem={renderItem}
          contentContainerStyle={layoutMode === 'grid' ? styles.gridListContent : undefined}
          columnWrapperStyle={layoutMode === 'grid' ? styles.gridColumnWrapper : undefined}
        />
        {/* <Switch
          trackColor={{ false: '#767577', true: 'green' }}
          thumbColor={mode == 'dark' ? 'green' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleTheme()}
          value={mode == 'dark' ? true : false}

        /> */}
        {/* <LinearGradient colors={['#0081A7', '#00AFB9']}
        style={{ height: scaledSize(60), width: scaledSize(60), borderRadius: scaledSize(60), position: 'absolute', bottom: 100, right: 20 }}>
        <TouchableOpacity style={{

          height: scaledSize(60), width: scaledSize(60), justifyContent: 'center', alignItems: 'center',

        }} onPress={() => scanDocument()}>
          <Ionicons name='camera-outline' size={scaledSize(24)} color={'white'} />
        </TouchableOpacity>
      </LinearGradient> */}
        <View style={{
          height: scaledSize(50), position: "absolute", left: scaledSize(270),
          top: heightFromPercentage(72)
        }}>
          <CustomFAB
            style={{ borderWidth: .5, borderColor: theme.iconColor }}
            icon={<Ionicons name='camera-outline' size={scaledSize(24)}
              color={mode === 'light' ? 'white' : theme.iconColor} />}
            onPress={() => { scanDocument() }}
          />
        </View>
      </View>



      {/* {renderImageView()} */}
      <CustomImagesViewSlider imageUrls={imageUrls} isVisible={isShowImageView}
        onPressBack={() => setIsImageView(false)} isBackIconHide={false}
        isCloseIconShow={false} isShareIconShow={true}
        // onShare={()=>{alert()}}
        onShare={(data) => {
          console.log(data);

          Utility.fileShare(CONSTANT.SAVED_DOCUMENTS_PATH + data?.name, data.displayName)
        }}
      />

      {/* Later we will complete implement image editing in next version */}
      <Modal visible={isShowEditImage} style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{ flex: 1, backgroundColor: 'red' }}>
          {<EditImage onPressBack={handlePressBack} imageUri={editImageUri} signaturePath={(v: any) => Utility.images.getImageUriByOS(v)} />}
        </View>
      </Modal>
      {/* End Image Editing */}



      <CustomBottomSheet title='Option' headerColor={theme.bgColor}
        ref={refForDocShare} bottomShitSnapPoints={['30', '30', '50']} >
        <View style={{ flexDirection: 'row', gap: scaledSize(10), 
          marginBottom: scaledSize(10),marginTop:scaledSize(5) }}>
          <TouchableOpacity style={styles.shareCard} onPress={() => generatePdf(selectedFileIds)}>
            <View style={[styles.iconTile, { backgroundColor: '#FEF2F2' }]}>
              {/* PDF icon */}
              <MaterialCommunityIcons name="file-pdf-box" size={22} color="#DC2626" />

            </View>
            <Text style={styles.shareLabel}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareCard} onPress={() => shareFile(selectedFileIds)}>
            <View style={[styles.iconTile, { backgroundColor: '#EFF6FF' }]}>
              {/* Image icon */}
              <MaterialCommunityIcons name="image-multiple" size={22} color="#2563EB" />

            </View>
            <Text style={styles.shareLabel}>Images</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => refForDocShare.current?.close()}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </TouchableOpacity>
      </CustomBottomSheet>
      <ConfirmationDialog visible={isShowDeleteImageConfirmation}
        onCancel={closeDeleteConfirmation}
        onSubmit={submitDeleteConfirmation}
        mode='delete'
      />
      <CustomSortModal
        data={sortOptions}
        isvisible={isShowSortModal}
        onPressClear={() => {
          setSelectedSort('latest')
          setIsShowSortModal(false)
        }}
        onPressApply={(sort) => {
          setSelectedSort(sort)
          setIsShowSortModal(false)
        }}
        onPressClose={() => setIsShowSortModal(false)}
      />
      <CustomRenameModal isVisible={isShowFileNameModal}
        heading={isNewFile?'File Name':'Rename File'}
        subHeading='Enter a new file name'
        placeholder='File name'
        onChangeText={setFileName}
        value={fileName}
        onCancel={() => setIsShowFileNameModal(false)}
        onSubmit={() => { isNewFile ? copyFilesToDirectory() : renameFolder() }}
        submitBtnTitle={isNewFile?'Submit':'Rename'}
        />
      <CustomErrorMsgModal isVisible={isShowErrorModal}
        onPressClose={() => setIsShowErrorModal(false)} errorMessage={errorMessage} />
    </SafeAreaView>
  )
}


const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  card: {
    minHeight: scaledSize(134),
    marginHorizontal: scaledSize(18),
    marginTop: scaledSize(16),
    paddingLeft: scaledSize(18),
    paddingRight: scaledSize(14),
    paddingVertical: scaledSize(20),
    borderRadius: scaledSize(28),
    backgroundColor: theme.bgColor,
    borderWidth: scaledSize(1),
    borderColor: theme.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: mode === 'dark' ? '#000000' : '#9CA3AF',
    shadowOffset: { width: 0, height: scaledSize(10) },
    shadowOpacity: mode === 'dark' ? 0.24 : 0.14,
    shadowRadius: scaledSize(18),
    elevation: 5,
  },

  selectedCard: {
    borderColor: theme.themeColor,
    borderWidth: scaledSize(1.5),
  },

  gridListContent: {
    paddingHorizontal: scaledSize(18),
    paddingBottom: scaledSize(16),
  },

  gridColumnWrapper: {
    justifyContent: 'space-between',
  },

  gridCard: {
    width: (Dimensions.get('window').width - scaledSize(54)) / 2,
    minHeight: scaledSize(220),
    marginTop: scaledSize(16),
    padding: scaledSize(12),
    borderRadius: scaledSize(18),
    backgroundColor: theme.bgColor,
    borderWidth: scaledSize(1),
    borderColor: theme.borderColor,
    alignItems: 'stretch',
    shadowColor: mode === 'dark' ? '#000000' : '#9CA3AF',
    shadowOffset: { width: 0, height: scaledSize(8) },
    shadowOpacity: mode === 'dark' ? 0.22 : 0.12,
    shadowRadius: scaledSize(14),
    elevation: 4,
  },

  thumbnailBox: {
    width: scaledSize(72),
    height: scaledSize(72),
    borderRadius: scaledSize(18),
    backgroundColor: mode === 'dark' ? '#14383D' : '#DDF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  gridThumbnailBox: {
    width: '100%',
    height: scaledSize(104),
    borderRadius: scaledSize(12),
  },

  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  headerIcon: {
    width: scaledSize(38),
    height: scaledSize(38),
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.iconColor
  },

  headerRight: {
    flexDirection: 'row',
  },

  headerAction: {
    width: scaledSize(38),
    height: scaledSize(38),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scaledSize(4),
  },

  itemContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: scaledSize(16),
    marginRight: scaledSize(10),
    minWidth: 0,
  },

  gridItemContent: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: scaledSize(10),
    justifyContent: 'flex-start',
  },

  fileTitle: {
    fontSize: scaledSize(15),
    lineHeight: scaledSize(20),
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: theme.primaryTextColor,
    letterSpacing: 0.5,
  },

  fileDate: {
    marginTop: scaledSize(6),
    fontSize: scaledSize(12),
    lineHeight: scaledSize(17),
    fontFamily: Fonts.regular,
    color: mode === 'dark' ? '#9CA3AF' : '#8A94AE',
    letterSpacing: 0.5,
  },

  typePill: {
    marginTop: scaledSize(9),
    height: scaledSize(22),
    paddingHorizontal: scaledSize(12),
    borderRadius: scaledSize(14),
    backgroundColor: mode === 'dark' ? '#103B40' : '#E0F7F8',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  typeDot: {
    width: scaledSize(7),
    height: scaledSize(7),
    borderRadius: scaledSize(7),
    backgroundColor: '#0097A7',
    marginRight: scaledSize(7),
  },

  typeText: {
    fontSize: scaledSize(11),
    lineHeight: scaledSize(14),
    fontFamily: Fonts.regular,
    fontWeight: '400',
    color: '#0097A7',
    letterSpacing: 0.5,
  },

  actionColumn: {
    width: scaledSize(44),
    height: scaledSize(104),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaledSize(8),
    alignSelf: 'center',
  },

  actionButton: {
    minWidth: scaledSize(38),
    height: scaledSize(32),
    paddingHorizontal: scaledSize(8),
    borderRadius: scaledSize(6),
    backgroundColor: theme.buttonBGColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: scaledSize(8),
    paddingHorizontal: scaledSize(18),
    paddingTop: scaledSize(8),
    paddingBottom: scaledSize(4),
    backgroundColor: theme.bgContainor,
    minHeight: scaledSize(52),
  },

  searchBox: {
    position: 'absolute',
    left: scaledSize(18),
    right: scaledSize(18),
    top: scaledSize(8),
    height: scaledSize(40),
    borderRadius: scaledSize(8),
    paddingHorizontal: scaledSize(10),
    backgroundColor: theme.buttonBGColor,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    marginLeft: scaledSize(8),
    fontSize: scaledSize(13),
    fontFamily: Fonts.regular,
    letterSpacing: 0.5,
    color: theme.primaryTextColor,
  },

  clearSearchBtn: {
    width: scaledSize(28),
    height: scaledSize(28),
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlBtn: {
    width: scaledSize(30),
    height: scaledSize(30),
    borderRadius: scaledSize(8),
    backgroundColor: theme.buttonBGColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridActionRow: {
    width: '100%',
    height: scaledSize(32),
    marginTop: scaledSize(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: scaledSize(8),
    alignSelf: 'auto',
  },
  // ************************
  multiHeader: {
    height: scaledSize(52),
    backgroundColor: theme.bgColor,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: scaledSize(10),

  },



  countBadge: {
    marginLeft: scaledSize(8),
    backgroundColor: theme.buttonTextColor,
    borderRadius: scaledSize(24),
    width: scaledSize(24),
    height: scaledSize(24),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scaledSize(6),
  },

  countText: {
    color: theme.primaryTextColor,
    fontSize: scaledSize(12),
    fontWeight: "600",
  },

  selectText: {
    fontSize: scaledSize(13),
    color: theme.primaryTextColor,
    marginRight: scaledSize(8),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    // marginTop:20,
    paddingHorizontal: 8,
    paddingVertical: 10,
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#ddd',
  },
  title: {
    flex: 1,
    fontSize: scaledSize(16),
    left: scaledSize(10),
    fontWeight: '500',
    color: theme.primaryTextColor,
    marginHorizontal: scaledSize(8),
    fontFamily: Fonts.regular,
    letterSpacing: 1
  },

    iconBtn: {
    height: scaledSize(34),
    paddingHorizontal: scaledSize(7),
    borderRadius: scaledSize(5),
    backgroundColor: theme.buttonBGColor,   // dark filled background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaledSize(4),
  },
  iconLabel: {
    fontSize: scaledSize(10),
    fontWeight: '700',
    color: theme.primaryTextColor,             // white text on dark bg
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaledSize(12),
    paddingHorizontal: scaledSize(8),
    backgroundColor: theme.buttonBGColor,  // white card
    borderRadius: scaledSize(12),
    marginTop: scaledSize(8),
    // borderColor: '#E5E5E5',
    minHeight: scaledSize(80),
    gap: scaledSize(8),
  },
  iconTile: {
    width: scaledSize(40),
    height: scaledSize(40),
    borderRadius: scaledSize(10),
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily:FONTS.regular,
  },
  shareLabel: {
    fontSize: scaledSize(10),
    // fontFamily: FONTS.regular,
    letterSpacing:.5,
    color: theme.primaryTextColor,
  },
  cancelBtn: {
    paddingVertical: scaledSize(12),
    borderRadius: scaledSize(10),

    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaledSize(2),
    backgroundColor: theme.buttonBGColor,  // white cancel button
  },
  cancelLabel: {
    fontSize: scaledSize(12),
    // fontFamily: FONTS.regular,
    letterSpacing:.5,
    color: theme.deleteIconColor,
  },
});
