import React, {
  useEffect,
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { scaledSize } from '../utilies/Utilities';

import { useTheme } from '../screen/theme/useTheme';

import { Fonts } from '../assets/fonts/GlobalFonts';

import CustomErrorMsgModal from './CustomErrorMsgModal';

interface Props {
  visible: boolean;
  files: Array<any>;
  protectedFiles?: Array<any>;
  onClose: () => void;
  onSubmit: (passwords: any) => void;
}

const CustomMultiplePdfPasswordModal = (
  props: Props,
) => {
  const {
    visible,
    files,
    onClose,
    onSubmit,
    protectedFiles = [],
  } = props;

  const { theme } = useTheme();

  const [passwords, setPasswords] =
    useState<
      {
        id: number | string;
        pass: string;
      }[]
    >([]);

  const [hidden, setHidden] =
    useState<Record<
      string,
      boolean
    >>({});

  const [modalError, setModalError] =
    useState('');

  useEffect(() => {
    console.log(
      'protectedFiles',
      protectedFiles,
    );
  }, [protectedFiles]);

  const updatePassword = (
    id: string,
    value: string,
  ) => {
    setPasswords(prev => {
      const exists =
        prev.some(
          item =>
            item.id === id,
        );

      if (exists) {
        return prev.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  pass: value,
                }
              : item,
        );
      }

      return [
        ...prev,
        {
          id,
          pass: value,
        },
      ];
    });
  };

  const checkIsProtectedFile = (
    item: any,
  ) => {
    return protectedFiles.some(
      file =>
        file.id === item.id,
    );
  };

  const handleSubmit = () => {
    const missingPassword =
      protectedFiles.some(
        file => {
          const password =
            passwords.find(
              p =>
                p.id === file.id,
            )?.pass || '';

          return !password.trim();
        },
      );

    if (
      missingPassword
    ) {
      setModalError(
        'Please enter all passwords',
      );

      return;
    }

    onSubmit(passwords);
  };

  const renderItem = ({
    item,
  }: any) => {
    const password =
      passwords.find(
        file =>
          file.id === item.id,
      )?.pass || '';

    const secure =
      hidden[item.id] !== false;

    return (
      <View
        style={{
          backgroundColor:
            theme.bgColor,

          borderRadius:
            scaledSize(18),

          padding:
            scaledSize(14),

          marginBottom:
            scaledSize(14),
        }}
      >
        <View
          style={{
            flexDirection:
              'row',

            alignItems:
              'center',
          }}
        >
          <View
            style={{
              width: 48,

              height: 48,

              borderRadius: 12,

              justifyContent:
                'center',

              alignItems:
                'center',

              marginRight: 12,

              backgroundColor:
                theme.buttonBGColor,
            }}
          >
            {checkIsProtectedFile(
              item,
            ) ? (
              <MaterialIcons
                name="lock"
                size={20}
                color="#FF4D67"
              />
            ) : (
              <Text
                style={{
                  color:
                    'green',

                  fontWeight:
                    '700',
                }}
              >
                PDF
              </Text>
            )}
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              numberOfLines={
                1
              }
              style={{
                fontSize: 18,

                color:
                  theme.primaryTextColor,
              }}
            >
              {item.name}
            </Text>

            <Text
              style={{
                marginTop: 4,

                color:
                  theme.secondaryTextColor,
              }}
            >
              {item.size}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 52,

            marginTop: 18,

            borderWidth: 1,

            borderRadius: 14,

            flexDirection:
              'row',

            alignItems:
              'center',

            paddingHorizontal: 14,

            borderColor:
              theme.borderColor,
          }}
        >
          <TextInput
            value={
              password
            }
            secureTextEntry={
              secure
            }
            placeholder="Password"
            placeholderTextColor="#7C8798"
            style={{
              flex: 1,

              height: 52,

              color:
                theme.primaryTextColor,
            }}
            onChangeText={txt =>
              updatePassword(
                item.id,
                txt,
              )
            }
          />

          <TouchableOpacity
            onPress={() =>
              setHidden(
                prev => ({
                  ...prev,

                  [item.id]:
                    !secure,
                }),
              )
            }
          >
            <MaterialIcons
              size={22}
              color="#A2A9B8"
              name={
                secure
                  ? 'visibility-off'
                  : 'visibility'
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View
        style={{
          flex: 1,

          padding:
            scaledSize(18),

          justifyContent:
            'center',

          backgroundColor:
            'rgba(0,0,0,.65)',
        }}
      >
        <View
          style={{
            padding:
              scaledSize(20),

            borderRadius:
              scaledSize(24),

            maxHeight:
              '82%',

            backgroundColor:
              theme.bgContainor,
          }}
        >
          <Text
            style={{
              fontSize:
                scaledSize(20),

              marginBottom: 18,

              fontWeight:
                '500',

              fontFamily:
                Fonts.regular,

              color:
                theme.primaryTextColor,
            }}
          >
            Password Required
          </Text>

          <FlatList
            data={files}
            renderItem={
              renderItem
            }
            keyExtractor={
              item =>
                item.id.toString()
            }
            showsVerticalScrollIndicator={
              false
            }
          />

          <View
            style={{
              marginTop: 20,

              flexDirection:
                'row',

              justifyContent:
                'space-between',
            }}
          >
            <TouchableOpacity
              onPress={
                onClose
              }
              style={{
                flex: 0.45,

                height: 50,

                borderWidth: 1,

                borderRadius: 14,

                justifyContent:
                  'center',

                alignItems:
                  'center',

                borderColor:
                  theme.borderColor,
              }}
            >
              <Text
                style={{
                  color:
                    '#AAB2C0',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                handleSubmit
              }
              style={{
                flex: 0.45,

                height: 50,

                borderRadius: 14,

                justifyContent:
                  'center',

                alignItems:
                  'center',

                backgroundColor:
                  theme.buttonBGColor,
              }}
            >
              <Text
                style={{
                  fontWeight:
                    '700',

                  color:
                    theme.iconColor,
                }}
              >
                Open Files
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomErrorMsgModal
          isVisible={
            !!modalError
          }
          errorMessage={
            modalError
          }
          onPressClose={() =>
            setModalError(
              '',
            )
          }
        />
      </View>
    </Modal>
  );
};

export default CustomMultiplePdfPasswordModal;