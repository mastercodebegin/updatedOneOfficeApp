import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { deleteFile, getFilesFromPhoneByFileExtention, scaledSize, sortFiles, toastForDeleteFile, Utility } from '../../utilies/Utilities'
import CustomMenu from '../../component/Menu'
import { FileCommonRenderItem } from '../../component/FileCommonRenderItem'
import { MSOffice, PdfIcon } from '../../assets/GlobalImages'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useToast } from "react-native-toast-notifications";
import { Image } from 'react-native'
import { asyncStorageKeyName } from '../../utilies/Constants'
import { useIsFocused } from '@react-navigation/native'
import CustomeButton from '../../component/CustomButton'
import CustomEmptyState from '../../component/CustomEmptyState'
import { getLocalData, setLocalData } from '../../utilies/storageUtility'
import CommonFolderView from '../../component/CommonFolderView'
import { useDispatch } from 'react-redux'
import { updateSelectedFiles } from '../dashboard/FileSlice'

// import { FileType, getAllFilesFromPhoneStorage } from '../../utilies/Utilities'

interface S {
  searchValue: string,
  onReLoad: Function
  isLoading: boolean
  wordFiles: Array<{ name: string }>,
  selectedSort: string
    viewMode: 'list' | 'folder';

}
interface File {
  name: string;
  path: string;
  size: number;
  id: number;
}

export default function WordFilesList(props: S) {
  const { searchValue, wordFiles, isLoading, onReLoad, selectedSort, viewMode } = props
  const [files, setFiles] = useState<File[]>([]);
  const toast = useToast();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  useEffect(() => {

    if (isFocused) {

      if (files.length == 0) {
        setFiles(wordFiles)
      }
    }

  },)


  // needs to keep this in seperate to refresh files
  const deleteFileHandler = async (item: any) => {
    let allfilesStr =  getLocalData(asyncStorageKeyName.ALL_FILES)
    console.log('AllFiles:', allfilesStr);
    const allfilesobj = JSON.parse(allfilesStr)
    const wordsFile = allfilesobj.wordFiles

    const data = wordsFile.filter((citem: { name: string, mtime: any }) => citem.name !== item.name && citem.mtime !== item.mtime)
    const wordFiles = data
    const v = { ...allfilesobj, wordFiles }
    deleteFile(item.path)

   setLocalData(asyncStorageKeyName.ALL_FILES, JSON.stringify(v))

    setFiles(data)
  }


    const sanitizeFilesForRedux = file => {
      return {
        id: file.id,
        name: file.name,
        path: file.path,
        size: file.size,
  
        mtime: file.mtime
          ? new Date(
              file.mtime,
            ).toISOString()
          : null,
      };
    };
    const onPressItem = item => {
      dispatch(
        updateSelectedFiles(
          sanitizeFilesForRedux(
            item,
          ),
        ),
      );
    };
    const onLongPress = item => {
      dispatch(
        updateSelectedFiles(
          sanitizeFilesForRedux(
            item,
          ),
        ),
      );
    };


  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {wordFiles.length > 0 ? (
          // <FlatList data={getFiles()}
          //   renderItem={({ item, index }) => 
          //   <FileCommonRenderItem
          //     index={index}
          //     item={item}
          //     icon={MSOffice} 
          //     onPressDeleteFile={deleteFileHandler}
          //      screenName='WordReader' />}
 
          // />
          <CommonFolderView
          files={wordFiles}
          viewMode={viewMode}
          searchValue={searchValue}
          selectedSort={selectedSort}
          icon={MSOffice}
          screenName="WordReader"
          onPressItem={
            onPressItem
          }

          onLongPress={
            onLongPress
          }

          onPressDeleteFile={
            deleteFileHandler
          }

        />
        ) :
          <CustomEmptyState onPressReload={() => onReLoad()} />
        }

      </View>
    </View>
  )
}