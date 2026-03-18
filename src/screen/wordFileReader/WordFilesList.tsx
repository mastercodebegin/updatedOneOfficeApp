import { View, Text, FlatList, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { deleteFile, getFilesFromPhoneByFileExtention, scaledSize, toastForDeleteFile } from '../../utilies/Utilities'
import CustomMenu from '../../component/Menu'
import { FileCommonRenderItem } from '../../component/FileCommonRenderItem'
import { MSOffice, PdfIcon } from '../../assets/GlobalImages'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useToast } from "react-native-toast-notifications";
import { Image } from 'react-native'
import { asyncStorageKeyName } from '../../utilies/Constants'
import { useIsFocused } from '@react-navigation/native'
import CustomeButton from '../../component/CustomButton'


// import { FileType, getAllFilesFromPhoneStorage } from '../../utilies/Utilities'

interface S {
  searchValue: string,
  onReLoad: Function
  isLoading: boolean
  wordFiles: Array<{ name: string }>,
}
interface File {
  name: string;
  path: string;
  size: number;
}

export default function WordFilesList(props: S) {
  const { searchValue, wordFiles, isLoading ,onReLoad} = props
  const [files, setFiles] = useState<File[]>([]);
  const toast = useToast();
  const isFocused = useIsFocused();

  useEffect(() => {

    if (isFocused) {

      if (files.length == 0) {
        setFiles(wordFiles)
      }
    }

  },)


  // needs to keep this in seperate to refresh files
  const deleteFileHandler = async (item: any) => {
    let allfilesStr = await AsyncStorage.getItem(asyncStorageKeyName.ALL_FILES)
    console.log('AllFiles:', allfilesStr);
    const allfilesobj = JSON.parse(allfilesStr)
    const wordsFile = allfilesobj.wordFiles

    const data = wordsFile.filter((citem: { name: string, mtime: any }) => citem.name !== item.name && citem.mtime !== item.mtime)
    const wordFiles = data
    const v = { ...allfilesobj, wordFiles }
    deleteFile(item.path)

    await AsyncStorage.setItem(asyncStorageKeyName.ALL_FILES, JSON.stringify(v))

    setFiles(data)
  }

  const getFiles = () => {
    // getting search value from dashboard and filtering it
    if (searchValue.length > 0) {
      return files.filter(file =>
        file.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      return files;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {wordFiles.length > 0 ? (
          <FlatList data={getFiles()}
            //   renderItem={({ item }) => <Text>Hi</Text>}
            renderItem={({ item }) => <FileCommonRenderItem
              item={item} icon={MSOffice} onPressDeleteFile={deleteFileHandler} screenName='WordReader' />}
          // keyExtractor={(item) => item}
          // refreshControl={<RefreshControl
          //   colors={["red", "red"]}
          //   refreshing={refreshing}
          //   onRefresh={() => readFiles(false)} />
          //}
          />
        ) :
          <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
            {!isLoading ? <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text>No files found</Text>
              <View style={{ height: scaledSize(40), width: scaledSize(300) }}>
                <CustomeButton onPress={() => onReLoad()} name='Reload'
                 textStyle={{color:'blue'}}></CustomeButton>
              </View>
              <View style={{ height: scaledSize(30), width: scaledSize(130) }}>
              </View>
            </View> : <></>}
          </View>
        }

      </View>
    </View>
  )
}