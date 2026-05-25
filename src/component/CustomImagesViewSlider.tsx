import { View, Text, Modal, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { scaledSize, Utility } from '../utilies/Utilities'
import ImageViewer from 'react-native-image-zoom-viewer';
import CustomHeader from './CustomHeader';
import { useTheme } from '../screen/theme/useTheme';
import { CONSTANT } from '../utilies/Constants';

interface S {
    isVisible: boolean
    imageUrls: Array<string>
    onPressBack: Function
    onShare: Function
    currentImageUri: Function
    title: any;
    isBackIconHide?: boolean;
    isCloseIconShow?: boolean;
    isHeaderTransparent?: boolean
    isShareIconShow?: boolean
    onPressCloseIcon?: () => any;
}

export default function CustomImagesViewSlider(props: S) {

    const [imagePath, setImagePath] = useState('')
    const [title, setTitle] = useState('')
    const { isVisible, imageUrls = [], onPressBack = () => { }, onShare = () => { }, currentImageUri = () => { },
        isShareIconShow = false, isHeaderTransparent = true, isBackIconHide = true,
        isCloseIconShow = false } = props
    const { theme, mode } = useTheme()



    return (
        <Modal visible={isVisible} style={{ flex: 1, }}
            contentContainerStyle={{ backgroundColor: 'red' }}
        >
            {/* <SafeAreaView style={{
          height: scaledSize(800), width: '100%',

        }}> */}
            <View style={{
                height: scaledSize(60), width: '100%', backgroundColor: 'black',
                justifyContent: 'space-between', alignItems: 'center',
                flexDirection: 'row', marginTop: scaledSize(0), borderBottomWidth: 1,
            }}>
                <CustomHeader isHeaderTransparent={true}
                    onPressBack={() => onPressBack()} title={imageUrls.length>0?title.length>0?title:imageUrls[0].displayName:''} isShareIconShow={isShareIconShow}
                    isCloseIconShow={isCloseIconShow}
                    isBackIconHide={isBackIconHide} onShare={() => onShare(imagePath)} />
            </View>

            <ImageViewer
                imageUrls={imageUrls.map(item => ({
                    url: Utility.images.getImageUriByOS(
                        CONSTANT.SAVED_DOCUMENTS_PATH + item.name
                    )
                }))}

                style={{
                    height: '100%',
                    width: '100%',
                }}

                onChange={(index) => {
                    if (index != null) {
                        console.log('path set',index);
                        
                        setImagePath(imageUrls[index]);
                        setTitle(imageUrls[index].displayName)
                    }
                }}
            />



            {/* </SafeAreaView> */}
        </Modal>

    )
}