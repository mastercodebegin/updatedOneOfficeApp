import { StackActions } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, BackHandler,Animated, Linking } from 'react-native'
import Pdf from 'react-native-pdf';
import { fileShare, heightFromPercentage, navigateToBack, scaledSize } from '../utilies/Utilities';

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

const PdfViewer = (props: any) => {
  const [text, setText] = useState('')
  const [errorMsg, setErrorMsg] = useState('Please Enter password')
  const [num, setNumber] = useState(0)
  const [visible, setVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [source, setSource] = React.useState({ uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true });
  const opacity = useRef(new Animated.Value( 4)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1, // Fade in or out
      duration: 1000, // Adjust duration for slower animation
      useNativeDriver: true,
    }).start();
  }, [visible, currentPage]);

  const onAndroidSharePress = async () => {
    RNFetchBlob.fs
      .readFile(props?.data, 'base64')
      .then(async (data) => {
        Share.open({
          filename: 'PdfName',
          url: 'data:application/pdf;base64,' + data
        })
      })
      .catch((err) => { });
  }

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
      <Animated.View style={{
        height: scaledSize(50),
        // marginRight: scaledSize(20),
        justifyContent: 'space-between', zIndex: 99,
        flexDirection: 'row',
        marginTop:heightFromPercentage(2),
      }}>

         <>
        <TouchableOpacity onPress={() => onPressCloseHandler()}>
          <View style={{
            height: scaledSize(30),
            width: scaledSize(30), borderRadius: scaledSize(30),
            marginTop: scaledSize(6), marginLeft: scaledSize(10)
          }} >
            <CustomBackIcon onPress={onPressCloseHandler} size={22} />
          </View>
        </TouchableOpacity>

          <TouchableOpacity onPress={() => fileShare(props?.route?.params?.uri, props?.route?.params?.name)}>
            <View style={{
              height: scaledSize(30),
              width: scaledSize(30),
              borderRadius: scaledSize(30),
              marginTop: scaledSize(6)
            }} >
              <Entypo name='share' size={scaledSize(24)} color={'black'} />
            </View>
          </TouchableOpacity></>
      </Animated.View>
        )

    
  }

  return (

    <View style={[styles.container]}>
        {!visible && currentPage==1 ? headerComp() : <></>}
      <View style={{ flex: 1 }}>

        {!visible ?
          <Pdf
            onScaleChanged={(v) => console.log('changed================================', v)
            }
            trustAllCerts={false}
            password={text}
            maxScale={100}
            onPressLink={(uri) => {
              console.log(`Link pressed: ${uri}`);
            }}
             source={{ uri: props.route.params.uri }}
            onError={(error) => {
              PdfPasswordErrorHandler(error)
            }}
            onPageChanged={(page, numberOfPages) => {
              setTotalPage(numberOfPages)
              setCurrentPage(page)
              console.log(`Current page: ${page}${numberOfPages}`);
            }}
            style={styles.pdf} />

          :
          <ModalView
            visible={!visible}
            errorRecognize={text}
            errorMessage={errorMsg}
            onText={onChangeText}
            num={num}
            onPressOkay={onPressOkayHandler}
            onPressClose={onPressCloseHandler}
            close={'CLOSE'}
            open={'OPEN'} />
        }
      </View>
      {/* <View style={{height:80,width:'100%',top:20}}>
        <BannerAddMob/>

        </View> */}

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
  },
  pdf: {
    flex: 1,
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
  }
});

export default PdfViewer