/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {pick} from '@react-native-documents/picker';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { Alert } from 'react-native';
import mammoth from 'mammoth';
import { WebView } from 'react-native-webview';
import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'


const DocumentPicker =pick

import {
    Button,
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
import DocxGenerator from './Docxgenerator';
import { navigateToBack, scaledSize } from '../../utilies/Utilities';
import HeaderComponent from '../../component/CustomHeader';
import CustomSpinner from '../../component/CustomSpinner';

interface S{
    uri: string,
}



const WordReader = (props:S) => {
    const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient)

    const { uri} = props?.route?.params;
    const [htmlData, setHtmlData] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false)

    useEffect(() => {
        console.log('URI', uri);
        setIsLoading(true)
        setTimeout(() => {
            readDocxFile(uri)
            
        }, 1000);

    },[])



    const listFilesAndPaths = async () => {
        try {
            // Path to the document directory
            const documentDir = RNFetchBlob.fs.dirs.DocumentDir;
            console.log(documentDir);

            // List all files in the document directory
            const files = await RNFetchBlob.fs.ls(documentDir);

            // Map file names to their full paths
            const filePaths = files.map(file => `${documentDir}/${file}`);

            console.log('File paths:', files);
            // convert
            readDocxFile(filePaths[0])
            return filePaths;
        } catch (error) {
            console.error('Error listing files:', error);
        }
    };

    const openFile = async () => {
        try {
            const res = await DocumentPicker.pickSingle({

                // type: DocumentPicker.types.pdf
            })
            console.log('response-----', res.uri);
           // readDocxFile(res.uri)
        }
        catch (error) {
            console.log('openFile error-----', error);
        }
    }
    async function readDocxFile(fileUri: any) {
        console.log('data start',);
        RNFS.readFile(fileUri, 'base64')
            .then(res => {
                return convertDocxToHtml(res)
            });
    }

    async function convertDocxToHtml(base64Data: any) {
        console.log('convertDocxToHtml');

        const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;

        const result = await mammoth.convertToHtml({ arrayBuffer });
        // console.log('result', result);

        setHtmlData(result.value)
        setIsLoading(false)
        return result.value; // The HTML content
    }

    //********************* We will check letter after reading all files  we need just convert XML TO HTML 

    // async function convertDocxToHtml(base64Data: any) {
    //     console.log('convertDocxToHtml');

    //     const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
    //     console.log('buffer---', arrayBuffer);

    //     const result = await mammoth.convertToHtml({ arrayBuffer });

    //     const zip = await JSZip.loadAsync(arrayBuffer);
    //     const xmlWordData = await zip.file('word/document.xml').async('text');
    //     console.log('zip result',);

    //     const result = await parseStringPromise(xmlData);

    //     console.log('parseStringPromise result', result);
    //     const data = await transformXmlToHtml(xmlWordData)
    //     console.log('converted xml to html data',data);

    //     setHtmlData(result.value)
    //     return result.value; // The HTML content
    // }




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



    const htmlContent = `
        <html>
        <head>${defaultStyles}</head>
        <body contenteditable="false">${htmlData}</body>
        </html>
      `;

    const webviewRef = React.useRef(null);
    const handleGetEditedContent = () => {
        webviewRef.current.injectJavaScript(`
      window.ReactNativeWebView.postMessage(document.body.innerHTML);
    `);
    };

    const handleSaveEditedContent = async (editedContent: any) => {
        const filePath = await saveHtmlToFile(editedContent);
        Alert.alert('File Saved', `The edited content has been saved to ${filePath}`);
    };


    const saveHtmlToFile = async (htmlContent: any) => {
        try {
            // Determine the path to save the file
            const dirs = RNFetchBlob.fs.dirs;
            const filePath = `${dirs.DocumentDir}/edited_document.html`;

            // Write the HTML content to the file
            await RNFetchBlob.fs.writeFile(filePath, htmlContent, 'utf8');

            Alert.alert('Success', `File saved at: ${filePath}`);

            // Optionally, return the file path if you need to do something with it
            return filePath;
        } catch (error) {
            console.error('Error saving file:', error);
            Alert.alert('Error', 'Failed to save file.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1,backgroundColor:'white' }}>
            <View style={{ height: scaledSize(40), flexDirection: 'row',
            backgroundColor:'white'
                ,elevation:4 }}>
               <HeaderComponent title='' onPress={async () => navigateToBack()}/>
            </View>
            <View style={{ flex: 1, padding: isLoading?scaledSize(0):scaledSize(14) }}>
                {htmlData ? (
                    <WebView
                        ref={webviewRef}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        originWhitelist={['*']}
                        source={{ html: htmlContent }}
                        onMessage={(event) => {
                            const editedContent = event.nativeEvent.data;
                            handleSaveEditedContent(editedContent);
                        }}
                        // showsHorizontalScrollIndicator={false}
                        // showsVerticalScrollIndicator={false}
                        scalesPageToFit={true}
                    />

                ) : 

<CustomSpinner isLoading={isLoading}/>
                 
                }
            </View>
            {/* <View style={{flex:1,backgroundColor:'red',}}>

      <DocxGenerator htmlContent={htmlString}/>
      </View> */}
        </SafeAreaView>
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

export default React.memo(WordReader);