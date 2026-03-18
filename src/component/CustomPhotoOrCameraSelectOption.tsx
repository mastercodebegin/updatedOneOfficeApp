
import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, FlatList, Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
// import { showMessage } from "react-native-flash-message";
import moment from "moment"
import ImagePicker from "react-native-image-crop-picker";
import { cameraIcon, gallery } from '../assets/GlobalImages';
import { Overlay } from 'react-native-elements';
import { scaledSize } from '../utilies/Utilities';
import { Fonts } from '../assets//fonts/GlobalFonts';
import CustomVectorIcon from './CustomVectorIcon';
import CustomHeaderGradient from './CustomHeaderGradient';
import CustomHeader from './CustomHeader';

 interface S {
  onSelectImages:Function;

  isBase64?: boolean;
  height?: number;
  title?: string;
  isShowSubmitBtn?:boolean
  titleSubmitButton?:string
  onPressSubmit?:Function

  isShowSelectPhotoModal?: boolean;
  onPressClose: () => void;

  isLeftViewRender?: boolean;

  PlusIconComponent?: React.ReactNode;

  renderImages?: boolean;
  plusIconColor?: string;
  multipleImageSelection?:boolean

  hidePlusComponentOnimageCount?: boolean;

  maxNumberFile?: number;

  images?: string[]; // change type if images are objects
}

export const CustomPhotoOrCameraSelectOption = (props: S) => {
  const {  onSelectImages, isBase64 = false, height = 80, title,
    isShowSelectPhotoModal, titleSubmitButton='Submit',isShowSubmitBtn=false,onPressSubmit=()=>{} ,
    onPressClose, isLeftViewRender, PlusIconComponent,
    renderImages = true,multipleImageSelection=false,
    plusIconColor, hidePlusComponentOnimageCount, maxNumberFile=1000, images=[] } = props;
  // const [images, setImages] = useState([])
  const [isShowPhotoOptionsModal, setIsShowPhotoOptionsModal] = useState(false)

  const width = height + 10
  useEffect(() => {
    // console.log('hidePlusComponentOnimageCount', hidePlusComponentOnimageCount);

  })

  async function openGallery() {
    ImagePicker.openPicker({
      cropping: false,
      mediaType: 'photo',
      multiple: multipleImageSelection,
      maxFiles:maxNumberFile,
      includeBase64: isBase64
    }).then(
      (res) => {
        let arr = multipleImageSelection?[...images, ...res]:[...images, res]
        console.log('gallery res=====', res);
        console.log('gallery arr=====',arr);

        // setImages(arr);
        setIsShowPhotoOptionsModal(false)
        onSelectImages(arr)

      }, (err) => console.log('opencamera error:', err)).catch(e => console.log('error----', e))
  }

  async function openCamera() {
    ImagePicker.openCamera({
      cropping: false,
      multiple:true,
      mediaType: 'photo',
      includeBase64: isBase64
    }).then(
      (res) => {
        let arr = [...images, res]
        // setImages(arr);
        setIsShowPhotoOptionsModal(false)
        onSelectImages(arr)
      }, (err) => console.log('opencamera error:', err)).catch(e => console.log('error----', e))
  }

const MediaOption=()=>{
  return(
        <Overlay isVisible={isShowPhotoOptionsModal} animationType='fade' >
        <View style={{
          height: scaledSize(200), width: scaledSize(280),
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{ flex: .4 }}>
            <Text style={{
              fontFamily: Fonts.Primary_Text, fontSize: scaledSize(14),
              letterSpacing: .5
            }}>Select File</Text>
          </View>

          <View style={{
            flexDirection: 'row',
            flex: 1, justifyContent: "flex-start",
            alignItems: 'flex-start', width: '80%'
          }}>
            <TouchableOpacity style={{
              flex: 1, justifyContent: "center",
              alignItems: 'center',
            }}
              onPress={() => openCamera()}>
              <Image source={cameraIcon}
                style={{ height: scaledSize(50), width: scaledSize(50) }} />
              <Text>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, justifyContent: "center", alignItems: 'center', }}
              onPress={() => openGallery()}
            >
              <Image source={gallery}
                style={{
                  height: scaledSize(50), width: scaledSize(50),
                  // left: scaledSize(10)
                }} />
              <Text>Gallery</Text>

            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{
            height: scaledSize(35), justifyContent: "center", borderColor: '#d7d7d7',
            alignItems: 'center', bottom: scaledSize(10), borderRadius: scaledSize(8),
            width: scaledSize(260), backgroundColor: '#f5f5f5', borderWidth: 1
          }} onPress={() => setIsShowPhotoOptionsModal(false)}>
            <Text>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Overlay> 
  )
}
const header=()=>{
  return(<View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaledSize(20),
  }}
