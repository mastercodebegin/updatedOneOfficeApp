import { StackActions } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, BackHandler, Animated, Linking, ScrollView } from 'react-native'
import Pdf from 'react-native-pdf';
import { heightFromPercentage, scaledSize, Utility } from '../utilies/Utilities';

import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import { deviceBasedDynamicDimension } from '../utilies/scale';
import { COLORS } from "../utilies/GlobalColors";
import ModalView from './ModalViewForPdfPassword';
import { Button } from 'react-native-elements';
import BannerAddMob from './admob/CustomBannerAdd';
import CustomMenu from './Menu';
import Entypo from 'react-native-vector-icons/Entypo';
import { backIcon, share } from '../assets/GlobalImages';
import CustomBannerAdd from './admob/CustomBannerAdd';
import CustomBackIcon from './CustomBackIcon';
import { FlatList } from 'react-native';
import CustomVectorIcon from './CustomVectorIcon';
import CustomLinearGradientView from './CustomLinearGradientView';
import { useDispatch, useSelector } from 'react-redux';
import { CustomErrorToast, CustomSuccessToast } from './CustomToast';
import MaterialCommunityIcons from 'react-native-vector-icons'
import { clearSelectedFiles, updateFilesPassword } from '../screen/dashboard/FileSlice';
import CustomMultiplePdfPasswordModal from './CustomMultiplePdfPasswordModal';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface S {
  pdfArr: Array<any>
}
const MultiplePdfView = (props: S) => {
  const [text, setText] = useState('')
  const [errorMsg, setErrorMsg] = useState('Please Enter password')
  const [num, setNumber] = useState(0)
  const [visible, setVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [source, setSource] = React.useState({ uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true });
  const opacity = useRef(new Animated.Value(4)).current;
  const [selectedSheet, setSelectedSheet] = useState({})
  const [isMultiView, setIsMultiView] = useState(false)
  const [isAddClosed, setIsAddClosed] = useState(false)
  const [isShowPasswordModal, setIsShowPasswordModal] = useState(false)
  const [protectedFiles, setProtectedFiles] = useState([])
  // const [filePasswords, setFilePasswords] = useState([])
  const pdfArr = props?.route?.params
  const dispatch = useDispatch()
  const { selectedFiles,filePasswords } = useSelector((state) => state.FileSlice);
  // useEffect(() => {
  //   console.log('pdfArr======', response)
  //   setSelectedSheet(pdfArr[0])
  // }, [pdfArr]);

  useEffect(() => {
    console.log('files======', selectedFiles);
    setSelectedSheet(selectedFiles[0])
  }, [])

  const onChangeText = (value: any) => {
    //  console.log('Password is ', value)

    setText(value)
  }

  const PdfPasswordErrorHandler = (error) => {
    setNumber((prev) => prev + 1)
    setVisible(true)

  }

  const onPressOkayHandler = () => {
    console.log('text-------', text);

    if (text.length == 0) {
      alert('Please Enter password')
      return false
    }
    else {
      text.length > 0 && setVisible(false)
    }
  }
  const onPressCloseHandler = () => {
    setNumber(0), setVisible(false)
    //props.navigation.goBack()
    dispatch(clearSelectedFiles([]))
    Linking.getInitialURL = async () => null;
    Utility.navigation.navigateToBack()
  }
  const headerComp = () => {
    return (
      <View style={{
        height: scaledSize(40),
        marginRight: scaledSize(0),
        justifyContent: 'space-between',
        zIndex: 99, marginTop: heightFromPercentage(2),
        flexDirection: 'row',
      }}>



        <View style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{ flexDirection: 'row', flex: 1, }}>
            <TouchableOpacity style={{
              height: scaledSize(20),
              width: scaledSize(30),
              borderRadius: scaledSize(30),
              marginLeft: scaledSize(10)
            }} onPress={() => onPressCloseHandler()} >
              <CustomBackIcon onPress={onPressCloseHandler} size={22} color='black' />
            </TouchableOpacity>
          </View>


          <CustomVectorIcon
            iconName={isMultiView ? 'phone-rotate-landscape' : 'screen-rotation'}
            iconLibrary='MaterialCommunityIcons'
            style={{
              color: COLORS.THEME_COLOR, fontSize: scaledSize(20),
              right: 30
            }}
            onPress={() => { setIsMultiView(!isMultiView) }} />

        </View>


      </View>
    )


  }

  const renderItem = ({ item, index }) => {
    return (<Button
      containerStyle={{ justifyContent: 'center', alignItems: 'center', }}
      buttonStyle={{
        // backgroundColor: 'white',
        backgroundColor: 'transparent',
        paddingLeft: scaledSize(10), height: 40,
        marginLeft: index == 0 ? 0 : scaledSize(10),
        borderBottomWidth: selectedSheet.name === item.name ? 2 : .5,
        borderColor: selectedSheet.name === item.name ? 'green' : 'gray',
      }}
      titleStyle={{ color: 'black', textAlign: 'center' }}
      key={Utility.generateUniqueNumber()}
      title={item.name.slice(0, 15)}
      onPress={() => {
        console.log('sheetName')
        setSelectedSheet(item)

      }} />)
  }
  // const onErrorHandlerm = (val) => {

  //   setIsShowPasswordModal(true)
  // }
  const onErrorHandler = (item) => {

    const file = protectedFiles.find((file) => file.path == item.path)
    if (!file) {
      setProtectedFiles((prev) => [...prev, item])
    }
    setIsShowPasswordModal(true);
  };
  const getPasswordForSelectedSheet = (currentFile) => {
    console.log('selectedfile===',selectedFiles);
    console.log('selectedSheet===',selectedSheet);
    console.log('filePasswords===',filePasswords);
    
    const file = filePasswords.find((file) => file.id == currentFile?.id)
    const file2 = filePasswords.find((file) => file.id == selectedSheet?.id)
    console.log('file===', file);

    return file?.pass || file2?.pass||''
  }
  const renderMultiPdf = () => {
    return (
      <View style={{ flex: 1 }}>
        {isMultiView ?
          <View style={{ flex: 1 }}>
            <View style={{
              marginTop: scaledSize(2), justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'
            }}>
              <FlatList
                horizontal
                data={selectedFiles}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />

            </View>
            <Pdf
              onScaleChanged={(v) => console.log('changed================================', v)
              }
              trustAllCerts={false}
              maxScale={100}
              onError={(v) => {
                onErrorHandler(selectedFiles[1])
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
              }} password={getPasswordForSelectedSheet(selectedFiles)}
              source={{ uri: selectedSheet?.path }}
              style={styles.pdf} />
          </View>
          :
          <View style={{}}>

            <View style={{
              backgroundColor: 'yellow',
              height: heightFromPercentage(45),
              // borderBottomWidth: 2, borderColor: 'green'
            }}>

              <Pdf
                onScaleChanged={(v) => console.log('changed================================', v)
                }
                trustAllCerts={false}
                onError={() => onErrorHandler(selectedFiles[0])}
                maxScale={100}

                onPressLink={(uri) => {
                  console.log(`Link pressed: ${uri}`);
                }}
                password={getPasswordForSelectedSheet(selectedFiles[0])}
                source={{ uri: selectedFiles[0].path }}

                style={styles.pdf} />
            </View>
            <View style={{ height: scaledSize(5), backgroundColor: '#d3d3d3' }}></View>

            <View style={{
              backgroundColor: 'yellow',
              height: heightFromPercentage(45),
              borderColor: 'black'
            }}>

              <Pdf
                onScaleChanged={(v) => console.log('changed================================', v)
                }
                trustAllCerts={false}
                password={getPasswordForSelectedSheet(selectedFiles[1])}

                onError={() => onErrorHandler(selectedFiles[1])}
                maxScale={100}

                onPressLink={(uri) => {
                  console.log(`Link pressed: ${uri}`);
                }}
                source={{ uri: selectedFiles[1].path }}

                style={styles.pdf} />
            </View>

          </View>
        }
      </View>
    )
  }
  return (

    <View style={[styles.container]}>
      {headerComp()}

      {selectedSheet?.path ? renderMultiPdf() : null}
      {isShowPasswordModal && (
        <CustomMultiplePdfPasswordModal
          visible={isShowPasswordModal}
          files={selectedFiles}
          onClose={() => setIsShowPasswordModal(false)}
          onSubmit={(v) => {
            console.log('v==',v);
            
            dispatch(updateFilesPassword(v)),
            setIsShowPasswordModal(false)}}
          protectedFiles={protectedFiles}
        />
      )}

      {/* {!isAddClosed?<View style={{ height: scaledSize(40) }}>
        <CustomBannerAdd onPressAddClose={()=>console.log('closed')
        } />
      </View>:<></>} */}
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    // marginTop: scaledSize(25),
    //marginBottom:150
    // backgroundColor: 'white'
  },
  pdf: {
    flex: 1,
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
  }
});

export default MultiplePdfView