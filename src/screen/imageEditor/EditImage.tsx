import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, FlatList, Text, Modal, TouchableHighlight, SafeAreaView, Alert, ScrollView } from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    PinchGestureHandler,
    RotationGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import RNFS from 'react-native-fs';

import { Button } from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomeButton from '../../component/CustomButton';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';

import { generateUniqueNumber, getImageUriByOS, scaledSize } from '../../utilies/Utilities';
import { Fonts } from '../../assets/fonts/GlobalFonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../component/CustomBottomSheet';
import RangeSlider from 'rn-range-slider';
import { COLORS } from '../../utilies/GlobalColors';
import SignatureScreen from "react-native-signature-canvas";
import CustomBackIcon from '../../component/CustomBackIcon';
import RNPhotoManipulator from 'react-native-photo-manipulator';
// import ImageResizer from '@bam.tech/react-native-image-resizer';
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import CustomRangeSlider from '../../component/CustomRangeSlider';

interface S {
    onPressBack: Function
    imageUri: string
    signaturePath: Function
}
const ImageOverlay = (props: S) => {
    const { onPressBack, imageUri } = props;
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [isShowSignatureModal, setIsShowSignatureModal] = useState(false);
    const [isShowSignatureColorModal, setIsShowSignatureColorModal] = useState(false);
    const [overlayImage, setOverlayImage] = useState('');
    const [signaturePath, setSignaturePath] = useState('');
    const [overlayImageSize, setOverlayImageSize] = useState(100);
    const [editedImage, setEditedImage] = useState('file:///data/user/0/com.shopax.pdfviewer/cache/5362f566-53d6-4968-8012-14e3d4b9b983/1000000040.jpg');
    const refForSignature = useRef<BottomSheetModal>(null);
    // Shared values for movement, scaling, and rotation
    const scale = useSharedValue(1); // Initially set the scale to 1 (normal size)
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotateZ = useSharedValue(0); // For rotation
    const ref = useRef();
    const [text, setText] = useState('');
    const [penColor, setPenColor] = useState('red');
    const [penSize, setPensize] = useState(1);
    const [writtenSignature, setWrittenSignature] = useState('');

    useEffect(() => {
        // console.log('param', imageUri);
        // console.log('param', onPressBack);
        // setEditedImage(editedImage);
        // console.log(props);

        // setEditedImage(getImageUriByOS(props.imageUri));
        //     if(writtenSignature && !isShowSignatureModal )
        { setWrittenSignature('') }


    }, [writtenSignature])

    useEffect(() => {
        setEditedImage(getImageUriByOS(imageUri))
    }, [])


    const combineSignaturewithImage = async () => {
        console.log('translateX', translateX);
        console.log('translateY', translateY);


        const position = { x: 50, y: 50 }; // Position on background
        const overlayWidth = 200;
        const overlayHeight = 200;
        const downloadPath = `${RNFS.DownloadDirectoryPath}/combined_image.png`;
        const downloadPath1 = `${RNFS.DownloadDirectoryPath}/12image.png`;


        try {

            if (downloadPath1) {
                await RNFS.unlink(downloadPath1);
                console.log("Previous file deleted.");
            }
        }
        catch (error) {
            console.error("Error deleting previous file:", error);
        }
        try {

            if (downloadPath) {
                await RNFS.unlink(downloadPath);
                console.log("Previous file deleted.");
            }
        }
        catch (error) {
            console.error("Error deleting previous file:", error);
        }

        try {
            // Step 1: Resize the overlay image using ImageResizer
            // const resizedOverlay = await ImageResizer.createResizedImage(
            //     overlayImage,
            //     overlayWidth,
            //     overlayHeight,
            //     'JPEG',
            //     100


            // );
            // console.log('resizedOverlay', resizedOverlay);
            console.log('resizedOverlay', overlayImage);

            // Step 2: Overlay the resized image on the background
            const resultUri = await RNPhotoManipulator.overlayImage(editedImage, resizedOverlay.uri, position);

            await RNFS.copyFile(resizedOverlay.uri, downloadPath1);
            await RNFS.copyFile(resultUri, downloadPath);

            setEditedImage(resultUri); // Result URI of the combined image
        } catch (error) {
            console.error("Error resizing and overlaying images:", error);
        }
    };

    // Handle pan gesture for dragging the image
    const panGestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = translateX.value;
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            translateX.value = ctx.startX + event.translationX;
            translateY.value = ctx.startY + event.translationY;
        },
    });

    // Handle pinch gesture for scaling the image
    const pinchGestureHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            // Use event.scale directly to update the scale value
            scale.value = event.scale;
        },
    });

    // Handle rotation gesture for rotating the image
    const rotationGestureHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            rotateZ.value = event.rotation;
        },
    });

    // Animated styles for the overlay image
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }, // Apply scaling here
            { rotateZ: `${rotateZ.value}rad` }, // Convert rotation to radians
        ],
    }));

    const openFile = async () => {
        refForSignature.current?.close()
        try {
            // const res = await DocumentPicker.pickSingle({
            //     copyTo: 'cachesDirectory',
            //     type: [DocumentPicker.types.images,]
            // })
            ImagePicker.openPicker({
                width: 300,
                height: 400,
                cropping: true,
                freeStyleCropEnabled: true,

            }).then(res => {
                console.log(res.filename);
                // console.log('response-----', res);
                // i want a file extension
                const fileExtension = res.path.split('.').pop()
                console.log('fileExtension--------------', res);
                console.log('fileExtension--------------', fileExtension);
                setOverlayImage(res.path)
                setOverlayVisible(true)
                setIsShowSignatureModal(false)
            });


        }
        catch (error) {
            console.log('openFile error-----', error);
        }
    }
    const openSignatureModal = () => {
        refForSignature.current?.present()
        // setIsShowSignatureModal(true)
    }
    const size = 26
    const editImageOptions = [
        // { title: 'Signature', onPress: () => openFile(), icon: <MaterialCommunityIcons name='sticker-emoji' size={size} color={COLORS.THEME_COLOR} /> },
        { title: 'Signature', onPress: () => openSignatureModal(), icon: <AntDesign name='edit' color={COLORS.THEME_COLOR} size={scaledSize(20)} /> },
        { title: 'Text', onPress: () => openFile(), icon: <MaterialCommunityIcons name='format-text' size={size} color={COLORS.THEME_COLOR} /> },
    ]

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={item.onPress}
                style={{
                    height: scaledSize(28), width: scaledSize(28), borderRadius: scaledSize(2),
                    backgroundColor: 'white', marginLeft: scaledSize(20), justifyContent: 'center', alignItems: 'center'
                }}>
                {/* <Text style={{fontSize:scaledSize(14),fontFamily:Fonts.bold}}>{item.title}</Text> */}
                {item.icon}
            </TouchableOpacity>
        )
    }

    const showSignatureCanvas = () => {
        setIsShowSignatureModal(true)
        refForSignature.current?.close()
        // alert('Show Signature Canvas')
    }
    const renderSignatureBottomSheet = () => {
        return (
            <CustomBottomSheet title={'Signature'} bottomShitSnapPoints={['20%', '25%', '30%']}
                ref={refForSignature} onClose={() => refForSignature.current?.close()}  >
                <View style={{ height: scaledSize(60), justifyContent: 'space-between', marginTop: scaledSize(10) }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{
                            fontSize: scaledSize(14), fontFamily: Fonts.PTSerifBold,
                            marginLeft: scaledSize(20),  letterSpacing: 1
                        }}>{'Add Signature'}</Text>

                    </View>
                    <TouchableOpacity onPress={() => showSignatureCanvas()}
                        style={{
                            height: scaledSize(28), borderRadius: scaledSize(2),
                            flexDirection: 'row', left: scaledSize(20), marginTop: scaledSize(10)
                        }}>
                        <FontAwesome6 name='file-signature' size={scaledSize(20)} color={COLORS.THEME_COLOR} style={{ borderRadius: 8 }} />
                        <Text style={{
                            fontSize: scaledSize(14), fontFamily: Fonts.regular,
                            marginLeft: scaledSize(20), letterSpacing: 1
                        }}>{'Create Signature'}</Text>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={openFile}
                        style={{
                            height: scaledSize(28), borderRadius: scaledSize(2),
                            flexDirection: 'row', left: scaledSize(20),
                        }}>
                        <FontAwesome name='file-picture-o' size={scaledSize(20)} color={COLORS.THEME_COLOR} />
                        <Text style={{ fontSize: scaledSize(14), fontFamily: Fonts.regular, letterSpacing: 1, marginLeft: scaledSize(20), }}>{' Select signature'}</Text>
                    </TouchableOpacity>

                </View>
            </CustomBottomSheet>
        )
    }

    const renderImageSize = () => {
        return (
            <View style={{ height: scaledSize(30), alignItems: 'flex-start', justifyContent: 'center', marginTop: scaledSize(30) }}>
                <View style={{ height: scaledSize(30), width: '90%', alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: 'row' }}>
                    <Text style={{
                        color: 'white', fontFamily: Fonts.regular, left: scaledSize(20),
                        letterSpacing: 1
                    }}>Image size</Text>
                    <TouchableOpacity style={{
                        flexDirection: 'row', height: scaledSize(20), width: scaledSize(100), borderRadius: scaledSize(4),
                        justifyContent: 'center', alignItems: 'center'
                    }} onPress={combineSignaturewithImage}>
                        <Text style={{
                            color: 'yellow', fontFamily: Fonts.bold, fontSize: scaledSize(14),
                            letterSpacing: 1
                        }}>Apply</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: scaledSize(50), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                    <CustomRangeSlider onValueChanged={(v) => setOverlayImageSize(v)} max={200} />
                </View>
            </View>
        )
    }

    const handleSave = () => {
        ref.current.readSignature(); // This will trigger onOK with the signature data
    };

    // Called after ref.current.readSignature() reads a non-empty base64 string
    const handleOK = async (signature: any) => {
        // console.log(signature);
        try {
            // Define the path to save the image
            const downloadDir = RNFS.DownloadDirectoryPath; // Download directory on Android
            const filePath = `${downloadDir}/signature_${generateUniqueNumber()}.jpg`; // Change extension if not jpg

            // Convert base64 data to a format that RNFS can save
            const base64Formatted = signature.replace(/^data:image\/\w+;base64,/, '');

            // Write the base64 image to the specified file
            setWrittenSignature('')
            await RNFS.writeFile(filePath, base64Formatted, 'base64');
            setIsShowSignatureModal(false)
            setSignaturePath(filePath)
            // ref.current.clearSignature();
            // props.signaturePath(filePath)
            // handleClear()
            setOverlayVisible(true)
            setOverlayImage(getImageUriByOS(filePath))

            //Alert.alert('Success', 'Image saved successfully to Downloads folder!');
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image');
        }
        console.log('signature-----');
        setWrittenSignature(signature)
        return
    };

    // Called after ref.current.readSignature() reads an empty string
    const handleEmpty = () => {
        console.log("Empty");
    };

    // Called after ref.current.clearSignature()
    const handleClear = () => {
        ref.current.clearSignature();
        setWrittenSignature('')
        console.log("clear success!");
        return
    };
    const handleUndo = () => {
        console.log('undo');

        ref.current.undo()
    }
    const handleRedo = () => {
        console.log('undo');

        ref.current.redo()
    }

    // Called after end of stroke
    const handleEnd = () => {
        ref.current.readSignature();
    };

    // Called after ref.current.getData()
    const handleData = (data) => {
        console.log(data);
    };
    const onSelectColor = ({ hex }) => {
        // do something with the selected color.
        console.log('color-code---', hex);
        ref.current.changePenColor(hex)
        // setPenColor(hex)
    };

    const onSelectPensize = (size) => {
        setPensize(size)
        ref.current.changePenSize(size, 2.5)

    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>

            <SafeAreaView style={{ flex: .52, alignItems: 'center', justifyContent: 'center', }}>
                {/* Background Image */}
                <TouchableOpacity style={{
                    height: scaledSize(30),
                    position: 'absolute', bottom: scaledSize(330), left: scaledSize(14)
                }}
                    onPress={() => props.onPressBack()}>
                    {/* <Text style={{color:'red'}}>hi</Text> */}
                    <CustomBackIcon color='white' onPress={() => props.onPressBack()} />
                </TouchableOpacity>
                <Image
                    source={{ uri: editedImage }}
                    style={{ width: scaledSize(400), height: scaledSize(300), position: 'absolute', bottom: scaledSize(10) }}
                    resizeMode="contain"
                />

                {/* Overlay Image with Gesture Handlers */}
                {overlayVisible && (
                    <PanGestureHandler onGestureEvent={panGestureHandler}>
                        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
                            <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
                                <Animated.View>
                                    <RotationGestureHandler onGestureEvent={rotationGestureHandler}>
                                        <Animated.View>
                                            {/* Overlay Image */}
                                            <Image
                                                source={{ uri: overlayImage }}
                                                style={{ width: overlayImageSize, height: overlayImageSize }}
                                                resizeMode='contain'
                                            />

                                            {/* Delete Button */}
                                            {overlayImage && <TouchableOpacity
                                                style={{
                                                    position: 'absolute',
                                                    top: scaledSize(-13),
                                                    right: scaledSize(-15),
                                                    backgroundColor: 'red',
                                                    borderRadius: 15,
                                                    width: scaledSize(22),
                                                    height: scaledSize(22),
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                                onPress={() => { setOverlayVisible(false), setOverlayImage(null), setIsShowSignatureModal(false) }}
                                            >
                                                <Icon name="close" size={20} color="white" />
                                            </TouchableOpacity>}

                                            {/* Resize and Rotate Handle Icon */}
                                            {/* <View
                        style={{
                          position: 'absolute',
                          bottom: -15,
                          right: -15,
                          backgroundColor: 'white',
                          borderRadius: 15,
                          width: 30,
                          height: 30,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Icon name="resize" size={20} color="black" />
                      </View> */}
                                        </Animated.View>
                                    </RotationGestureHandler>
                                </Animated.View>
                            </PinchGestureHandler>
                        </Animated.View>
                    </PanGestureHandler>
                )}
            </SafeAreaView>
            <View style={{ flex: .4, backgroundColor: 'black' }}>

                {overlayVisible && renderImageSize()}
                <View style={{ height: scaledSize(100), width: '100%', marginTop: scaledSize(30), }}>
                    <FlatList
                        data={editImageOptions}
                        renderItem={renderItem}
                        horizontal
                    />
                </View>
            </View>
            {renderSignatureBottomSheet()}
            <Modal visible={isShowSignatureModal} transparent>
                <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', width: '90%', height: '50%', borderRadius: 10 }}>
                        <View style={{ height: scaledSize(30), flexDirection: 'row', justifyContent: 'flex-start', paddingRight: scaledSize(10), alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setIsShowSignatureModal(false)} style={{ left: scaledSize(8) }}>
                                <CustomBackIcon color='black' onPress={() => setIsShowSignatureModal(false)} />
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            height: scaledSize(150), backgroundColor: 'yellow',
                            justifyContent: 'center', alignItems: 'center', borderBottomWidth: 0
                        }}>
                            <SignatureScreen
                                ref={ref}
                                // backgroundColor='white'
                                penColor={penColor}
                                onOK={handleOK}
                                minWidth={penSize}
                                onEmpty={handleEmpty}
                                onGetData={handleData}
                                autoClear={true}
                                descriptionText={'write your signature here...'}
                            />
                        </View>
                        <View style={{
                            height: scaledSize(30), flexDirection: 'row',
                        }}>
                            <TouchableOpacity onPress={() => handleClear()} style={{ flex: 1, height: 30, width: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontFamily: Fonts.PTSerifBold, fontSize: scaledSize(14),  letterSpacing: 1 }}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableHighlight onPress={() => handleUndo()} style={{ flex: 1, height: 30, width: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialCommunityIcons name='undo' size={34}  />
                            </TouchableHighlight>
                            <TouchableOpacity onPress={() => handleRedo()} style={{ flex: 1, height: 30, width: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialCommunityIcons name='redo' size={34}  />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSave()} style={{ flex: 1, height: 30, width: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontFamily: Fonts.PTSerifBold, color: COLORS.THEME_COLOR, fontSize: scaledSize(16), letterSpacing: 1 }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flex: 1, justifyContent: 'flex-start', borderWidth: .2, borderColor: '#d3d3d3',
                            alignItems: 'flex-start', width: '100%',
                            paddingLeft: scaledSize(10)
                        }}>
                            <Text style={{ fontSize: scaledSize(14), fontFamily: Fonts.regular, letterSpacing: 1,  }}>Pen color :</Text>
                            <View style={{ width: scaledSize(200), height: scaledSize(30), marginTop: scaledSize(10), marginLeft: scaledSize(10), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <ColorPicker style={{
                                    width: '80%', maxHeight: 30,
                                    marginTop: scaledSize(0),
                                }}
                                    value={penColor} onComplete={onSelectColor}>
                                    {/* <Preview />
                        <Panel1 />
                        <HueSlider />
                        <OpacitySlider /> */}
                                    <Swatches colors={['black', 'green', 'red', 'blue',]} />
                                </ColorPicker>
                                <TouchableOpacity onPress={() => alert()}>

                                    <Text style={{ fontSize: scaledSize(10), fontFamily: Fonts.regular, letterSpacing: 1, color: 'blue', left: scaledSize(20), top: scaledSize(10) }}>More color...</Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={{ fontSize: scaledSize(14), fontFamily: Fonts.regular, letterSpacing: 1, color: 'black', marginTop: scaledSize(10) }}>Pen Size :</Text>
                                <View style={{ flexDirection: 'row' }}>{[1, , 1.5, 2, 2.5].map((item) =>
                                    <TouchableOpacity style={{
                                        width: scaledSize(30), height: scaledSize(30), backgroundColor: penSize == item ? '#d3d3d3' : 'white',
                                        borderRadius: scaledSize(30),
                                        marginTop: scaledSize(10), marginLeft: scaledSize(10),
                                        borderWidth: 1, borderColor: '#d3d3d3', justifyContent: 'center', alignItems: 'center'
                                    }} onPress={() => { onSelectPensize(item) }}>
                                        <Text style={{ alignSelf: 'center', fontFamily: Fonts.PTSerifBold, fontSize: scaledSize(14), color: 'black' }}>{item}</Text>
                                    </TouchableOpacity>)}
                                </View>

                            </View>

                        </View>

                    </View>

                </GestureHandlerRootView>
            </Modal>
            <Modal visible={false} transparent>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>

                    <ColorPicker style={{ width: '70%' }}
                        value='red' onComplete={onSelectColor}>
                        {/* <Preview />
                        <Panel1 />
                        <HueSlider />
                        <OpacitySlider /> */}
                        <Swatches />
                    </ColorPicker>
                    <View style={{ width: 350, height: 30 }}>

                        <View style={{ height: scaledSize(50), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                            <RangeSlider
                                style={{
                                    backgroundColor: COLORS.THEME_COLOR, height: scaledSize(1), width: '90%',
                                    alignSelf: 'center', borderRadius: 20, justifyContent: 'center'
                                }}
                                min={100}
                                max={250}
                                disableRange
                                step={1}
                                floatingLabel
                                renderThumb={() => <View style={{
                                    height: 20, width: 20, borderRadius: 20,
                                    backgroundColor: COLORS.THEME_COLOR, left: scaledSize(2)
                                }}></View>}
                                renderRail={() => <View><Text></Text></View>}
                                renderRailSelected={() => <View><Text></Text></View>}
                                renderLabel={() => <View><Text></Text></View>}
                                renderNotch={() => <View><Text></Text></View>}
                                onValueChanged={(v) => setOverlayImageSize(v)}
                            />
                        </View>
                    </View>
                </View>

            </Modal>
            <Image
                source={{ uri: editedImage }}
                style={{ width: 200, height: 200, position: 'absolute', top: 150 }}
                resizeMode="contain"
            />
        </View>
    );
};

export default ImageOverlay;