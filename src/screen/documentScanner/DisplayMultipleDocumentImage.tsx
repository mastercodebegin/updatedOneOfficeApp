import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, SafeAreaView, BackHandler, StyleSheet, StatusBar } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { mediumBG, MSExcel, MSOffice, MSPowerPoint, smallBG } from '../../assets/GlobalImages'
import { asyncStorageKeyName, CONSTANT } from '../../utilies/Constants'
import { capitalizeFirstLetter, ConfirmPopup, deleteFile, fileShareMultiple, generateUniqueNumber, heightFromPercentage, navigateToBack, RNImageToPdf, scaledSize, Utility } from '../../utilies/Utilities';
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
import RNFetchBlob from 'rn-fetch-blob';
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
  const destinationPath = `/storage/emulated/0/Android/data/${CONSTANT.PACKAGE_NAME}/documents/`;
  const itemId = props.route.params.id
  const refForDocShare = useRef<BottomSheetModal>(null);
  const { theme, mode, toggleTheme } = useTheme()
  const { folderId } = props.route.params
  useEffect(() => {
    console.log('props',);
    if (data.length == 0) {

      setData(props.route.params.files)
      setFolderName(props.route.params.folderName)
    }
  },)

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme])

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


  const deleteFoldersConfirmationForMultipleItem = () => {
    ConfirmPopup(() => deleteMultipleFolder());
  };
  const deleteFoldersConfirmationForSingleItem = (item: any) => {
    ConfirmPopup(() => deleteSingleFile(item));
  };

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
    if (isMultiDelete) {
      // setting imageurl if image view open accidently while longpress
      setImageUrls(data)
      onSelectFolders(item)
    }
 
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

  const renderItem = ({ item }) => {
    const isSelected = checkisFolderSelected(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => onLongPressItem(item)}
        onPress={() => onPressItem(item)}
        style={[
          styles.card,{backgroundColor:'yellow'},
          {
            borderColor: isSelected ? theme.themeColor : 'transparent',
            borderWidth: isSelected ? .5 : 0,
          },
        ]}
      >
        {/* Image Container */}

        <View style={styles.imageWrapper}>
          <Image
            resizeMode="center"
            // resizeMethod='auto'
            source={{ uri: Utility.images.getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + item.name) }}
            style={{
              height: '100%', width: '100%', top: scaledSize(0), alignSelf: 'flex-end'
            }}
          />



          {/* Overlay Actions */}
          <View style={styles.overlayActions}>
            <TouchableOpacity
              disabled={isMultiDelete}
              style={styles.iconButton}
              onPress={() => Utility.fileShare(CONSTANT.SAVED_DOCUMENTS_PATH + item.name, item.name)}
            >
              <MaterialIcons
                name="share"
                size={18}
                color={theme.iconColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isMultiDelete}
              style={styles.iconButton}
              onPress={() => onPressEditFile(item)}
            >
              <MaterialIcons
                disabled={isMultiDelete}
                name="edit"
                size={18}
                color={theme.iconColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              disabled={isMultiDelete}
              onPress={() => {
                setIsShowDeleteImageConfirmation(true)
                setSelectedFileIds([item.id])
              }
              }
            >
              <MaterialIcons
                name="delete"
                size={18}
                color={theme.deleteIconColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* File Name */}
        <Text style={{ ...styles.fileName, fontFamily: Fonts.regular,position:'absolute' }} numberOfLines={1}>
          {Utility.string.getFirstLetterCapitalize(item.displayName)?.replace(/\.[^/.]+$/, '')}
          {/* {item.name} */}
        </Text>
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
    return (
      <SafeAreaView style={styles.header}>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            setMultidelete(false)
            setSelectedFileIds([])
            Utility.navigation.navigateToBack()
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.iconColor} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {Utility.string.getFirstLetterCapitalize(props.route.params?.folderName)}
        </Text>

        {/* Right Actions */}
        <View style={styles.rightActions}>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => generatePdf(data)}
          >
            <Text style={styles.iconLabel}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => shareFile(data)}
          >
            <MaterialIcons name="share" size={22} color={theme.iconColor} />
          </TouchableOpacity>

        </View>

      </SafeAreaView>
    )
  }
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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgContainor }}>
      {/* <StatusBar backgroundColor={'black'}/> */}

      {isMultiDelete ?
        renderHeaderMultiSelection()
        :
        renderHeaderNoSelection()
      }
      <View style={{ flex: 1, }}>


        <FlatList
          // display to item inrow
          // numColumns={2}
          data={data}
          renderItem={renderItem}
        />
        <Switch
          trackColor={{ false: '#767577', true: 'green' }}
          thumbColor={mode == 'dark' ? 'green' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleTheme()}
          value={mode == 'dark' ? true : false}

        />
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
        onCancel={() => setIsShowDeleteImageConfirmation(false)}
        onSubmit={() => deleteMultipleFolder()}
        mode='delete'
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
    marginHorizontal: scaledSize(14),
    marginTop: scaledSize(14),
    borderRadius: scaledSize(10),
    backgroundColor: theme.bgColor,
    overflow: 'hidden',
    borderWidth: .5,
    elevation: 4,
    borderColor: theme.secondaryTextColor
  },

  imageWrapper: {
    backgroundColor:'red',
    justifyContent:'center',
    alignItems:'center',
    width: '100%',
    height: scaledSize(200),
    

  },

  image: {
    width: '80%',
    height: '80%',
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

  overlayActions: {
    position: 'absolute',
    top: scaledSize(6),
    right: scaledSize(6),
    flexDirection: 'column',
  },

  iconButton: {
    backgroundColor: theme.buttonBGColor,
    borderRadius: scaledSize(20),
    padding: scaledSize(4),
    marginBottom: scaledSize(6),
    elevation: 2,
  },

  fileName: {
    marginTop: scaledSize(8),
    marginHorizontal: scaledSize(10),
    fontSize: scaledSize(13),
    bottom: scaledSize(4),
    letterSpacing: 1,
    color: theme.primaryTextColor
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
    backgroundColor: theme.bgColor,
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
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: theme.buttonBGColor,   // dark filled background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  iconLabel: {
    fontSize: 11,
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


