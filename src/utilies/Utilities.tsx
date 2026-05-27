import React from 'react'
import { Dimensions, PixelRatio } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob';
// import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppShare, asyncStorageKeyName, CONSTANT } from './Constants';
import { CommonActions } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { Popup } from '@sekizlipenguen/react-native-popup-confirm-toast'
import Share from 'react-native-share';
import { createPdf } from 'react-native-images-to-pdf';

import { keepLocalCopy, pick, PredefinedFileTypes, types } from '@react-native-documents/picker'
const RNImageToPdf = createPdf
import { Platform } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getFirstLetterCapitalize } from './StringUtilitiy';
import { getDateByMomentFormat, getDateFromString, getFirebaseTimeStampByMillis, getMillis } from './DateUtility';
import { getLocalData, removeAllLocalData, removeLocalData, setLocalData } from './storageUtility';

let { width, height, scale: deviceScale, fontScale } = Dimensions.get('window');
const baseWidth = 360;
const baseHeight = 700;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);
// const storageProvider = require('./StorageProvider');
export const navigationRef = createNavigationContainerRef();

export const scaleRatio = deviceScale;
export const deviceWidth = width;
export const deviceHeight = height;
export const deviceAspectRatio = width / height;
export const scaledSize = (size: any) => Math.ceil(size * scale);
export const widthFromPercentage = wp;
export const heightFromPercentage = hp;


const generateUniqueNumber = () => {
  return Math.floor(Math.random() * (100000 - 1 + 1)) + Math.floor(Math.random() * 100 * 9);
};

interface S {
  isMultipleSelection?: boolean,
  fileTypes?: Array<any>
  isBase64?: boolean
}

export const VECTOR_ICON_LIBRARIES = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialDesignIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} as const;

// ✅ Type for autocompletion support
export type IconLibraryType = keyof typeof VECTOR_ICON_LIBRARIES;


export const getFileSize = (size) => {
  // console.log('getFileSize',size);

  const kb = size / 1000
  if (kb > 1000) {
    const mb = kb / 1000
    //  const mbString=mb.toString
    //  mbString.

    return `${Math.round(mb * 10) / 10} MB`
  }
  else { return `${Math.round(kb * 10) / 10} KB` }

}



export const heightToDp = number => {
  let givenHeight = typeof number === 'number' ? number : parseFloat(number)
  return PixelRatio.roundToNearestPixel(height * givenHeight / 100)
}

export const widthToDp = number => {
  let givenWidth = typeof number === 'number' ? number : parseFloat(number)
  return PixelRatio.roundToNearestPixel(width * givenWidth / 100)
}

export const getPotraitAndLandscapeDimensions = () => {
  Dimensions.addEventListener('change', (dimension) => {
    width = dimension.screen.width
    height = dimension.screen.height
    //console.log('updated-------',height,width);
    //return dimension
  })
}



const fileShare = async (url: string) => {


  console.log('url: ' + url);
  const extension = url.split('.').pop(); // Get the file extension from the URL
  console.log('extension======', extension);
const name =
 url
  .split('/')
  .pop()
  ?.split('.')
  .slice(0,-1)
  .join('.')

  const mimeType = getMimeType(extension); // Get the MIME type based on the extension

  console.log('Filename:', name);  // Check the filename
  console.log('Extension:', extension);  // Check the extension


  RNFetchBlob.fs
    .readFile(url, 'base64')
    .then(async (data) => {
      Share.open({
        filename: name,
        url: `data:${mimeType};base64,${data}` // Use the correct MIME type for the file
      })
    })
    .catch((err) => { });

}

const getMimeType = (extension: string) => {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'image/jpeg'; // Fallback for unknown types
  }
};

