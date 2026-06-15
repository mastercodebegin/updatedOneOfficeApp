
import { View, Text, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, PermissionsAndroid, Linking, Modal, TextInput, Platform, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Share from 'react-native-share';
import RNFS from 'react-native-fs';

import RNFetchBlob from 'rn-fetch-blob';
import { deleteFile, getFileSize, heightFromPercentage, scaledSize, Utility, widthFromPercentage } from '../utilies/Utilities';
import { PdfIcon, FilterIcon, searchIcon, clear } from '../assets/GlobalImages';
import ConfirmationDialog from './ConfirmationDialog';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import CustomBannerAdd from './admob/CustomBannerAdd';
import { Fonts } from '../assets/fonts/GlobalFonts';
import { FileCommonRenderItem } from './FileCommonRenderItem';
import CustomSpinner from './CustomSpinner';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../utilies/Constants';
import { useDispatch, useSelector } from 'react-redux'
import { Searchbar } from 'react-native-paper'
import { Button, Overlay } from 'react-native-elements';
import { useToast } from "react-native-toast-notifications";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient';
import CustomFAB from './CustomFAB';
import CustomPermissionMessage from './CustomPermissionMessage';
import { CustomPhotoOrCameraSelectOption } from './CustomPhotoOrCameraSelectOption';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import CustomVectorIcon from './CustomVectorIcon';
import CustomRenameModal from './CustomRenameModal';
import CustomErrorMsgModal from './CustomErrorMsgModal';
import CustomSortModal from './CustomSortModal';
import RNBlobUtil from 'react-native-blob-util';
import { convertedPdfLocalService } from '../db/convertedPdfLocalService';
import CustomEmptyState from './CustomEmptyState';

// const RNImageToPdf = createPdf

const ImagesToPdfConverter = () => {
  const toast = useToast()
  const [pdfName, setPdfName] = useState('')
  const [pdfImagesArr, setPdfImagesArr] = useState<any>([])
  const [images, setImages] = useState<any>([])
  const [isShowCreatePdfConfirmation, setIsShowCreatePdfConfirmation] = useState(false);
  const [pdfQuality, setPdfQuality] = useState(0)
  const [isShowCreatePdfModalWindow, setIsShowCreatePdfModalWindow] = useState(false)

  const [pdfData, setPdfData] = useState([]);

  const [isDeleted, setIsDeleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState({})
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

  const [isShowErrorModal, setIsShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { theme, mode } = useTheme();
  const [isShowRenameModal, setIsShowRenameModal] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);

  const [isShowSortModal, setIsShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState('latest')
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






  const fetchConvertedPdfs = async () => {
    const files = await convertedPdfLocalService.getAllConvertedPdfs();
    setPdfData(files);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isFocused) {
      fetchConvertedPdfs();
    }
  }, [isFocused]);


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
    setIsShowCreatePdfConfirmation(false);
    setIsLoading(true)
    const imagePaths = images.map((image: any) => (
      Utility.images.getImageUriByOS(image.path)));
    console.log('imagePaths', imagePaths)
    for (const path of imagePaths) {
      const stat = await RNFS.stat(path);

      console.log('Path:', path);
      console.log('Bytes:', stat.size);
      console.log(
        'MB:',
        (Number(stat.size) / (1024 * 1024)).toFixed(2)
      );
    }
    const createdPdfPath = await Utility.images.createImagesToPdf(imagePaths, pdfName)
    console.log('createdPdfPath', createdPdfPath);
    saveFileinPhoneStorage(createdPdfPath)
    setIsLoading(false)
  }

  const handleProceedPress = () => {
    if (images.length === 0) {
      setErrorMessage('Please select at least one image to create a PDF.');
      setIsShowErrorModal(true);
      return;
    }
    if (pdfName.trim().length === 0) {
      setErrorMessage('Please enter a PDF name before proceeding.');
      setIsShowErrorModal(true);
      return;
    }
    setIsShowCreatePdfConfirmation(true);
  };

  const saveFileinPhoneStorage = async (filePath: string) => {
    const date = Date.now();

    console.log('filePath====', filePath);

    // Android fix (remove file:// if exists)
    const sourcePath =
      Platform.OS === 'android'
        ? filePath.replace('file://', '')
        : `file://${filePath}`;

    try {
      await RNFS.mkdir(CONSTANT.SAVED_CONVERTED_PDF_PATH);
    } catch (error) {
      // Directory already exists
    }

    const destinationPath = `${CONSTANT.SAVED_CONVERTED_PDF_PATH}/${pdfName}.pdf`;

    try {
      await RNFS.copyFile(sourcePath, destinationPath);
      console.log('File copied successfully to:', destinationPath);
      await deleteFile(sourcePath); // Clean up temp file
      setIsLoading(false)

    } catch (err) {
      console.log('Error copying file:', err.message);
      setIsLoading(false)
      return;
    }

    try {
      const state = await RNFS.stat(destinationPath);
      const newPdf = {
        name: `${pdfName}.pdf`,
        path: destinationPath,
        size: state.size,
        createdAt: date,
      };

      await convertedPdfLocalService.createConvertedPdf(newPdf);

      // Refresh list
      fetchConvertedPdfs();

      setImages([]);
      setPdfName('');
      setIsShowCreatePdfModalWindow(false);
    } catch (dbError) {
      console.log('Error saving to DB:', dbError);
    }
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
  const renderItem = ({ item, index }) => (
    <FileCommonRenderItem
      item={item}
      icon={PdfIcon}
      isShowEditBtn={true}
      onPressEditFile={(file: any) => {
        setFileToRename(file);
        setNewFileName(file.name.replace(/\.[^/.]+$/, '')); // Set name without extension
        setIsShowRenameModal(true);
      }}
      onPressDeleteFile={() => { setIsDeleted(true), setSelectedFile(item) }}
      screenName='PdfViewer'
      onPressItem={() => navigation.navigate('PdfViewer', { uri: item.path })}
      onLongPress={() => { }}
      // isItemSelected={false}
      // selectedItems={[]}
      actionButtonContainerStyle={{ left: scaledSize(10) }}
      leftIconStyle={{ width: scaledSize(46), height: scaledSize(46) }}
      index={index}
    />
  )

  const handleRenameSubmit = async () => {
    if (!fileToRename || !newFileName.trim()) {
      setErrorMessage('Please enter a valid file name.');
      setIsShowErrorModal(true);
      return;
    }

    const oldPath = fileToRename.path;
    const oldName = fileToRename.name;
    const fileExtension = oldName.split('.').pop() || 'pdf';
    const newNameWithExt = `${newFileName.trim()}.${fileExtension}`;

    if (newNameWithExt === oldName) {
      setIsShowRenameModal(false);
      return; // No change needed
    }

    const newPath = `${CONSTANT.SAVED_CONVERTED_PDF_PATH}/${newNameWithExt}`;

    try {
      await RNFS.moveFile(oldPath, newPath);

      await convertedPdfLocalService.updateConvertedPdf(fileToRename.id, {
        name: newNameWithExt,
        path: newPath,
      });

      fetchConvertedPdfs(); // Refresh the list
      setIsShowRenameModal(false);
      setFileToRename(null);
      setNewFileName('');
    } catch (error) {
      console.error('Rename failed:', error);
      setErrorMessage('Failed to rename the file. Please try again.');
      setIsShowErrorModal(true);
    }
  };

  const getFiles = () => {
    console.log('searchvalue', searchQuery);

    if (searchQuery.length > 0) {
      return pdfData.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else {
      if (selectedSort) {
        return Utility.sortFiles(selectedSort, pdfData)
      }
      else {
        return pdfData;
      }
    }
  }


  const deleteFileHandler = async () => {
    try {
      console.log('selected file===', selectedFile);
      setIsLoading(true);

      await deleteFile(selectedFile.path);
      await convertedPdfLocalService.deleteConvertedPdf(selectedFile.id);

      // Refresh list
      fetchConvertedPdfs();
      setIsDeleted(false);
    }
    catch (err) {
      console.log('delete error-----', err);

    }
  }

  const renderInputFileName = () => {
    return (<View>
      <Text
        style={{
          fontSize: scaledSize(14),
          fontWeight: '500',
          marginBottom: scaledSize(14),
          left: scaledSize(10),
          letterSpacing: 1,
          color: theme.primaryTextColor,
        }}
      >
        File Name
      </Text>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center',
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
          size={scaledSize(18)}
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
            color: theme.primaryTextColor,
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
            color: theme.primaryTextColor,
          }}
        >
          PDF Quality
        </Text>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.buttonBGColor,
            borderRadius: scaledSize(20),
            padding: scaledSize(3),
            borderWidth: .4,
            borderColor: theme.borderColor,
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
                  borderRadius: scaledSize(18),
                  backgroundColor: isActive ? theme.themeColor : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isActive ? theme.buttonTextColor : theme.secondaryTextColor,
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
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, backgroundColor: theme.bgContainor, paddingTop: scaledSize(10) }}>
        <View style={{
          width: '95%', alignSelf: 'center',
          flexDirection: 'row', alignItems: 'center', gap: scaledSize(8)
        }}>
          <View style={{
            flex: 1,
            // width: widthFromPercentage(95), 
            height: scaledSize(43), marginTop: scaledSize(0),
            justifyContent: 'center', alignItems: 'center', alignSelf: 'center'
          }}>
            <Searchbar
              placeholder="Search"
              placeholderTextColor={theme.secondaryTextColor}
              iconColor={theme.iconColor}
              inputStyle={{
                fontSize: scaledSize(12),
                fontFamily: Fonts.regular,
                color: theme.primaryTextColor,
              }}
              style={{
                borderRadius: scaledSize(14),
                height: scaledSize(44),
                marginRight: 0,
                backgroundColor: theme.bgColor,
                borderWidth: 1,
                borderColor: theme.borderColor,
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
          <TouchableOpacity style={styles.sortButton} onPress={() => setIsShowSortModal(true)}>
            <MaterialCommunityIcons
              name="sort"
              size={scaledSize(22)} color={theme.primaryTextColor} />
          </TouchableOpacity>
        </View>


        {pdfData.length > 0 ? (
          <FlatList
            data={getFiles()}
            renderItem={renderItem}
            keyExtractor={(item, index) => 'key' + index}
          />
        ) : (
          <>
            {isLoading ? <CustomSpinner isLoading={isLoading} /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <CustomEmptyState onPressReload={() => { }} />


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

      <Overlay isVisible={isShowCreatePdfModalWindow} transparent
        overlayStyle={{
          borderRadius: scaledSize(26),
          backgroundColor: theme.bgColor
        }} >
        <View style={{ height: heightFromPercentage(54), width: widthFromPercentage(90), backgroundColor: theme.bgColor, alignSelf: 'flex-end' }}>
          <View style={{
            height: heightFromPercentage(20), width: widthFromPercentage(90),
            alignSelf: 'flex-end'
          }}>
            <CustomPhotoOrCameraSelectOption
              onPressClose={() => { setIsShowCreatePdfModalWindow(false) }}
              images={images}
              multipleImageSelection={true}
              onSelectImages={(arr: any) => { setImages(arr) }} />
          </View>
          {renderInputFileName()}
          {renderPdfQuality()}

          <TouchableOpacity activeOpacity={0.85} style={{ marginTop: scaledSize(36), alignSelf: 'center' }}
            onPress={handleProceedPress}
          >
            <LinearGradient
              colors={[theme.themeColor, theme.themeSecondaryColor]}
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
                  color: theme.buttonTextColor,
                }}
              >
                Proceed
              </Text>
            </LinearGradient>
          </TouchableOpacity>
<CustomSpinner isLoading={isLoading} />
        </View>
      </Overlay>

      <ConfirmationDialog
        visible={isShowCreatePdfConfirmation}
        onCancel={() => setIsShowCreatePdfConfirmation(false)}
        onSubmit={createImagesToPdfHandler}
        message="Are you sure you want to create a PDF with the selected images?"
      />
      <ConfirmationDialog onCancel={() => setIsDeleted(false)} mode='delete'
        onSubmit={() => deleteFileHandler()} visible={isDeleted} />
      {customPermissionMessageModal()}
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
      <CustomErrorMsgModal
        isVisible={isShowErrorModal}
        onPressClose={() => setIsShowErrorModal(false)}
        errorMessage={errorMessage}
      />
      <CustomRenameModal
        isVisible={isShowRenameModal}
        heading="Rename File"
        subHeading="Enter a new name for your file"
        value={newFileName}
        onChangeText={setNewFileName}
        onCancel={() => setIsShowRenameModal(false)}
        onSubmit={handleRenameSubmit}
      />
    </SafeAreaView>
  )
}
const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bgContainor },

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
  card: {
    minHeight: scaledSize(70),
    marginHorizontal: scaledSize(10),
    marginBottom: scaledSize(10),
    padding: scaledSize(10),
    borderRadius: scaledSize(14),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bgColor,
    borderWidth: mode === 'dark' ? 1 : 0,
    borderColor: theme.borderColor,
    elevation: mode === 'light' ? 3 : 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: mode === 'light' ? 0.1 : 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    width: scaledSize(40),
    height: scaledSize(40),
    borderRadius: scaledSize(12),
    backgroundColor: theme.buttonBGColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: scaledSize(12),
  },
  icon: {
    width: scaledSize(24),
    height: scaledSize(24),
    resizeMode: "contain",
  },
  fileName: {
    justifyContent: 'flex-start',
    color: theme.primaryTextColor,
    fontSize: scaledSize(14),
    fontFamily: Fonts.medium,
  },
  fileNameParentView: {
    width: widthFromPercentage(66),
    height: scaledSize(40),
    // backgroundColor: 'red',
    flexDirection: "column"
  },

  fileNameView: {
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