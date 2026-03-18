import * as React from 'react';
import { useState, useEffect } from 'react';
// import { Text } from 'react-native';
import { DocumentDirectoryPath, writeFile, readDir, readFile } from 'react-native-fs';
import {
  Text, StyleSheet,
  FlatList, View, TouchableOpacity, Image,
  SafeAreaView, KeyboardAvoidingView, ActivityIndicator, RefreshControl,
  StatusBar
} from 'react-native';
import { ConfirmPopup, deleteFile, fileShare, getDate, getFileSize, scaledSize, widthFromPercentage } from '../utilies/Utilities';
import { PdfIcon, FilterIcon } from '../assets/GlobalImages';
import RootView from './RootView';
import RNFetchBlob from 'rn-fetch-blob';
import ConfirmationDialog from './ConfirmationDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

// import Icon from 'react-native-vector-icons/AntDesign';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import { FontAwesomeIcon, } from '@fortawesome/react-native-fontawesome'
// import { faEllipsisVertical,faTimesRectangle} from '@fortawesome/free-solid-svg-icons'
import { IconPack } from '@fortawesome/free-regular-svg-icons'

import CustomMenu from './Menu';
import { Button, Menu, Divider, Provider } from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import { Searchbar } from 'react-native-paper'
import Share from 'react-native-share';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import BannerAddMob from './admob/CustomBannerAdd';
import CustomBannerAdd from './admob/CustomBannerAdd';
import { Fonts } from '../assets/fonts/GlobalFonts';
import { color } from 'react-native-elements/dist/helpers';
import CustomSpinner from './CustomSpinner';
import { useDispatch, useSelector } from 'react-redux'
import {  checkIsUserViewedPdf, updateSelectedPdf } from '../screen/dashboard/FileSlice';
import { forwardRef, useImperativeHandle } from 'react';
import { asyncStorageKeyName } from '../utilies/Constants';
import { FileCommonRenderItem } from './FileCommonRenderItem';
import CustomeButton from './CustomButton';
import VideoAdScreen from './admob/VideoAdd';

