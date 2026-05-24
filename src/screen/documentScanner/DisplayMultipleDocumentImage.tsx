import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, SafeAreaView, BackHandler, StyleSheet, StatusBar } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { mediumBG, MSExcel, MSOffice, MSPowerPoint, smallBG } from '../../assets/GlobalImages'
import { asyncStorageKeyName, CONSTANT } from '../../utilies/Constants'
import { capitalizeFirstLetter, ConfirmPopup, deleteFile, fileShare, fileShareMultiple, generateUniqueNumber, navigateToBack, RNImageToPdf, scaledSize } from '../../utilies/Utilities';
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
import { getImageUriByOS } from '../../utilies/Utilities';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import CustomBottomSheet from '../../component/CustomBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CustomErrorToast } from '../../component/CustomToast';
import { FileLocalService } from '../../db/fileLocalService';
import { FolderLocalService } from '../../db/folderLocalService';
import { useTheme } from '../theme/useTheme';
import { Theme } from '../theme/ThemeConfig';
import ConfirmationDialog from '../../component/ConfirmationDialog';

export default function DisplayMultipleDocumentImage(props: any) {

  const [scannedImage, setScannedImage] = useState();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFolderNameChange, setIsFolderNameChange] = React.useState(false);
  const [existingFile, setExistingFile] = React.useState()
  const [isMultiDelete, setMultidelete] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<any>([]);
  const [isShowConfirmationModal, setIsConfirmationModal] = useState(false);
  const [isImageView, setIsImageView] = useState(false)
  const [imagePath, setImagePath] = useState('')
  const [data, setData] = useState([])
  const [images, setImages] = useState<Array<{ name: string }>>();
  const [imageUrls, setImageUrls] = useState([]);
  const [fileName, setFileName] = useState('')
  const [isShowFileNameModal, setIsShowFileNameModal] = useState(false);
  const [isNewFile, setIsNewFile] = useState(false);
  const [isShowEditImage, setIsShowEditImage] = useState(false);
  const [isShowDeleteImageConfirmation, setIsShowDeleteImageConfirmation] = useState(false);
  const [folderName, setFolderName] = useState('')
  const [editImageUri, setEditImageUri] = useState('')
  const destinationPath = `/storage/emulated/0/Android/data/${CONSTANT.PACKAGE_NAME}/documents/`;
  const itemId = props.route.params.id
  const refForDocShare = useRef<BottomSheetModal>(null);
