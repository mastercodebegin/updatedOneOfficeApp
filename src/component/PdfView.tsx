import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  TouchableOpacity,
  Animated,
  Linking,
  NativeModules,
  Platform,
  StyleSheet,
} from 'react-native';

import Pdf from 'react-native-pdf';
import Entypo from 'react-native-vector-icons/Entypo';

import {
  scaledSize,
  Utility,
  heightFromPercentage,
} from '../utilies/Utilities';

import ModalView from './ModalViewForPdfPassword';
import CustomBackIcon from './CustomBackIcon';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import CustomErrorMsgModal from './CustomErrorMsgModal';

const { PdfCacheModule } = NativeModules;

const getInitialPdfUri = (uri?: string) => {
  if (
    Platform.OS === 'android' &&
    uri?.startsWith('content://')
  ) {
    return '';
  }

  return uri || '';
};

const PdfViewer = (props: any) => {
  const [text, setText] = useState('');
  const [errorMsg] = useState(
    'Please Enter valid password',
  );
  const [num, setNumber] = useState(0);
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] =
    useState(1);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [pdfUri, setPdfUri] = useState(
    getInitialPdfUri(props?.route?.params?.uri),
  );

  const { theme, mode } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  useEffect(() => {
    let isMounted = true;

    const resolvePdfUri = async () => {
      const incomingUri = props?.route?.params?.uri;

      if (!incomingUri) return;

      if (
        Platform.OS === 'android' &&
        incomingUri.startsWith('content://')
      ) {
        try {
          const cachedPath = await PdfCacheModule.copyToCache(incomingUri);

          if (isMounted) {
            setPdfUri(cachedPath);
          }
        } catch (error) {
          console.log('copyToCache error', error);

          if (isMounted) {
            setModalErrorMessage('Unable to open this PDF attachment');
            setShowErrorModal(true);
          }
        }

        return;
      }

      setPdfUri(incomingUri);
    };

    resolvePdfUri();

    return () => {
      isMounted = false;
    };
  }, [props?.route?.params?.uri]);

  /* HEADER ANIMATION */

  const headerTranslateY = useRef(
    new Animated.Value(0),
  ).current;

  const headerVisible = useRef(true);
  const previousPage = useRef(1);

  const headerHeight = useRef(
    new Animated.Value(scaledSize(65))
  ).current;

  const toggleHeader = (show: boolean) => {
    if (show === headerVisible.current) return;

    headerVisible.current = show;

    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: show ? 0 : -80,
        duration: 250,
        useNativeDriver: true,
      }),

      Animated.timing(headerHeight, {
        toValue: show ? scaledSize(55) : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  /* PASSWORD */

  const onChangeText = (
    value: string,
  ) => {
    setText(value);
  };

  const PdfPasswordErrorHandler =
    () => {
      setNumber(prev => prev + 1);
      setVisible(true);
      console.log('error');

    };

  const onPressOkayHandler =
    () => {
      if (!text.length) {
        setModalErrorMessage('Please enter a valid password');
        setShowErrorModal(true);
        return;
      }

      setVisible(false);
    };

  const onPressCloseHandler =
    () => {
      setNumber(0);
      setVisible(false);

      Linking.getInitialURL =
        async () => null;

      Utility.navigation.navigateToBack();
    };

  /* HEADER */

  const headerComp = () => {
    return (
      <Animated.View
        style={{
          height: headerHeight,

          overflow: 'hidden',

          backgroundColor: theme.bgContainor,

          opacity: headerHeight.interpolate({
            inputRange: [0, scaledSize(65)],
            outputRange: [0, 1],
          }),
        }}>

        <Animated.View
          style={{
            transform: [
              { translateY: headerTranslateY }
            ],

            flexDirection: 'row',

            justifyContent: 'space-between',

            alignItems: 'center',

            paddingHorizontal: scaledSize(14),

            paddingTop: heightFromPercentage(2),

            height: scaledSize(65),

            backgroundColor: theme.bgContainor,
          }}>

          <TouchableOpacity
            onPress={onPressCloseHandler} style={{ padding: scaledSize(8), bottom: scaledSize(4) }}>
            <CustomBackIcon
              onPress={onPressCloseHandler}
              size={22}
              color={theme.iconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Utility.fileShare(
                pdfUri,
                props?.route?.params?.name,
              )
            } style={{ padding: scaledSize(8), bottom: scaledSize(4) }}>
            <Entypo
              name="share"
              size={24}
              color={theme.iconColor}
            />
          </TouchableOpacity>

        </Animated.View>

      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>

      {!visible && (
        <View
          style={{
            zIndex: 999,
            elevation: 999,
          }}>
          {headerComp()}
        </View>
      )}

      <View
        style={{
          flex: 1,

          backgroundColor:
            mode === 'dark'
              ? '#0F1117'
              : theme.bgContainor,

          marginTop: scaledSize(6),
        }}>

        {!visible ? (
          pdfUri ? (
          <>
            <Pdf
              trustAllCerts={false}
              password={text}
              maxScale={100}
              source={{
                uri: pdfUri,
              }}

              onError={() => {
                PdfPasswordErrorHandler();
              }}
              onLoadComplete={(pages) => {
                console.log('PDF loaded', pages);
              }}


              onPageChanged={(page) => {

                setCurrentPage(page);

                if (
                  page >
                  previousPage.current
                ) {
                  toggleHeader(false);
                } else {
                  toggleHeader(true);
                }

                previousPage.current = page;
              }}

              style={{
                flex: 1,

                backgroundColor:
                  mode === 'dark'
                    ? '#12151D'
                    : '#FFFFFF',
              }}
            />

            {/* Dark mode overlay */}

            {mode === 'dark' && (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',

                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,

                  backgroundColor: '#000',

                  opacity: 0.12,
                }}
              />
            )}

          </>
          ) : (
            <View style={{ flex: 1 }} />
          )
        ) : (
          <ModalView
            visible={visible}
            errorRecognize={text}
            errorMessage={errorMsg}
            onText={onChangeText}
            num={num}
            onPressOkay={onPressOkayHandler}
            onPressClose={onPressCloseHandler}
            close={'CLOSE'}
            open={'OPEN'}
          />
        )}

      </View>

      <CustomErrorMsgModal
        isVisible={showErrorModal}
        errorMessage={modalErrorMessage}
        onPressClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};

const createStyles = (
  theme: Theme,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.bgContainor,
    },

    pdf: {
      flex: 1,
    },
  });

export default PdfViewer;
