import * as React from 'react';
import { Image } from 'react-native'
import { Axis, BOB, BOI, Canera, HDFC, IDFC, Icici, Indusind, Kotak, PNB, RBL, SBI, YesBank } from '../assets/GlobalImages';
import { scaledSize } from './Utilities';
import { COLORS } from './GlobalColors';
import RNFS from 'react-native-fs';

const name = 'Mohd Amir'
const passwordCap = 'MOHD0305'
const passwordSma = 'mohd0305'
export const AdmobCons = {
    ANDROID_APP_ID: 'ca-app-pub-2575560727390585/1525499969',
    REWARDED_ADD_ID: 'ca-app-pub-9671238558838795/7905096163',
    BANNER_ADD_ID: 'ca-app-pub-2575560727390585/1525499969'
}

export const AppShare = {
    ANDROID_SHARE_LINK: `https://play.google.com/store/apps/details?id=com.shopax.pdfviewer`,
    IOS_SHARE_LINK: 'https://play.google.com/store/apps'
}
const PACKAGE_NAME = 'com.shopax.pdfviewer'
export const CONSTANT = {
    // PACKAGE_NAME: 'com.shopax.pdfviewer'
    PACKAGE_NAME: 'com.shopax.pdfviewer',
    S3_URL: 'https://shopax.s3.eu-north-1.amazonaws.com/',
    SAVED_CONVERTED_PDF_PATH: `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/pdfs`,
    SAVED_DOCUMENTS_PATH:`/storage/emulated/0/Android/data/${PACKAGE_NAME}/documents/`,
    ASYNC_STORAGE_STRING_INTO_JSON_BAKUP_PATH: `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/bakup`,
    BACKUP_PATH:`${RNFS.DownloadDirectoryPath}`,
    MEDIA_PERMISSION_TITLE: 'To access your media files, please allow the app to access your media location.',
    CAMERA_PERMISSION_TITLE: 'To access your camera, please allow the app to access your camera.',
    ANDROID_SHARE_LINK: `https://play.google.com/store/apps/details?id=com.shopax.pdfviewer`,
    IOS_SHARE_LINK: 'https://play.google.com/store/apps'


}


const style = {
    height: scaledSize(16),
    width: scaledSize(16),
}
// export const banksName = {
//     AXIS: 'Axis',
//     BOB: 'Bank_Of_Baroda',
//     HDFC: 'Hdfc',
//     ICICI: 'ICICI',
//     INDUSIND: 'Indusind',
//     RBL: 'RBL',
//     SBI: 'State bank of india',
//     BOI: 'Bank of india',
//     CANERA: 'Canera',
//     KOTAK: 'Kotak',
//     PNB: 'PNB',
//     IDFC: 'IDFC',
//     YESBANK: 'YesBank',

// }

// export const banks = {
//   AXIS: { name: "axis", label: "Axis Bank" },
//   BOB: { name: "bob", label: "Bank of Baroda" },
//   HDFC: { name: "hdfc", label: "HDFC Bank" },
//   ICICI: { name: "icici", label: "ICICI Bank" },
//   INDUSIND: { name: "indusind", label: "IndusInd Bank" },
//   RBL: { name: "rbl", label: "RBL Bank" },
//   SBI: { name: "sbi", label: "State Bank of India" },
//   BOI: { name: "boi", label: "Bank of India" },
//   CANERA: { name: "canera", label: "Canara Bank" },
//   KOTAK: { name: "kotak", label: "Kotak Bank" },
//   PNB: { name: "pnb", label: "Punjab National Bank" },
//   IDFC: { name: "idfc", label: "IDFC First Bank" },
//   YESBANK: { name: "yesbank", label: "Yes Bank" },
// };

export const BANK_LOGOS = {
  Axis: Axis,
  BOB: BOB,
  HDFC: HDFC,
  BOI: BOI,
  CANERA: Canera,
  ICICI: Icici,
  INDUSIND: Indusind,
  Kotak: Kotak,
  PNB: PNB,
  RBL: RBL,
  SBI: SBI,
  YesBank: YesBank,
  IDFC: IDFC,
};

export const asyncStorageKeyName = {
    PDF_FILES: 'PDF_FILES',
    WORD_FILES: 'WORD_FILES',
    XLSX_FILES: 'XLSX_FILES',
    PPT_FILES: 'PPT_FILES',
    CONVERTED_PDF_FILES: 'CONVERTED_PDF_FILES',
    SAVED_USERS: 'USERS1',
    ALL_FILES: 'ALL_FILES',
    DOCUMENTS: 'DOCUMENTS',
    DRIVE_FOLDER_NAME:'ONE-OFFICE',
    DRIVE_FOLDER_ID:'DRIVE_FOLDER_ID',
    LAST_SYNC_TIME : 'LAST_SYNC_TIME'
}


const bankIconList = [
    { name: 'HDFC', icon: HDFC },
    { name: 'ICICI', icon: Icici },
    { name: 'PNB', icon: PNB },
    { name: 'IDFC', icon: IDFC },
    { name: 'YesBank', icon: YesBank },
    { name: 'SBI', icon: SBI },
    { name: 'AXIS', icon: Axis },
    { name: 'BOB', icon: BOB },
    { name: 'INDUSIND', icon: Indusind },
    { name: 'KOTAK', icon: Kotak },
    { name: 'RBL', icon: RBL },
    { name: 'CANERA', icon: Canera },
    { name: 'BOI', icon: BOI }

]
export const getBankIconByName = (name: string) => {
    console.log('name', name);

    const icon = bankIconList.find(item => item.name.toLocaleLowerCase() == name.toLocaleLowerCase());
    return icon?.icon
}

export const DateFormat = {
    DAY_NAME: 'dddd',
    MONTH_NAME: 'MMMM',
    DAY_OF_MONTH: 'D',
    CURRENT_MONTH: 'M',
    YEAR: 'YYYY',
    DDMMYYYY: 'DDMMYYYY',
    DATE_WITH_TIME_AM_PM: 'DD-MM-YYYY hh:mm A',
    DATE_WITH_TIME: 'DDMMYYYY hh:mm ',
    DDMMYYYY_WITH_HYPEN_SEPERATOR: 'DD-MM-YYYY',
    DDMMYYYY_WITH_SLASH_SEPERATOR: 'DD/MM/YYYY',
    DDMMYYYY_WITH_SPACE_SEPERATOR: 'DD MM YYYY',
    DATE_WITH_MONTH_NAME: 'MMMM Do YYYY'

}
