
import { View, Text, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, PermissionsAndroid, StatusBar, Linking, Modal, TextInput, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import FloatingButton from './FloatingButton'
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { createPdf } from 'react-native-images-to-pdf';
import ModalViewForPdfName from './ModalViewForPdfName'
import RNFetchBlob from 'rn-fetch-blob';
import { capitalizeFirstLetter, createImagesToPdf, deleteFile, generateUniqueNumber, getConvertedPdfFileFromPhoneStorage, getDate, getFileSize, heightFromPercentage, navigateTo, scaledSize, widthFromPercentage } from '../utilies/Utilities';
import { PdfIcon, FilterIcon, searchIcon, clear } from '../assets/GlobalImages';
import CustomMenu from './Menu';
import Icon from 'react-native-vector-icons/Ionicons';
import ConfirmationDialog from './ConfirmationDialog';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import CustomBannerAdd from './admob/CustomBannerAdd';
import { Fonts } from '../assets/fonts/GlobalFonts';
import CustomSpinner from './CustomSpinner';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../utilies/Constants';
import { useDispatch, useSelector } from 'react-redux'
import { updateIsLoadingState } from '../screen/dashboard/FileSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Searchbar } from 'react-native-paper'
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { getDateByMomentFormat } from '../utilies/DateHelper';
import { Button, Overlay } from 'react-native-elements';
import { useToast } from "react-native-toast-notifications";
import Toast from 'react-native-toast-message';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../utilies/GlobalColors';
import CustomLinearGradientView from './CustomLinearGradientView';
import CustomFAB from './CustomFAB';
import { ErrorToast } from './CustomToast';
import CustomBackIcon from './CustomBackIcon';
import CustomHeaderGradient from './CustomHeaderGradient';
import CustomPermissionMessage from './CustomPermissionMessage';
import { CustomPhotoOrCameraSelectOption } from './CustomPhotoOrCameraSelectOption';
import CustomInput from './CustomInput';
import CustomVectorIcon from './CustomVectorIcon';
import RNBlobUtil from 'react-native-blob-util';

// const RNImageToPdf = createPdf

const ImagesToPdfConverter = () => {
  const toast = useToast()
  const [pdfName, setPdfName] = useState('')
  const [pdfImagesArr, setPdfImagesArr] = useState<any>([])
  const [images, setImages] = useState<any>([])
  const [pdfQuality, setPdfQuality] = useState(0)
  const [isShowCreatePdfModalWindow, setIsShowCreatePdfModalWindow] = useState(false)

  const [pdfData, setPdfData] = useState([]);

  const [isDeleted, setIsDeleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filePath, setFilePath] = useState()
  const [randomNumber, setRandomNumber] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const navigation = useNavigation()
  const isFocused = useIsFocused();
  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => setSearchQuery(query);
  const [isShowSettingMessage, setIsShowSettingMessage] = useState(false)
  type Quality = 'High' | 'Medium' | 'Low';
  const [quality, setQuality] = useState<Quality>('High')
  const QUALITY_OPTIONS: Quality[] = ['High', 'Medium', 'Low'];





  useEffect(() => {

    if (isFocused) {

      console.log('is focused converteer====');

      AsyncStorage.getItem(asyncStorageKeyName.CONVERTED_PDF_FILES).then((check) => {
        const obj = JSON.parse(check)
        console.log('convert files obj---', obj);
        let files = []


        if (check && obj.length > 0) {
          setPdfData(obj);
          console.log('if=======',);
        }
        else {
          // console.log('else part-----');

          const getFiles = async () => {
            setIsLoading(true)
            files = await getConvertedPdfFileFromPhoneStorage()
            console.log('files========', files);

            setPdfData(files)
            setIsLoading(false)
          }
          getFiles()

        }

      })
    }
  }, [])


  const showSelectImagesModal = async () => {
    let granted;
    try {
      console.log('app permission 1')

      granted = await PermissionsAndroid.request(
        //@ts-ignore
        PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION
      )

      if (granted == 'granted') {
        try {
          console.log('app permission 1', granted)
          setIsShowCreatePdfModalWindow(true)
        }

        catch (e) {
          // alert('No file Selected')
        }
      }
      else {
        setIsShowSettingMessage(true)
      }
    }
    catch (error) { console.log('error---------', error); }

  }



  const customPermissionMessageModal = () => {
    return (
      <Modal visible={isShowSettingMessage} transparent>
        <CustomPermissionMessage onPressClose={() => setIsShowSettingMessage(false)}
          permissionMessage={CONSTANT.MEDIA_PERMISSION_TITLE} />
      </Modal>
    )
  }

  const getQualityValue = (quality: Quality) => {
    switch (quality) {
      case 'High':
        return 1.0;
      case 'Medium':
        return 0.7;
      case 'Low':
        return 0.4;
      default:
        return 0.8;
    }
  };

  const createImagesToPdfHandler = async () => {
    if(pdfName.length==0)
    {
      alert('Enter pdf name please')
      return
    }
   const createdPdfPath = await createImagesToPdf(images)
   console.log('createdPdfPath',createdPdfPath);
   saveFileinPhoneStorage(createdPdfPath)
   
  }

const saveFileinPhoneStorage = async (filePath: string) => {

  const id = generateUniqueNumber();
  const date = getDateByMomentFormat(null, null);

  console.log('filePath====', filePath);

  // Android fix (remove file:// if exists)
  const sourcePath =
    Platform.OS === 'android'
      ? filePath.replace('file://', '')
      : `file://${filePath}`;

  try {
    await RNFS.mkdir(CONSTANT.SAVED_CONVERTED_PDF_PATH).catch(() => {});
  } catch (error) {
    console.log('Error creating directory:', error.message);
  }

  const destinationPath = `${CONSTANT.SAVED_CONVERTED_PDF_PATH}/${pdfName}.pdf`;

  try {
    await RNFS.copyFile(sourcePath, destinationPath);
    console.log('File copied successfully');
    deleteFileHandler(sourcePath)
  } catch (err) {
    console.log('Error copying file:', err.message);
  }

  // get file info
  const state = await RNFS.stat(sourcePath);

  // safe AsyncStorage read
  const existingFiles = await AsyncStorage.getItem(
    asyncStorageKeyName.CONVERTED_PDF_FILES
  );
  

  const parsedFiles = existingFiles ? JSON.parse(existingFiles) : [];

  const files = [
    ...parsedFiles,
    {
      id,
      path: destinationPath, // ✅ IMPORTANT: save new path
      name: `${pdfName}.pdf`,
      size: state.size,
      date,
    },
  ];

  await AsyncStorage.setItem(
    asyncStorageKeyName.CONVERTED_PDF_FILES,
    JSON.stringify(files)
  );

  setImages([])
  setPdfName('')
  
  setPdfData(files);
  setIsShowCreatePdfModalWindow(false);


};


  const onAndroidSharePress = async (url, name) => {
    RNFetchBlob.fs
      .readFile(url, 'base64')
      .then(async (data) => {
        Share.open({
          filename: name,
          url: 'data:application/pdf;base64,' + data
        })
      })
      .catch((err) => { });
  }
  const renderItem = ({ item }) => (

    <>
      {/* {console.log('item--------',item)} */}
      <View style={[styles.mainView, {
        // shadowColor: COLORS.THEME_COLOR,
        // shadowOffset: {
        //   width: 0,
        //   height: 12,
        // },
        // shadowOpacity: 0.58,
        // shadowRadius: 16.00,

        // elevation: 24
        borderBottomWidth:.5,borderColor:'#d3d3d3'
        // backgroundColor:'red'
      }
      ]}>
        <View style={{
          width: widthFromPercentage(14), height: scaledSize(60),
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Image source={PdfIcon} style={styles.icon} />
        </View>

        <TouchableOpacity onPress={() => { navigation.navigate('PdfViewer', { uri: item.path }) }}
        >

          <View style={[styles.fileNameParentView, { height: scaledSize(50) }]}>
            <View style={[styles.fileNameView]}>
              <Text style={{ fontSize: scaledSize(14), letterSpacing:1 }}>{capitalizeFirstLetter(item?.name)}</Text>
            </View>
            <View style={styles.dateAndSizeParentView}>
              <View style={styles.dateView}>
                <Text style={[styles.fontStyle, { fontFamily: Fonts.regular,fontSize:scaledSize(12) }]}>{getDate(item.mtime)}</Text>
              </View>
              <View style={styles.fileSizeView}>
                <Text style={[styles.fontStyle,{fontSize:scaledSize(11)}]}>{getFileSize(item?.size)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {/* <View style={styles.favAndUnfavoriteView}>
          <Text style={styles.fontStyle}>hi</Text>
        </View> */}
        {/* <TouchableOpacity> */}
        <View style={[styles.shareFileView, {
          padding:scaledSize(10),
          justifyContent: 'flex-start', alignItems: 'flex-end', width: 64, flexDirection: 'row'
        }]}>

          {/* <CustomMenu Icon={<Icon style={{}} name={'ellipsis-horizontal'} size={20} ></Icon>}
            menuOptionstyle={{ padding: scaledSize(13), width: scaledSize(180), height: scaledSize(50) }}
            menuOption={[
              { onSelect: () => onAndroidSharePress(item.path, item.name), label: 'Share' },
              { onSelect: () => { setIsDeleted(true), setFilePath(item) }, label: 'Delete' },
            ]} /> */}
          <TouchableOpacity onPress={() => { setIsDeleted(true), setFilePath(item) }}>
            <MaterialCommunityIcons name={'delete-outline'} size={20} color={'red'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onAndroidSharePress(item.path, item.name)}>
            <Ionicons name={'share-outline'} size={20} color={COLORS.THEME_COLOR} style={{ left: scaledSize(6) }} />
          </TouchableOpacity>
        </View>
        {/* </TouchableOpacity> */}

      </View>
    </>


  )

  const onSearchFile = () => {
    console.log('searchvalue', searchQuery);

    if (searchQuery.length > 0) {
      return pdfData.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return pdfData;
    }
  };


  const deleteFileHandler = async (item) => {
    console.log('item---', item);
    console.log('pdfdata---', pdfData);

    try {
      // dispatch(updateIsLoadingState(true))
      setIsDeleted(false)
      //@ts-ignore
      const data = pdfData.filter((citem) => citem.id !== item.id)
      console.log('data item---', data);
      console.log('data item 2---');
      deleteFile(item.path)
      await AsyncStorage.setItem(asyncStorageKeyName.CONVERTED_PDF_FILES, JSON.stringify(data))
      console.log('data item 3---',);
      setPdfData(data)


      // getPdfFilesFromPhoneStorage()
    }
    catch (err) {
      console.log('delete error-----', err);

    }
  }

  const renderInputFileName = () => {
    return (<View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          marginBottom: 14,
          left: 10,
          letterSpacing: 1,
          color: '#111',
        }}
      >
        File Name
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          // backgroundColor: '#F3F4F6',
          borderRadius: scaledSize(14),
          paddingHorizontal: scaledSize(14),
          height: scaledSize(40),
          borderWidth: .5,
          borderColor: '#d3d3d3'
        }}
      >

        <CustomVectorIcon
          iconLibrary="Feather"
          iconName="file-text"
          size={18}
          style={{ color: '#9CA3AF', marginRight: scaledSize(8) }}
        />

        <TextInput
          placeholder="Enter file name..."
          placeholderTextColor="#9CA3AF"
          value={pdfName}
          onChangeText={setPdfName}
          style={{
            flex: 1,
            fontSize: scaledSize(12),
            color: '#111',
          }}
        />
      </View>
    </View>)
  }
  const renderPdfQuality = () => {
    return (
      <View style={{ marginTop: scaledSize(16) }}>
        <Text
          style={{
            fontSize: scaledSize(12),
            fontWeight: '500',
            letterSpacing: 1,
            marginBottom: scaledSize(12),
            left: scaledSize(8),
            color: '#111',
          }}
        >
          PDF Quality
        </Text>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F8FAFC',
            borderRadius: scaledSize(20),
            padding: scaledSize(3),
            borderWidth: .4,
            borderColor: '#DCDCDC'
          }}
        >
          {QUALITY_OPTIONS.map((item) => {
            const isActive = quality === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setQuality(item)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 18,
                  backgroundColor: isActive ? COLORS.THEME_COLOR : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isActive ? '#FFF' : '#6B7280',
                    fontWeight: '500',
                    fontSize: 14,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    )
  }

  return (
    <LinearGradient
      colors={['white', 'white']}

      style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#4c669f'
      }}>
      {/* <Text>Hi</Text> */}
      {/* {isShowPdfModalWindow ? <ModalViewForPdfName
        onClose={() => setIsShowPdfModalWindow(false)}
        onSubmit={() => pdfName.length > 0 ? createImagesToPdf() : alert('Please Enter FileName')}
        onChangeText={(e) => setPdfName(e)}
        onImageQualityChange={(data) => setPdfQuality(data)}

      /> : null} */}

      <View style={{ flex: 1, }}>
        <LinearGradient
          colors={['#0081A7', '#00AFB9']}


          style={{
            flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
            padding: 0, paddingLeft: 0, width: '95%', alignSelf: 'center', marginTop: scaledSize(10),
            borderRadius: scaledSize(8),
          }}>
          <View style={{
            width: widthFromPercentage(78), height: scaledSize(43), marginTop: scaledSize(0),
            justifyContent: 'center', alignItems: 'center', alignSelf: 'center'
          }}>
            <Searchbar
              placeholder="Search"
              style={{
                borderRadius: scaledSize(0), height: scaledSize(43), marginRight: 0,
                backgroundColor: 'white', textAlign: 'center', borderWidth: 1, borderColor: '#e7ebf3'
              }}
              onChangeText={(value) => setSearchQuery(value)}
              inputStyle={{ fontSize: scaledSize(14), alignSelf: 'center', letterSpacing: 1 }}
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
            width: scaledSize(50), height: scaledSize(40), justifyContent: 'center',
            alignItems: 'center', marginLeft: scaledSize(0), 
          }}>
            <Image source={searchIcon} style={{
              height: scaledSize(16), width: scaledSize(16), tintColor: 'white'

            }} />
            {/* <MaterialCommunityIcons name='file-search' size={scaledSize(24)} color={'white'} /> */}
          </View>
        </LinearGradient>


        {pdfData.length > 0 ? (
          <FlatList
            data={onSearchFile()}
            renderItem={renderItem}
            keyExtractor={(item, index) => 'key' + index}
          />
        ) : (
          <>
            {isLoading ? null : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>No files</Text>


            </View>}
          </>
        )}

      </View>
      <View style={{
        position: 'absolute', left: heightFromPercentage(35),
        top: heightFromPercentage(78), right: 0,
      }}>
        <CustomFAB onPress={() => showSelectImagesModal()} />
      </View>
      <Overlay isVisible={isShowCreatePdfModalWindow} transparent overlayStyle={{borderRadius:scaledSize(16)}} >
        <View style={{ height: heightFromPercentage(54), width: widthFromPercentage(90), backgroundColor: 'white', alignSelf: 'flex-end' }}>
          <View style={{ height: heightFromPercentage(20), width: widthFromPercentage(90), backgroundColor: 'white', alignSelf: 'flex-end' }}>
            <CustomPhotoOrCameraSelectOption
              onPressClose={() => { setIsShowCreatePdfModalWindow(false) }}
              images={images}
              multipleImageSelection={true}
              onSelectImages={(arr: any) => { setImages(arr) }} />
          </View>
          {renderInputFileName()}
          {renderPdfQuality()}

          <TouchableOpacity activeOpacity={0.85} style={{ marginTop: scaledSize(36), alignSelf: 'center' }}
            onPress={() => { createImagesToPdfHandler() }}
          >
            <LinearGradient
              colors={['#0891B2', COLORS.THEME_COLOR]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: heightFromPercentage(4),
                borderRadius: 27,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#0E7490',
                shadowOpacity: 0.35,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
                width: widthFromPercentage(30)
              }}
            >
              <Text
                style={{
                  fontSize: scaledSize(12),
                  fontWeight: '500',
                  letterSpacing: 1,
                  // marginBottom: scaledSize(12),
                  // left: scaledSize(8),
                  color: 'white',
                }}
              >
                Proceed
              </Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </Overlay>

      {isDeleted ? <ConfirmationDialog onCancel={() => setIsDeleted(false)} mode='delete'
        onSubmit={() => deleteFileHandler(filePath)} visible={isDeleted} /> : null}
      {customPermissionMessageModal()}
    </LinearGradient>
  )
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
  enterPasswordText: {
    margin: scaledSize(10),
    fontSize: scaledSize(14),
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: .5
  },
  imageQualityView: {
    height: scaledSize(36),
    width: scaledSize(66),
    // borderWidth: scaledSize(1),
    borderRadius: scaledSize(20),
    // borderColor: COLORS.activeBorderColor,
    justifyContent: 'center',
    marginLeft: scaledSize(12),
    alignItems: 'center',
  },
  imageQualityText: {
    fontFamily: Fonts.regular,
    letterSpacing: 1
  },
  mainView: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: .5,
    borderBottomColor: 'white',
    backgroundColor: 'white',
    width: scaledSize(360),
    height: scaledSize(60),
    left: 10,
    borderRadius: scaledSize(6),
    marginTop: scaledSize(5),

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
    alignItems: 'flex-start'

  },
  fileSizeView: {
    flex: 1,
    // backgroundColor: 'orange',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  favAndUnfavoriteView: {
    width: widthFromPercentage(10),
    height: scaledSize(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareFileView: {
    width: widthFromPercentage(20),
    height: scaledSize(50),
  },

  fontStyle: {
    fontSize: scaledSize(13),
    // fontFamily: Fonts.regular,
  }
});


export default React.memo(ImagesToPdfConverter)