interface S {
  searchValue: string
  onReLoad: Function
  isLoading: boolean,
  pdfFiles: Array<{ name: string }>
}
const ReadSystemFile = forwardRef((props: S, ref) => {
  const { searchValue, pdfFiles, onReLoad, isLoading } = props
  const [selectedItem, setSelectedItem] = useState([])

  const [pdfData, setPdfData] = useState([]);

  // const [isLoading, setIsLoading] = useState(false)
  const [randomNumber, setRandomNumber] = useState(1)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const isFocused = useIsFocused();
  const response = useSelector((state) => state.FileSlice);


  useImperativeHandle(ref, () => ({
    //when user reload data from dashboard
    async readPdfFiles() {
      console.log('useImperativeHandle-------');

      // setIsLoading(true)
      // const files = await getFilesFromPhoneByFileExtention()
      // setIsLoading(false)
    },
  }));


  useEffect(() => {

    if (isFocused) {
      // console.log('viewpdf----------',response.isUserViewedPdf)
if(response.isUserViewedPdf)
{
  dispatch(checkIsUserViewedPdf(false))
  dispatch(updateSelectedPdf([]))
  setSelectedItem([])
}
      if (pdfData.length == 0) {
        setPdfData(pdfFiles)
      }
    }

  },)


  const getFiles = () => {
    // getting search value from dashboard and filtering it
    if (searchValue.length > 0) {
      return pdfData.filter(file =>
        file.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      return pdfData;
    }
  };




  const deleteFileHandler = async (item) => {
    //@ts-ignore
    // console.log(item);

    try {
      // setIsLoading(true)
      let allfilesStr = await AsyncStorage.getItem(asyncStorageKeyName.ALL_FILES)
      console.log('AllFiles:', allfilesStr);
      const allfilesobj = JSON.parse(allfilesStr)
      const pdfs = allfilesobj.pdfFiles

      const data = pdfs.filter((citem: { name: string, mtime: any }) => citem.name !== item.name && citem.mtime !== item.mtime)
      const pdfFiles = data
      const v = { ...allfilesobj, pdfFiles }
      deleteFile(item.path)

      await AsyncStorage.setItem(asyncStorageKeyName.ALL_FILES, JSON.stringify(v))
      // deleteFile(item.path)
      console.log('data=====', data);

      setPdfData(data)
      setIsLoading(false)


    }
    catch (err) {
      console.log('error-----', err);

    }
  }



  const handleDeletePress = (item) => {
    ConfirmPopup(() => deleteFileHandler(item));
  };
  const deleteAsyncStorage = async () => {
    try {
      await AsyncStorage.removeItem(asyncStorageKeyName.ALL_FILES)
      console.log('AsyncStorage removed successfully');
    } catch (e) {
      // remove error
      console.log('AsyncStorage remove error:', e);
    }
  }
  const onLongPress = (item) => {
    if (checkisFolderSelected(item.id)) {
      const data = selectedItem.filter(selectfolderId => selectfolderId.id != item.id)
      setSelectedItem(data)
      dispatch(updateSelectedPdf(data))
    }
    else {
      setSelectedItem([...selectedItem, item])
      dispatch(updateSelectedPdf([...selectedItem, item]))

    }
    // setSelectedItem([item])

  }

  const checkisFolderSelected = (id: number) => {
    // console.log('selectedfolder', selectedFoldersId);
    const isSelected = selectedItem.find(item => item?.id === id)
    // console.log('isSelected', isSelected);
    return !!isSelected
    // return selectedFoldersId.find(item => item.id === id)
  }
  const onPressItem = (item) => {
    // console.log('onpress selecItem',item);
    
    setSelectedItem(prev => {
      const exists = prev.some(selected => selected.id === item.id);
      const updatedList = exists 
        ? prev.filter(selected => selected.id !== item.id) // Remove if exists
        : [...prev, item]; // Add if doesn't exist
  
      dispatch(updateSelectedPdf(updatedList));
      return updatedList;
    });
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ position: 'relative', top: scaledSize(10) }}>
        <CustomSpinner isLoading={isLoading} />
      </View>


      <View style={{ flex: 1, }}>
        {pdfFiles.length > 0 ?
          <FlatList data={getFiles()}
            renderItem={({ item }) => <FileCommonRenderItem
              item={item} icon={PdfIcon}
              selectedItems={selectedItem}
              onPressItem={(v: any) => onPressItem(v)}
              isItemSelected={checkisFolderSelected(item?.id)}
              onLongPress={(v: any) => onLongPress(v)}
              onPressDeleteFile={deleteFileHandler}
              screenName='PdfViewer' />}
          // keyExtractor={(item) => item}
          // refreshControl={<RefreshControl
          //   colors={["red", "red"]}
          //   refreshing={refreshing}
          //   onRefresh={() => readFiles(false)} />
          //}
          />
          :
          <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
            {!isLoading ? <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text>No files found</Text>
              <TouchableOpacity style={{ height: scaledSize(40), width: scaledSize(300) }}>
                <CustomeButton onPress={() => onReLoad()} name='Reload' 
                 textStyle={{ color: 'blue',  }}
                  ></CustomeButton>
              </TouchableOpacity>
              <View style={{ height: scaledSize(30), width: scaledSize(130) }}>
              </View>
            </View> : <></>}
          </View>

        }

      </View>

      <View style={{
        height: scaledSize(50), width: '100%',
      }}>
        {/* <Button onPress={deleteAsyncStorage}>delete</Button> */}
        <CustomBannerAdd />
        {/* <VideoAdScreen/> */}
      </View>



    </SafeAreaView>
  );
})

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
    height: scaledSize(50),
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
    fontSize: scaledSize(13),
    fontFamily: Fonts.regular,
  }
});
export default React.memo(ReadSystemFile)