export const getFileExtension = (url: string) => {
  console.log('url:', url);

  const name = url.split('/').pop()// Extract the file name
  console.log('name:', name); // Check the  
  const extension = name.split('.').pop(); // Get extension from filename
  console.log('extension:', extension); // Check the extension
  const mime = getMimeType(extension)
  console.log('mime:', mime); // Check the
  return mime


}
export const fileShareMultiple = async (files: any) => {
  const validFiles = [];

  for (const file of files) {
    try {
      // Read the file as a base64 string

      const base64Data = await RNFetchBlob.fs.readFile(file.path, 'base64');
      const mimeType = `${getFileExtension(file.path)}`; // Determine MIME type
      console.log('mime=====', mimeType);


      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Push the shareable object into the validFiles array
      validFiles.push({
        filename: file.name,
        url: dataUrl,
      });
    } catch (err) {
      console.error(`Error reading file ${file.name}:`, err);
    }
  }

  // Share valid files if any are available
  if (validFiles.length > 0) {
    try {
      await Share.open({
        urls: validFiles.map((file) => file.url), // Share all valid file URLs
      });
      console.log('Files shared successfully');
    } catch (err) {
      console.error('Error sharing files:', err);
    }
  } else {
    console.error('No valid files to share.');
  }
};

export const deleteFile = (path) => {
  console.log('path>>>>>>>', path);

  RNFS.unlink(path)
    .then(() => {
    })
    // `unlink` will throw an error, if the item to unlink does not exist
    .catch((err) => {
      console.log('delete-----', err.message);
    });
}

export const getFilesFromPhoneByFileExtention = async (data?: any) => {
  interface File {
    name: string;
    path: string;
    size: number;
  }
  // assign type to array
  let pdfFiles: File[] = [];
  let wordFiles: File[] = [];
  let xlsxFiles: File[] = [];
  let pptFiles: File[] = [];
  console.log(`Reading directory=========`,);

  const readDirectory = async (path: any) => {

    try {

      const result = await RNFS.readDir(path);
      // console.log('result:', result);

      for (const item of result) {

        item.id = generateUniqueNumber()
        if (item.name.toLowerCase().endsWith('.pdf')) {
          pdfFiles.push(item);
          // console.log(`Found PDF: ${item.name}`);
        }
        else if (item.name.toLowerCase().endsWith('.docx')) {
          wordFiles.push(item);
          // console.log(`Found PDF: ${item.name}`);
        }
        else if (item.name.toLowerCase().endsWith('.xlsx')) {
          xlsxFiles.push(item);
          // console.log(`Found PDF: ${item.name}`);
        }
        else if (item.name.toLowerCase().endsWith('.xls')) {
          xlsxFiles.push(item);
          // console.log(`Found PDF: ${item.name}`);
        }

        else if (item.name.toLowerCase().endsWith('.pptx')) {
          pptFiles.push(item);
          // console.log(`Found PDF: ${item.name}`);
        }
        else if (item.isDirectory()) {
          // console.log(`Entering directory: ${item.path}`);
          await readDirectory(item.path);
        }
      }

    } catch (error) {
      console.log(`Error reading directory ${path}:`, error);
    }
  };



  try {
    // Start by reading the root external storage directory
    await readDirectory(RNFS.ExternalStorageDirectoryPath);

    //Explicitly include WhatsApp directory if it exists

    //console.log('List finished:', pdfFiles);
  } catch (error) {
    console.log('Error:', error);
  } finally {

    // console.log('stoaring files in asyncstorage start=======', pdfFiles[0]);
    let sorted = []
    if (data > 0) {
      sorted = pdfFiles.sort((a, b) => new Date(b.mtime) - new Date(a.mtime)); // latest date
      // console.log('data >0 ', data);

    }
    if (data == 0) {
      sorted = pdfFiles.sort((a, b) => new Date(a.mtime) - new Date(b.mtime));
      // console.log('less data <0 ', data);

    }
    // console.log('stoaring files in asyncstorage start=======', sorted);

    await AsyncStorage.setItem(asyncStorageKeyName.PDF_FILES, JSON.stringify(pdfFiles));
    // await AsyncStorage.setItem(asyncStorageKeyName.WORD_FILES, JSON.stringify(wordFiles));
    // await AsyncStorage.setItem(asyncStorageKeyName.XLSX_FILES, JSON.stringify(xlsxFiles));
    // await AsyncStorage.setItem(asyncStorageKeyName.PPT_FILES, JSON.stringify(pptFiles));
    console.log('pptFiles------', pptFiles);

    await AsyncStorage.setItem(asyncStorageKeyName.ALL_FILES, JSON.stringify({ pdfFiles: sorted, wordFiles, xlsxFiles, pptFiles }));
    // console.log('stoaring files in asyncstorage end=======');
    // console.log('returning files as per extension=======');
    // console.log('logs object=======', { pdfFiles, wordFiles, xlsxFiles, pptFiles });

    return { pdfFiles, wordFiles, xlsxFiles, pptFiles };

  }
};



