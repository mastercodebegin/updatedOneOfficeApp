
import * as React from 'react';
import { useState, useEffect, useMemo, } from 'react';
// import { Text } from 'react-native';
import RNFS from 'react-native-fs';
import { DocumentDirectoryPath, writeFile, readDir, readFile } from 'react-native-fs';
import {
  Text, StyleSheet,
  FlatList, View, TouchableOpacity, Image, SafeAreaView, KeyboardAvoidingView
} from 'react-native';
import { scaledSize, Utility, widthFromPercentage } from '../utilies/Utilities';
import { PdfIcon, FilterIcon } from '../assets/GlobalImages';
import RootView from './RootView';
import RNFetchBlob from 'rn-fetch-blob';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FileCommonRenderItem } from './FileCommonRenderItem';
import { FONTS } from '../utilies/GlobalColors';
import CustomHeader from './CustomHeader';
// import BackButton from './BackButton';

interface Props {
  files: any[];
  viewMode: 'list' | 'folder';
  searchValue: string;
  selectedSort: string;
  icon: any;
  screenName: string;
  onPressItem: Function;
  onLongPress: Function;
  onPressDeleteFile: Function;
}

type FolderGroup = {
  folder: string;
  files: any[];
};

const CommonFolderView = (props: Props) => {
  const {
    files,
    viewMode,
    searchValue,
    selectedSort,
    icon,
    screenName,
    onPressItem,
    onLongPress,
    onPressDeleteFile,
  } = props;

  const { theme } = useTheme();

  const [selectedFolder, setSelectedFolder] =
    useState<FolderGroup | null>(null);

const getFolderByFileName = (filename: string) => {
  const name = filename.toLowerCase();

  /* Banking */

  if (
    name.includes('statement') ||
    name.includes('acct') ||
    name.includes('credit-card') ||
    name.includes('debit-card') ||
    name.includes('bank') ||
    name.includes('passbook') ||
    name.includes('account') ||
    name.includes('upi') ||
    name.includes('transaction') ||
    name.includes('loan') ||
    name.includes('emi') ||
    name.includes('refund') ||
    name.includes('cheque')
  ) {
    return 'Banking';
  }
    /* Legal */

if (
  name.includes('notice') ||
  name.includes('legal') ||
  name.includes('court') ||
  name.includes('agreement') ||
  name.includes('affidavit')
) {
  return 'Legal';
}

  /* Finance */

  if (
    name.includes('invoice') ||
    name.includes('bill') ||
    name.includes('receipt') ||
    name.includes('payment') ||
    name.includes('gst') ||
    name.includes('tax') ||
    name.includes('salary') ||
    name.includes('payslip') ||
    name.includes('form16') ||
    name.includes('investment')
  ) {
    return 'Finance';
  }

  /* Identity */

  if (
    name.includes('aadhaar') ||
    name.includes('aadhar') ||
    name.includes('pan') ||
    name.includes('pancard') ||
    name.includes('voter') ||
    name.includes('passport') ||
    name.includes('license') ||
    name.includes('licence') ||
    name.includes('driving') ||
    name.includes('samagra') ||
    name.includes('dl')
  ) {
    return 'Identity';
  }

  /* Insurance */

  if (
    name.includes('insurance') ||
    name.includes('policy') ||
    name.includes('lic') ||
    name.includes('mediclaim') ||
    name.includes('healthpolicy')
  ) {
    return 'Insurance';
  }

  /* Medical */

  if (
    name.includes('medical') ||
    name.includes('prescription') ||
    name.includes('report') ||
    name.includes('lab') ||
    name.includes('xray') ||
    name.includes('scan') ||
    name.includes('blood') ||
    name.includes('hospital')
  ) {
    return 'Medical';
  }

  /* Education */

  if (
    name.includes('certificate') ||
    name.includes('marksheet') ||
    name.includes('degree') ||
    name.includes('college') ||
    name.includes('school') ||
    name.includes('semester') ||
    name.includes('result')
  ) {
    return 'Education';
  }

  /* Career */

  if (
    name.includes('resume') ||
    name.includes('cv') ||
    name.includes('offer') ||
    name.includes('experience') ||
    name.includes('joining') ||
    name.includes('relieving')
  ) {
    return 'Career';
  }

  /* Travel */

  if (
    name.includes('ticket') ||
    name.includes('flight') ||
    name.includes('boarding') ||
    name.includes('hotel') ||
    name.includes('trip') ||
    name.includes('visa')
  ) {
    return 'Travel';
  }

  return 'Others';
};

  const filteredFiles = useMemo(() => {
    let data = [...files];

    if (searchValue) {
      data = data.filter(file =>
        file.name
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      );
    }

    if (selectedSort) {
      data = Utility.sortFiles(
        selectedSort,
        data,
      );
    }

    return data;
  }, [
    files,
    searchValue,
    selectedSort,
  ]);

  const groupedFiles = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    filteredFiles.forEach(file => {
      const folder =
        getFolderByFileName(
          file.name,
        );

      if (!grouped[folder]) {
        grouped[folder] = [];
      }

      grouped[folder].push(file);
    });

    return Object.keys(grouped).map(
      key => ({
        folder: key,
        files: grouped[key],
      }),
    );
  }, [filteredFiles]);

  const renderCommonFile = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {

    return (
      <FileCommonRenderItem
        item={item}
        icon={icon}
        onPressItem={onPressItem}
        onLongPress={onLongPress}
        onPressDeleteFile={onPressDeleteFile}
        screenName={screenName}
        index={index}
      />
    );
  };

  const data =
    selectedFolder
      ? selectedFolder.files
      : viewMode === 'folder'
        ? groupedFiles
        : filteredFiles;

 const renderFolder = ({ item }: { item: FolderGroup }) => {
  return (

    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        setSelectedFolder(item)
      }

      style={{

        marginHorizontal:
          scaledSize(18),

        marginTop:
          scaledSize(12),

        paddingHorizontal:
          scaledSize(18),

        height:
          scaledSize(52),

        borderRadius:
          scaledSize(22),

        backgroundColor:
          theme.bgColor,

        borderWidth: 1,

        borderColor:
          theme.borderColor,

        flexDirection:
          'row',

        alignItems:
          'center',

        justifyContent:
          'space-between',

      }}>

      {/* Left */}

      <View
        style={{

          flexDirection:
            'row',

          alignItems:
            'center',

        }}>

        <View
          style={{

            width:
              scaledSize(30),

            height:
              scaledSize(30),

            borderRadius:
              scaledSize(10),

            backgroundColor:
              theme.bgColor,

            justifyContent:
              'center',

            alignItems:
              'center',

          }}>

          <MaterialIcons
            name="folder"
            size={scaledSize(26)}
            color={theme.themeColor}
          />

        </View>

        <Text
          style={{

            marginLeft:
              scaledSize(14),

            color:
              theme.primaryTextColor,

            fontSize:
              scaledSize(13),

            fontFamily:
              FONTS.regular,

          }}>

          {item.folder}

        </Text>

      </View>

      {/* Right */}

      <Text
        style={{

          color:
            theme.secondaryTextColor,

          fontSize:
            scaledSize(14),

        }}>

        {item.files.length} files

      </Text>

    </TouchableOpacity>

  );
};

const renderBackButton = () => {
  
  return (
<>
<View style={{height:60}}>

<CustomHeader onPressBack={() =>
        setSelectedFolder(null)
      } title={selectedFolder?.folder || ''}
       titleStyle={{fontSize:scaledSize(12),letterSpacing:.5}} />
</View>

</>

  );
};

  const renderItem = ({ item, index }: { item: any; index: number }) => {

    if (
      viewMode === 'folder' &&
      !selectedFolder
    ) {

      return renderFolder({
        item,
      });
    }

    return renderCommonFile({
      item,
      index,
    });
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bgContainor,
      }}>

      {selectedFolder && 


        renderBackButton()

      }

      <FlatList
        data={data}

        renderItem={renderItem}

        keyExtractor={(item, index) =>

          item.id?.toString()

          ||

          item.folder

          ||

          index.toString()

        }

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{
          paddingTop:
            selectedFolder
              ? scaledSize(8)
              : scaledSize(2),

          paddingHorizontal:
            scaledSize(2),

          paddingBottom:
            scaledSize(120),
        }}

      />

    </View>
  );
};

export default CommonFolderView;

const styles = StyleSheet.create({});
