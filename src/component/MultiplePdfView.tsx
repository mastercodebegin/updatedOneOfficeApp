import { StackActions } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, BackHandler, Animated, Linking, ScrollView } from 'react-native'
import Pdf from 'react-native-pdf';
import { fileShare, generateUniqueNumber, navigateToBack, scaledSize } from '../utilies/Utilities';

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
  const response = useSelector((state) => state.FileSlice);

  const pdfArr = props?.route?.params
  const dispatch = useDispatch()
  // useEffect(() => {
  //   console.log('pdfArr======', response)
  //   setSelectedSheet(pdfArr[0])
  // }, [pdfArr]);

  useEffect(() => {
    console.log('files======', response.files);
    setSelectedSheet(response.files[0])
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
    Linking.getInitialURL = async () => null;
    navigateToBack()
  }
  const headerComp = () => {
    return (
      <View style={{
        height: scaledSize(30),
        marginRight: scaledSize(0),
        justifyContent: 'space-between', zIndex: 99,
        flexDirection: 'row',
      }}>
        


        <CustomLinearGradientView colors={['white','white']}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flexDirection: 'row', flex: 1, }}>
              <TouchableOpacity style={{
                height: scaledSize(20),
                width: scaledSize(30),
                 borderRadius: scaledSize(30),
                marginTop: scaledSize(6), marginLeft: scaledSize(10)
              }} onPress={() => onPressCloseHandler()} >
                <CustomBackIcon onPress={onPressCloseHandler} size={22} color='black' />
              </TouchableOpacity>
            </View>


            {selectedSheet?.path &&
              <View
                style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                {/* {isMultiView ? */}

                  <CustomVectorIcon 
                  iconName={isMultiView ? 'phone-rotate-landscape' : 'screen-rotation'} 
                  iconLibrary='MaterialCommunityIcons'
                    style={{ color: COLORS.THEME_COLOR, fontSize: scaledSize(20), top: scaledSize(2) }}
                    onPress={() => { setIsMultiView(!isMultiView) }} />

                  {/* :
                  <CustomVectorIcon iconName='screen-rotation' iconLibrary='FontAwesome5'
                    style={{ color: 'black', fontSize: scaledSize(25), bottom: scaledSize(4) }}
                    onPress={() => { setIsMultiView(!isMultiView) }} />} */}

              </View>}
          </View>

        </CustomLinearGradientView>

      </View>
    )


  }

  const renderItem = ({ item, index }) => {
    return (<Button
      containerStyle={{ justifyContent: 'center', alignItems: 'center' }}
      buttonStyle={{
        backgroundColor: 'white',
        marginLeft: index == 0 ? 0 : scaledSize(10),
        borderBottomWidth: selectedSheet.name === item.name ? 2 : .5,
        borderColor: selectedSheet.name === item.name ? 'green' : 'gray',
      }}
      titleStyle={{ color: 'black', textAlign: 'center' }}
      key={generateUniqueNumber()}
      title={item.name.slice(0, 15)}
      onPress={() => {
        console.log('sheetName')
        setSelectedSheet(item)

      }} />)
  }
  const onErrorHandler = (val) => {
    console.log('error=================', val);

    CustomErrorToast('We dont support password protected file')
    navigateToBack()
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
                data={response.files}
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
                onErrorHandler('')
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
              }}
              source={{ uri: selectedSheet?.path }}

              style={styles.pdf} />
          </View>
          :
          <View style={{ backgroundColor: 'red', marginTop: 10 }}>

            <View style={{
              backgroundColor: 'yellow',
              height: scaledSize(320),
              borderBottomWidth: 2, borderColor: 'gray'
            }}>

              <Pdf
                onScaleChanged={(v) => console.log('changed================================', v)
                }
                trustAllCerts={false}
                onError={() => onErrorHandler('second')}
                maxScale={100}

                onPressLink={(uri) => {
                  console.log(`Link pressed: ${uri}`);
                }}
                source={{ uri: response.files[0].path }}

                style={styles.pdf} />
            </View>

            <View style={{
              backgroundColor: 'yellow', height: scaledSize(350),
              borderColor: 'black'
            }}>

              <Pdf
                onScaleChanged={(v) => console.log('changed================================', v)
                }
                trustAllCerts={false}
                onError={() => onErrorHandler('third')}
                maxScale={100}

                onPressLink={(uri) => {
                  console.log(`Link pressed: ${uri}`);
                }}
                source={{ uri: response.files[1].path }}

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

      {selectedSheet.path ? renderMultiPdf() : null}
      {!isAddClosed?<View style={{ height: scaledSize(40) }}>
        <CustomBannerAdd onPressAddClose={()=>console.log('closed')
        } />
      </View>:<></>}
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
    backgroundColor: 'white'
  },
  pdf: {
    flex: 1,
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
  }
});

export default MultiplePdfView