export const getConvertedPdfFileFromPhoneStorage = async () => {
  let arr = [] = [];
  const path = CONSTANT.SAVED_CONVERTED_PDF_PATH;
  // console.log('path: ' + path);

  try {
    // Check if the directory exists
    const exists = await RNFS.exists(path);
    if (!exists) {
      console.log('Directory does not exist, creating directory...');
      // If the directory doesn't exist, create it
      await RNFS.mkdir(path);
      console.log('Directory created:', path);
    }

    // Read the directory
    const result = await RNFS.readDir(path);
    result.forEach((item) => {
      if (!item.isDirectory()) {
        arr.push(item);
        console.log('File on readConvertedPDFFileFromStorage: ', item.name);
      }
    });

    // Save the file array to AsyncStorage
    await AsyncStorage.setItem(asyncStorageKeyName.CONVERTED_PDF_FILES, JSON.stringify(arr));
    console.log('Converted files array:', arr);

  } catch (error) {
    console.log('Error on pdf:', error.message);
  }

  return arr;
};

// export const createImagesToPdf = async (imagesPath: Array<string>, name: string) => {

//   try {
//     const options = {
//       imagePaths: imagesPath,
//       name: name,
//       maxSize: { // optional maximum image dimension - larger images will be resized
//         width: 900,
//         height: Math.round(Dimensions.get('window').height / Dimensions.get('window').width * 900),
//       },
//       quality: 1,
//     };
//     console.log('options', options);

//     const pdf = await RNImageToPdf.createPDFbyImages(options);

//     console.log('typeof>>>>>>>>>>', pdf.filePath);
//     return pdf.filePath

//   } catch (e) {
//     console.log('error-----', e);
//   }
// }
const shareApp = () => {
  Platform.OS == 'android' ?
    Share.open({ url: AppShare.ANDROID_SHARE_LINK, message: 'Give a shot to pdfViewer and converter', }) :
    Share.open({ url: AppShare.IOS_SHARE_LINK, message: 'Give a shot to pdfViewer and converter', })

}
export const setNavigator = (nav) => {
  navigator = nav;
};

const navigateTo = (routeName, params?, resetStack = false) => {
  if (resetStack) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      })
    );
  } else {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      })
    );
  }
};
function navigateToBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export const ConfirmPopup = (callBack: Function) => {
  Popup.show({
    type: 'confirm',
    title: 'Delete!',
    textBody: 'Do you want to delete file ',
    buttonText: 'Proceed',
    okButtonStyle: { backgroundColor: '#E50046' }, // Changes the "Ok" button color
    confirmButtonStyle: { backgroundColor: '#d3d3d3' }, // Changes the "Cancel" button color

    confirmText: 'Cancel',
    // icon:<MaterialCommunityIcons name='information-outline' color={'red'} size={20}/>,
    callback: () => {
      // alert('Okey Callback && hidden');
      callBack()
      Popup.hide();
    },
    cancelCallback: () => {
      // alert('Cancel Callback && hidden');
      Popup.hide();
    },
  })
}

export const toastForDeleteFile = (toast: any, message: string) => {
  toast.show(message, {
    type: "danger",
    placement: "bottom",
    duration: 4000,
    offset: 30,
    //icon:<MaterialCommunityIcons name='delete-outline' size={scaledSize(20)} color={'white'}/> ,
    animationType: "zoom-in",
  });
}

