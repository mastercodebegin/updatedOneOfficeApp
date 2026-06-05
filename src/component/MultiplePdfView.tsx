import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Linking, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import Pdf from 'react-native-pdf';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedFiles, updateFilesPassword } from '../screen/dashboard/FileSlice';
import { Theme } from '../screen/theme/ThemeConfig';
import { useTheme } from '../screen/theme/useTheme';
import { heightFromPercentage, scaledSize, Utility } from '../utilies/Utilities';
import CustomHeader from './CustomHeader';
import CustomMultiplePdfPasswordModal from './CustomMultiplePdfPasswordModal';
import CustomVectorIcon from './CustomVectorIcon';

interface S {
  pdfArr: Array<any>
}
const MultiplePdfView = (props: S) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        height: scaledSize(50),
        width: '100%',
        zIndex: 99,
        backgroundColor: theme.bgContainor,
      }}>
        <CustomHeader title='' onPressBack={onPressCloseHandler} rightSide={
          <CustomVectorIcon
            iconName={isMultiView ? 'phone-rotate-landscape' : 'screen-rotation'}
            iconLibrary='MaterialCommunityIcons'
            style={{
              color: theme.themeColor, fontSize: scaledSize(20),
              right: 30
            }}
            onPress={() => { setIsMultiView(!isMultiView) }} />
        } />
      </View>
    )
  }

  const renderItem = ({ item, index }) => {
    const isSelected = selectedSheet.name === item.name;
    return (<Button
      containerStyle={{ justifyContent: 'center', alignItems: 'center', }}
      buttonStyle={{
        backgroundColor: 'transparent',
        paddingLeft: scaledSize(10), height: 40,
        marginLeft: index == 0 ? 0 : scaledSize(10),
        borderBottomWidth: isSelected ? 2 : .5,
        borderColor: isSelected ? theme.themeColor : theme.borderColor,
      }}
      titleStyle={{ color: theme.primaryTextColor, textAlign: 'center' }}
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
              marginTop: scaledSize(2),
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              flexDirection: 'row',
              backgroundColor: theme.bgColor

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
              height: heightFromPercentage(45),
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
            <View style={{ height: scaledSize(5), backgroundColor: theme.borderColor }}></View>

            <View style={{
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

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgContainor,
  },
  pdf: {
    flex: 1,
    backgroundColor: theme.bgColor,
  }
});

export default MultiplePdfView