import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Text, Platform } from "react-native";
import { COLORS, FONTS } from "../utilies/GlobalColors";
import { ConfirmPopup, fileShare, getDate, getFileSize, navigateTo, scaledSize, widthFromPercentage } from "../utilies/Utilities";
import CustomMenu from "./Menu";

import { Fonts } from '../assets/fonts/GlobalFonts';
import { PdfIcon } from "../assets/GlobalImages";
import Icon from 'react-native-vector-icons/Ionicons';
import { Share } from "react-native";
import RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
interface S {
  item: any
  icon: any
  onPressDeleteFile: Function
  screenName: string
  onPressItem:Function
  onLongPress:any
  isItemSelected: boolean
  selectedItems: Array<any>
}


export const FileCommonRenderItem = (props: S) => {
  const { item, icon, onPressDeleteFile, screenName,onLongPress,isItemSelected,selectedItems,onPressItem } = props;
  // Uncomment the console.log if you need to debug the item object

  useEffect(() => {
    // console.log('Updated selectedItem:', selectedItems);
  }, [selectedItems]);

  const handleDeletePress = (item: any) => {
    ConfirmPopup(() => onPressDeleteFile(item));
  };
  const onPress = (item: any) => {
    if (screenName === 'PdfViewer') {
      navigateTo('PdfViewer', { uri: item.path, name: item?.name })
    }
    else if (screenName === 'XslxReader') {
      navigateTo('XslxReader', { uri: item.path, name: item?.name })
    }
    else if (screenName === 'WordReader') {
      navigateTo('WordReader', { uri: item.path, name: item?.name })
    }

    else if (screenName === 'PPTReader') {
      navigateTo('PPTReader', { uri: item.path, name: item?.name })
    }
  }

  const checkisFolderSelected = (id: number) => {
    // console.log('selectedfolder', selectedFoldersId);

    const isSelected =  selectedItems.find(item => item?.id === id)
    // console.log('isSelected', isSelected);
    return isSelected
    // return selectedFoldersId.find(item => item.id === id)
  }

const onPressItemHandler = () => {
    console.log('selectedItem after delay:', selectedItems);
    if (selectedItems?.length > 0) {
      onPressItem(item)
    } else {
      onPress(item);
    }
};

const onLongPressItem=()=>{
  onLongPress(item)
}
  return (
    <View style={[styles.mainView,{backgroundColor:isItemSelected?'#f5f5f5':'white'}]}>
      <View style={{ width: widthFromPercentage(18), height: scaledSize(50), justifyContent: 'center', alignItems: 'center' }}>
        <Image source={icon} style={styles.icon} />
      </View>
      <TouchableOpacity
       onLongPress={onLongPressItem}
        onPress={onPressItemHandler}
      >
        <View style={[styles.fileNameParentView, { height: scaledSize(40) }]}>
          <View style={styles.fileNameView}>
            <Text style={{ fontSize: scaledSize(12), fontFamily: Fonts.regular, letterSpacing: 1,color:'black' }}>
              {item?.name}
            </Text>
          </View>
          <View style={styles.dateAndSizeParentView}>
            <View style={styles.dateView}>
              <Text style={[styles.fontStyle, ]}>
                {getDate(item.mtime)}
              </Text>
            </View>
            <View style={styles.fileSizeView}>
              <Text style={[styles.fontStyle, ]}>
                {getFileSize(item?.size)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.favAndUnfavoriteView}>
        {/* You can uncomment and use this Text element if needed */}
        {/* <Text style={styles.fontStyle}>hi</Text> */}
      </View>
      {/* <View style={styles.shareFileView}> */}
      {/* <CustomMenu
          Icon={<Icon name={'ellipsis-horizontal'} size={20} />}
          menuOptionstyle={{ padding: scaledSize(13), width: scaledSize(180), height: scaledSize(50) }}
          menuOption={[
            { onSelect: () => fileShare(item.path, item.name), label: 'Share' },
            { onSelect: () => { handleDeletePress(item) }, label: 'Delete' },
          ]}
        /> */}
      {/* </View> */}
      <View style={{
        justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end',
        height: scaledSize(40),
        right: scaledSize(50), width: scaledSize(50)
      }}>



          <TouchableOpacity onPress={() => { handleDeletePress(item) }}>
          <MaterialIcons name='delete' color={'#E4003A'}
            size={scaledSize(20)} style={{ marginLeft: scaledSize(10), }} />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => { setSelectedItems([]) }}> */}
        <TouchableOpacity onPress={() => { fileShare(item.path, item.name) }}>
          <Ionicons name='share-outline' color={COLORS.THEME_COLOR}
            size={scaledSize(20)} style={{ marginLeft: scaledSize(10), bottom: 1 }} />
        </TouchableOpacity>

      </View>
    </View>
  );
};


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
    fontSize: scaledSize(11),
    // color: 'black',
    // fontFamily: FONTS.QuicksandBold,
  }
});

