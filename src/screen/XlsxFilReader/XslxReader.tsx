/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS, { readFile } from 'react-native-fs';
import { FlatList, Platform } from 'react-native';
import { Alert } from 'react-native';
import mammoth from 'mammoth';
import { WebView } from 'react-native-webview';
import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import XLSX from 'xlsx';
import { Buffer } from 'buffer'; // Ensure this is imported for base64 decoding



import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DocxGenerator from './Xlsxgenerator';
import { navigateToBack, scaledSize } from '../../utilies/Utilities';
import HeaderComponent from '../../component/CustomHeader';
import { Button } from 'react-native-elements';
import { ErrorToast } from '../../component/CustomToast';
import CustomSpinner from '../../component/CustomSpinner';

interface S {
    uri: string,
}



const XslxReader = (props: S) => {
    const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient)

    const { uri } = props?.route?.params;
    const [htmlData, setHtmlData] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedSheet, setSelectedSheet] = useState(Object.keys(htmlData)[0]);
    const [sheetsData, setSheetsData] = useState<Record<string, any[]>>({});

    useEffect(() => {
        console.log('URI', uri);
        setIsLoading(true)
        setTimeout(() => {
            convertXlsxFileToBase64(uri)

        }, 1000);

    }, [])



    useEffect(() => {
        if (sheetsData && sheetsData.SheetNames && sheetsData.SheetNames.length > 0) {
            const firstSheetName = sheetsData.SheetNames[0]; // Get the first sheet name
            const firstSheetData = htmlData[firstSheetName]; // Get the HTML content for the first sheet
            setSelectedSheet(firstSheetData); // Set the first sheet as the selected sheet
        }
    }, [sheetsData, htmlData]); // Dependencies to rerun if sheetsData or htmlSheets change


    async function convertXlsxFileToBase64(fileUri: any) {
        console.log('data start',);
        RNFS.readFile(fileUri, 'base64')
            .then(res => {
                return convertXlsxToHtmlWithSerialNumbers(res)
            });
    }


    async function convertXlsxToHtmlWithSerialNumbers(base64Data: string) {
        try {
            const binaryString = Buffer.from(base64Data, 'base64').toString('binary');
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const htmlSheets: Record<string, string> = {};

            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                let htmlTable = XLSX.utils.sheet_to_html(sheet);

                // Add serial number column and remove empty cells
                htmlTable = addSerialNumberColumn(htmlTable);

                htmlSheets[sheetName] = htmlTable;
            });

            setHtmlData(htmlSheets);
            if (workbook.SheetNames.length > 0) {
                const firstSheetName = workbook.SheetNames[0];
                console.log('Setting selected sheet:', firstSheetName); // Debugging line
                setTimeout(() => {
                    setSelectedSheet(firstSheetName);

                }, 100);
            } else {
                console.error('No sheets available in workbook');
            }
        } catch (error) {
            ErrorToast('Unsupported file ')
            navigateToBack()
            // console.error('Error converting XLSX to HTML:', error);
        }
    }


    function addSerialNumberColumn(htmlTable: string): string {
        // Split the HTML table into rows
        const rows = htmlTable.split('</tr>');

        // Iterate over the rows and add serial number, and style the header row
        const updatedRows = rows.map((row, index) => {
            // Skip empty rows
            if (!row.trim()) return '';

            // Add serial number as the first cell
            const serialNumberCell = `<td>${index + 1}</td>`;

            // Style the first row (header) as bold
            if (index == 0) {
                const updatedHeaderRow = row.replace('<tr>', `<tr>${serialNumberCell}`)
                    .replace(/<td>/g, '<td>');
                return updatedHeaderRow;
            } else {
                // For other rows, just add the serial number
                const updatedRow = row.replace('<tr>', `<tr>${serialNumberCell}`);
                const cleanedRow = updatedRow.replace(/<td>\s*<\/td>/g, ''); // Remove empty cells
                return cleanedRow;
            }
        });

        // Join the updated rows back into a table string
        return updatedRows.join('</tr>');
    }




    const defaultStyles = `
  <style>

          body, ul, li {
      font-family: 'Arial', sans-serif; /* Apply the font family to body, ul, and li */
    }
          table {
      width: 100%;
      border-collapse: collapse;
    }
    .custom-font {
      font-family: 'Times New Roman', serif; /* You can set a different font for specific elements */
    }
          ul {
      list-style-type: disc; /* Set the type of bullet point */
      margin-left: 20px; /* Indent the list from the left */
      line-height: 1.6; /* Line spacing between list items */
    }

    /* Style for list items */
    li {
      margin-bottom: 4px; /* Add margin between list items */
    }

    table, th, td {
      border: 1px solid black;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
                }
                .bold {
                    font-weight: bold;
                }
    code {
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
`;



    const getHtmlContent = () => {
        const tableContent = htmlData[selectedSheet] || ''; // Get HTML content for the selected sheet

        return `
    <html>
    <head>
        <style>
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid black; padding: 8px; min-width: 100px; } /* Adjust min-width as needed */
        th { background-color: #f2f2f2; }
        </style>
    </head>
    <body contenteditable="false">${tableContent}</body>
    </html>
    `;
    };




    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ height: scaledSize(40), flexDirection: 'row',
            backgroundColor:'white'
                ,elevation:4 }}>
               <HeaderComponent title='' onPress={async () => navigateToBack()}/>
            </View>
            <View style={{ height: scaledSize(50), width: '100%',marginTop:scaledSize(10) }}>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                   

                    {Object.keys(htmlData).map(sheetName => (
                        <View style={{  marginLeft: 4 }}>
                            <Button
                                containerStyle={{ justifyContent: 'center', alignItems: 'center' }}
                                buttonStyle={{
                                    backgroundColor: 'white',
                                    borderBottomWidth:selectedSheet === sheetName ? 2:.5,
                                    width: sheetName.length*14,
                                    height:50,
                                    borderColor: selectedSheet === sheetName ? 'green' : 'gray',
                                }}
                                titleStyle={{ color: 'black', textAlign: 'center' }}
                                key={sheetName}
                                title={sheetName}
                                onPress={() => {
                                    console.log(sheetName)
                                        , setSelectedSheet(sheetName)
                                }}

                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
                {selectedSheet ? <WebView
                    originWhitelist={['*']}
                    source={{ html: getHtmlContent() }}
                    style={{ flex: 1 }}
                /> :
<CustomSpinner isLoading={isLoading}/>
                    }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default React.memo(XslxReader);