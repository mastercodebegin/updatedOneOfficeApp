import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Text, StyleSheet,
  FlatList, View, TouchableOpacity, Image, 
  SafeAreaView, 
} from 'react-native';
import { ConfirmPopup, deleteFile, scaledSize, Utility, widthFromPercentage } from '../utilies/Utilities';
import { PdfIcon, FilterIcon } from '../assets/GlobalImages';
import RootView from './RootView';
import AsyncStorage from '@react-native-async-storage/async-storage';



import { useIsFocused, useNavigation } from '@react-navigation/native';
import CustomBannerAdd from './admob/CustomBannerAdd';
import { Fonts } from '../assets/fonts/GlobalFonts';
import CustomSpinner from './CustomSpinner';
import { useDispatch, useSelector } from 'react-redux'
import {  checkIsUserViewedPdf, updateSelectedPdf } from '../screen/dashboard/FileSlice';
import { forwardRef, useImperativeHandle } from 'react';
import { asyncStorageKeyName } from '../utilies/Constants';
import { FileCommonRenderItem } from './FileCommonRenderItem';
import CustomeButton from './CustomButton';
import { useTheme } from '../screen/theme/useTheme';
import VideoAdScreen from './admob/VideoAdd';

interface S {
  searchValue: string
  onReLoad: Function
  isLoading: boolean,
  pdfFiles: Array<{ name: string }>
  selectedSort: string
}
const ReadSystemFile = forwardRef((props: S, ref) => {
  const { searchValue, pdfFiles, onReLoad, isLoading, selectedSort } = props
  const [selectedItem, setSelectedItem] = useState([])
  const [pdfData, setPdfData] = useState([]);
  const dispatch = useDispatch()
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const response = useSelector((state) => state.FileSlice);



  useImperativeHandle(ref, () => ({
    //when user reload data from dashboard
    async readPdfFiles() {
      console.log('useImperativeHandle-------');
    },
  }));


  useEffect(() => {
console.log('pdfdata===',pdfFiles);

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
      if (selectedSort) {
        return Utility.sortFiles(selectedSort, pdfData)
      }
      else
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgContainor }}>
      <View style={{ position: 'relative', top: scaledSize(10) }}>
        <CustomSpinner isLoading={isLoading} />
      </View>


      <View style={{ flex: 1, }}>
        {pdfFiles.length > 0 ?
          <FlatList data={getFiles()}
            renderItem={({ item,index }) => <FileCommonRenderItem
              item={item} icon={PdfIcon}
              selectedItems={selectedItem}
              onPressItem={(v: any) => onPressItem(v)}
              isItemSelected={checkisFolderSelected(item?.id)}
              onLongPress={(v: any) => onLongPress(v)}
              onPressDeleteFile={deleteFileHandler}
              screenName='PdfViewer' 
              index={index}
              />}
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