const getImageUriByOS = (uri: string) => {
  if (!uri) return '';

  return uri.startsWith('file://') ? uri : `file://${uri}`;
};


const DocumentPicker = async (props: S) => {
  const { isMultipleSelection = false, fileTypes = [], isBase64 = false } = props

  try {
    const res = await pick({
      allowMultiSelection: isMultipleSelection,
      // type:fileTypes,
      mode: 'open', // 👈 important
      copyTo: 'cachesDirectory', // 👈 BEST FIX
    });

    const localFiles = await keepLocalCopy({
      destination: 'cachesDirectory',
      files: res.map(file => ({
        uri: file.uri,
        fileName: file.name,
      })),
    });

    console.log('📂 Local files:', localFiles);
    // console.log('res pick===', res);

    const allValid = res.every(file => file.hasRequestedType);

    if (!allValid) {
      alert('Only PDF or DOCX files are allowed');
      return;
    }

    return localFiles;
  }
  catch (err) {
    console.log('error====', err);


  }
}

const createImagesToPdf = async (images: Array<any>,name:string) => {
  console.log('images to convert in pdf>>>>>>', images);

  try {
    if (!images || images.length === 0) {
      console.log('No images found');
      alert('No images found');
      return;
    }

    // const imagePaths: string[] = images.map((item: any) =>
    //   Platform.OS === 'ios'
    //     ? (typeof item === 'string' ? item : item.path)
    //     : (typeof item === 'string'
    //       ? item.replace('file://', '')
    //       : item.path.replace('file://', ''))
    // );

    const pages = images.map(path => ({
      imagePath:  path
    }));

    const options = {
      pages: pages,
      outputPath: `file://${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${name}.pdf`,
    };
    console.log('options', options);

    const createdPdfPath = await createPdf(options);
    // saveFileinPhoneStorage(pdf)
    console.log('pdf', createdPdfPath);
    return createdPdfPath


  } catch (e) {
    console.log('error-----', e);
  }
}

export const sortFiles = (sortType: string, files: any[]) => {
  // Create a shallow copy to avoid mutating the original array
  const sortedFiles = [...files];

  switch (sortType) {
    case 'latest':
      return sortedFiles.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());

    case 'oldest':
      return sortedFiles.sort((a, b) => new Date(a.mtime).getTime() - new Date(b.mtime).getTime());

    case 'name_asc':
      return sortedFiles.sort((a, b) => {
        const aIsNumeric = /^\d/.test(a.name);
        const bIsNumeric = /^\d/.test(b.name);

        if (aIsNumeric && !bIsNumeric) return 1; // a (numeric) comes after b (alphabetic)
        if (!aIsNumeric && bIsNumeric) return -1; // a (alphabetic) comes before b (numeric)

        return a.name.localeCompare(b.name); // both are same type
      });

    case 'name_desc':
      return sortedFiles.sort((a, b) => {
        const aIsNumeric = /^\d/.test(a.name);
        const bIsNumeric = /^\d/.test(b.name);

        if (aIsNumeric && !bIsNumeric) return 1; // a (numeric) comes after b (alphabetic)
        if (!aIsNumeric && bIsNumeric) return -1; // a (alphabetic) comes before b (numeric)

        return b.name.localeCompare(a.name); // both are same type, reverse order
      });

    case 'size':
      return sortedFiles.sort((a, b) => b.size - a.size);
    default:
      return files; // Return original if no valid sortType
  }
};

export const Utility = {
  string: {
    getFirstLetterCapitalize
  },
  date: {
    getDateFromString,
    getDateByMomentFormat,
    getMillis,
    getFirebaseTimeStampByMillis
  },
  storage: {
    setLocalData,
    getLocalData,
    removeLocalData,
    removeAllLocalData
  },
  navigation:{
    navigateToBack,
    navigateTo,
  },
  images:{
    createImagesToPdf,
    DocumentPicker,
    getImageUriByOS,
  },
  fileShare,
  shareApp,
  generateUniqueNumber,
  getFileSize,
  sortFiles,

}