>
  <View style={{justifyContent:'center',alignItems:'center',flex:1}}>

  <Text
    style={{
      fontSize: scaledSize(16),
      letterSpacing:1,
      fontWeight: '400',
      color: '#111',
      alignSelf:'center',
      // fontFamily:Fonts.italic
    }}
    >
    Select Photos
  </Text>
    </View>

  <TouchableOpacity
    onPress={onPressClose} // or your close function
    activeOpacity={0.8}
    style={{
      height: 36,
      width: 36,
      borderRadius: 18,
      backgroundColor: '#ECECEC',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <CustomVectorIcon
      iconLibrary="MaterialIcons"
      iconName="close"
      size={20}
      style={{ color: '#333' }}
      onPress={onPressClose}
    />
  </TouchableOpacity>
</View>)
}

  return (
    <View style={{ flex: 1, }}>
      {MediaOption()}
      <View style={{ flex: 1,  }}>
        {isLeftViewRender ? isLeftViewRender() : header()
        }

  {renderImages && (
  <View style={{ flex: 1 }}>
    <FlatList
      data={[{ isAddButton: true }, ...images]}
      keyExtractor={(_, index) => String(index)}
      horizontal
      bounces={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: scaledSize(4) }}
      renderItem={({ item, index }) => {
        const shouldHidePlus =
          typeof hidePlusComponentOnimageCount === 'number' &&
          hidePlusComponentOnimageCount === images.length;

        // 🔵 ADD BUTTON
        if (item?.isAddButton) {
          if (shouldHidePlus) return null;

          if (PlusIconComponent) return <PlusIconComponent />;

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsShowPhotoOptionsModal(true)}
              style={{
                height: height,
                width: width,
                borderRadius: scaledSize(18),
                backgroundColor: '#EEF2FF',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: scaledSize(12),
              }}
            >
              <CustomVectorIcon
              onPress={() => setIsShowPhotoOptionsModal(true)}
                iconLibrary="MaterialCommunityIcons"
                iconName="plus"
                size={height * 0.4}
                style={{ color: plusIconColor || '#4F46E5' }}
              />
            </TouchableOpacity>
          );
        }

        // 🔵 IMAGE CARD
        return (
          <View
            style={{
              height: height,
              width: width,
              marginRight: scaledSize(12),
            }}
          >
            <ImageBackground
              source={{
                uri:
                  Platform.OS === 'ios'
                    ? `file://${item?.path}`
                    : item?.path,
              }}
              resizeMode="cover"
              style={{
                flex: 1,
                borderRadius: scaledSize(18),
                overflow: 'hidden',
              }}
            />

            {/* Delete Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              // onPress={() => {
              //   const imageList = [...images];
              //   imageList.splice(index - 1, 1);
              //   onPressGallery(imageList);
              // }}
              style={{
                position: 'absolute',
                top: scaledSize(6),
                right: scaledSize(6),
                height: scaledSize(24),
                width: scaledSize(24),
                borderRadius: scaledSize(12),
                backgroundColor: 'rgba(255,255,255,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CustomVectorIcon
              onPress={() => {
                const imageList = [...images];
                imageList.splice(index - 1, 1);
                onSelectImages(imageList);
              }}
                iconLibrary="MaterialIcons"
                iconName="close"
                size={14}
                style={{ color: '#FF3B30' }}
              />
            </TouchableOpacity>
          </View>
        );
      }}
      nestedScrollEnabled
    />
  </View>
)}
{images.length > 0 && isShowSubmitBtn&& (
      <TouchableOpacity
        activeOpacity={0.85}
        // onPress={onPressConvert}   // make sure you pass this prop
        style={{
          marginTop: scaledSize(20),
          height: scaledSize(48),
          borderRadius: scaledSize(24),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#4F46E5',
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: scaledSize(14),
            fontWeight: '600',
          }}
        >
          Submit
        </Text>
      </TouchableOpacity>
    )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({

    addImage: {
      height: scaledSize(80),
      width: scaledSize(80),
      borderColor: 'red',
      borderWidth: 1,
      borderStyle: "dotted",
      borderRadius: scaledSize(15),
      justifyContent: "center",
      alignItems: "center",
      marginRight: scaledSize(10)
    },
    dropDownView: {
      height: scaledSize(50),
      margin: 0,
      marginTop: scaledSize(20)
    },
    closeContainer: {
      height: scaledSize(30),
      width: scaledSize(30),
      borderRadius: scaledSize(15),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center'
    },
    closeIcon: {
      height: '25%',
      width: '25%',
      tintColor: 'white'
    },
    imagesContainer: {
  
      borderRadius: scaledSize(15),
      marginRight: scaledSize(10),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    },
    blur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: 'black',
      opacity: 0.5
    },
    closeButton: {
      position: 'absolute',
      top: -6,  // Adjust positioning
      right: -6, // Adjust positioning
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3, // For Android shadow
    },
  
  })
  