const {theme,mode,toggleTheme}= useTheme()
  const { folderId } = props.route.params
  useEffect(() => {
    console.log('props',);
    if (data.length == 0) {

      setData(props.route.params.files)
      setFolderName(props.route.params.folderName)
    }},)

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
      alert('Please enter a file name')
      return false
    }
    console.log('existing file', existingFile);

    let existingFileTemp = await FileLocalService.getFileById(existingFile.id)
    console.log('existingFileTemp', existingFileTemp);
    
    existingFileTemp.displayName = fileName + '.jpg'
    await FileLocalService.renameFile(existingFile.id, existingFileTemp)
    console.log('updateFile' );
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
      navigateToBack()
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
      const urls = data.map((item) => ({ url: getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + item.name) }));
      console.log('urls----', urls);

      setImageUrls(urls);
      setIsImageView(true)
      setFileName(item.name)
      setImagePath(item.path)
    }
  }
  const onLongPressItem = (item: any) => {
    setMultidelete(true)
    if (isMultiDelete) {
      onSelectFolders(item)
    }
    else {
      const urls = data.map((item) => ({ url: 'file:' + item.path }));
      console.log('urls----', urls);

      setImageUrls(urls);
      setIsImageView(true)
      setFileName(item.name)
      setImagePath(item.path)
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
        console.log('display name',displayName);
        
        let finalName = `${ baseName + "_"+Date.now() }.${extension}`;
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

       const createdFile= await FileLocalService.createFile({
          name:  finalName,
          displayName: displayName,
          size: 0,
          lastModified: Date.now(),
          folderId: folderId,
          isSynced: 0,
          isDeleted: 0,
          folderFirebaseId: '',
        });
        console.log('createdFile====',createdFile);
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
          styles.card,
          {
            borderColor: isSelected ? theme.themeColor : 'transparent',
            borderWidth: isSelected ? .5 : 0,
          },
        ]}
      >
        {/* Image Container */}

        <View style={styles.imageWrapper}>
          <Image
            resizeMode="contain"
            // resizeMethod='auto'
            source={{ uri: getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + item.name) }}
            style={{
              height: '100%', width: '100%', top: scaledSize(0), alignSelf: 'flex-end'
            }}
          />



          {/* Overlay Actions */}
          <View style={styles.overlayActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => fileShare(item.path, item.name)}
            >
              <MaterialIcons
                name="share"
                size={18}
                color={theme.iconColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onPressEditFile(item)}
            >
              <MaterialIcons
                name="edit"
                size={18}
                color={theme.iconColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>{
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
        <Text style={{...styles.fileName,fontFamily:Fonts.regular, }} numberOfLines={1}>
          {capitalizeFirstLetter(item.displayName)?.replace(/\.[^/.]+$/, '')}
          {/* {item.name} */}
        </Text>
      </TouchableOpacity>
    );
  };
  const convertImagesPathToURI = () => {
    //  const url = data.map((item) => {
    //   return { url: 'file:' + item.path };
    // });
    // console.log('url', url);
    // return url

  };
  const renderImageView = () => {
    return (
      <Modal visible={isImageView} style={{ flex: 1, }} contentContainerStyle={{ backgroundColor: 'white' }}>
        <SafeAreaView style={{
          height: scaledSize(800), width: '100%',

        }}>
          <View style={{
            height: scaledSize(80), width: '100%', backgroundColor: 'red',
            justifyContent: 'space-between', alignItems: 'center',
            flexDirection: 'row', marginTop: scaledSize(0), borderBottomWidth: 1,
          }}>
            <CustomLinearGradientView>
              <View style={{
                height: scaledSize(80), width: '100%',
                justifyContent: 'space-between', alignItems: 'center',
                flexDirection: 'row', marginTop: scaledSize(0), borderBottomWidth: 1, borderBottomColor: '#d3d3d3'
              }}>


                <View style={{
                  flex: 1.9, flexDirection: 'row', justifyContent: 'flex-start', height: '100%',
                  alignItems: 'center',
                }}>
                  {/* <TouchableOpacity onPress={() => { setIsImageView(false), setFileName('') }} > */}
                  <MaterialIcons name='arrow-back' color={'white'}
                    size={scaledSize(24)} style={{ marginLeft: scaledSize(10), marginTop: scaledSize(20) }}
                    onPress={() => { setIsImageView(false), setFileName('') }} />
                  {/* </TouchableOpacity> */}
                </View>
                <View style={{ flex: .5, flexDirection: 'row' }}>
                  {/* <TouchableOpacity onPress={() => { generatePdf() }}>
                    <MaterialCommunityIcons name='pencil' color={'white'} size={scaledSize(24)} style={{ marginLeft: scaledSize(10), alignSelf: 'center' }} />
                  </TouchableOpacity> */}
                  {/* <TouchableOpacity onPress={() => { generatePdf() }}>
                <MaterialCommunityIcons name='file-pdf-box' color={'black'} size={scaledSize(24)} style={{ marginLeft: scaledSize(10), alignSelf: 'center' }} />
              </TouchableOpacity>*/}
                  <TouchableOpacity onPress={() => { fileShare(imagePath, fileName) }}>
                    <MaterialIcons name='share' color={'white'}
                      size={scaledSize(24)} style={{ marginLeft: scaledSize(30), marginRight: scaledSize(0), marginTop: scaledSize(20) }} />
                  </TouchableOpacity>

                </View>
              </View>
            </CustomLinearGradientView>
          </View>

          {/* <ImageZoom
            uri={'file:' + imagePath}
            style={{ height: '100%', width: '100%' }}
            resizeMode='center'
          /> */}
          <ImageViewer imageUrls={imageUrls} style={{ height: '100%', width: '100%' }}
            onChange={(index: number) => setImagePath
              (data[index].path)} />



        </SafeAreaView>
      </Modal>
    )
  }
  const renderFileReNameModal = () => {
    return (
      <Overlay isVisible={isShowFileNameModal}>
        <View style={{ height: scaledSize(180), width: scaledSize(300), backgroundColor: 'white', }}>
          <View style={{ height: scaledSize(50), backgroundColor: 'white', flexDirection: 'row' }}>
            <View style={{ flex: 2, justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{
                fontSize: scaledSize(14), fontFamily: FONTS.QuicksandBold,
                textAlign: 'center', marginTop: scaledSize(4),
              }}>
                {isNewFile ? 'Enter File Name' : 'Update File Name'}
              </Text>
            </View>
            <View style={{ flex: .2, justifyContent: 'flex-start', alignItems: 'flex-end' }}>
              {/* <TouchableOpacity onPress={() => { setIsShowFileNameModal(false)}}> */}
              <TouchableOpacity onPress={() => { isNewFile ? copyFilesToDirectory() : renameFolder() }}>
                <MaterialIcons name='close'
                  size={scaledSize(30)} style={{ bottom: scaledSize(4) }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: scaledSize(40), width: scaledSize(300), marginTop: scaledSize(10) }}>
            <CustomInputBox
              onChangeText={setFileName} value={fileName} placeholder='Enter name' />
          </View>
          <View style={{ height: scaledSize(40), width: scaledSize(300), marginTop: scaledSize(30) }}>
            <CustomeButton name='Save' onPress={() => { isNewFile ? copyFilesToDirectory() : renameFolder() }}
              buttonStyle={{ backgroundColor: COLORS.THEME_COLOR, }} textStyle={{ color: 'white' }} />
          </View>

        </View>
      </Overlay>
    )
  }

  const generatePdf = async (data: any) => {
    const arr = await data.map(path => path.path)
    console.log('arr', arr);


    try {
      const options = {
        imagePaths: arr,
        name: folderName,
        maxSize: { // optional maximum image dimension - larger images will be resized
          width: 900,
          height: Math.round(Dimensions.get('window').height / Dimensions.get('window').width * 900),
        },
        quality: 1,
      };
      console.log('options', options);

      const pdf = await RNImageToPdf.createPDFbyImages(options);

      console.log('typeof>>>>>>>>>>', pdf.filePath);
      sharePdfFiles(pdf.filePath, folderName)

    } catch (e) {
      console.log('error-----', e);
    }
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
  const shareFile = (items: any) => {
    console.log('shared', items);
    let data = []
    const folderFiles = items.map(element => ({
      path: element.path
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
          navigateToBack()
        }}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.iconColor} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {capitalizeFirstLetter(props.route.params?.folderName)}
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
        <View style={{...styles.iconBtn,left:10}}>
          <Text style={{...styles.iconLabel,padding:6,fontFamily:Fonts.regular,fontSize:scaledSize(12)}}>
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
          onPress={deleteFoldersConfirmationForMultipleItem}
        >
          <MaterialIcons name="delete" size={22} color={theme.deleteIconColor} />
        </TouchableOpacity>

      </View>
    )
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgContainor }}>
      {/* <StatusBar backgroundColor={'black'}/> */}
      <View style={{height:50,backgroundColor:'red'}}>

      {isMultiDelete ?
        renderHeaderMultiSelection()
        :
        renderHeaderNoSelection()
      }
      </View>
      <View style={{ flex: .5, }}>
        

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
      </View>

      <LinearGradient colors={['#0081A7', '#00AFB9']}
        style={{ height: scaledSize(60), width: scaledSize(60), borderRadius: scaledSize(60), position: 'absolute', bottom: 100, right: 20 }}>
        <TouchableOpacity style={{

          height: scaledSize(60), width: scaledSize(60), justifyContent: 'center', alignItems: 'center',

        }} onPress={() => scanDocument()}>
          <Ionicons name='camera-outline' size={scaledSize(24)} color={'white'} />
        </TouchableOpacity>
      </LinearGradient>

      {renderFileReNameModal()}
      {renderImageView()}
      
      <Modal visible={isShowEditImage} style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{ flex: 1, backgroundColor: 'red' }}>
          {<EditImage onPressBack={handlePressBack} imageUri={editImageUri} signaturePath={(v: any) => getImageUriByOS(v)} />}
        </View>
      </Modal>
      <CustomBottomSheet title='Option' headerColor='#f5f5f5'
        ref={refForDocShare} bottomShitSnapPoints={['30', '30', '50']} >
        <View style={{ backgroundColor: '#f5f5f5', padding: scaledSize(10) }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: scaledSize(16), letterSpacing: 1, fontFamily: FONTS.regular }}>Share as</Text>
          </View>
          <View
            style={{ flex: 1, marginTop: scaledSize(10), justifyContent: "center", alignItems: 'center' }}>
            <TouchableOpacity style={styles.shareOptionS} onPress={() => generatePdf(selectedFileIds)}>
              <Text style={{ fontSize: scaledSize(16), fontFamily: FONTS.regular }}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.shareOptionS, { marginTop: scaledSize(10) }]}
              onPress={() => shareFile(selectedFileIds)}>
              <Text style={{ fontSize: scaledSize(16), fontFamily: FONTS.regular }}>Images</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.shareOptionS, { marginTop: scaledSize(20), }]}
              onPress={() => refForDocShare.current?.close()}>
              <Text style={{ fontSize: scaledSize(16), fontFamily: FONTS.regular, color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>
<ConfirmationDialog visible={isShowDeleteImageConfirmation}
 onCancel={()=>setIsShowDeleteImageConfirmation(false)}
 onSubmit={()=>deleteMultipleFolder()}
 mode='delete'
 />

    </SafeAreaView>
  )
}


const createStyles = (theme:Theme,mode:string)=>StyleSheet.create({
  card: {
    marginHorizontal: scaledSize(14),
    marginTop: scaledSize(14),
    borderRadius: scaledSize(10),
    backgroundColor: theme.bgColor,
    overflow: 'hidden',
    borderWidth:.5,
    elevation: 4,
    borderColor:theme.secondaryTextColor
  },

  imageWrapper: {
    width: '100%',
    height: scaledSize(180), 

  },

  image: {
    width: '100%',
    height: '100%',
  },

  headerIcon: {
    width: scaledSize(38),
    height: scaledSize(38),
    justifyContent: 'center',
    alignItems: 'center',
    color:theme.iconColor
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
    color:theme.primaryTextColor
  },
  // ************************
  multiHeader: {
    height: scaledSize(52),
    backgroundColor: theme.bgColor,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: scaledSize(10),

    borderBottomWidth: 1,
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
  left:scaledSize(10),
  fontWeight: '500',
  color: theme.primaryTextColor,
  marginHorizontal: scaledSize(8),
  fontFamily:Fonts.regular,
  letterSpacing:1
},
// iconBtn: {
//   width: 36,
//   height: 36,
//   borderRadius: 8,
//   alignItems: 'center',
//   justifyContent: 'center',
// },
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
});


