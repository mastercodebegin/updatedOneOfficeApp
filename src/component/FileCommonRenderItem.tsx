import React, { useState } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { View } from "react-native";

import {
  getFileSize,
  scaledSize,
  Utility,
} from "../utilies/Utilities";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { Fonts } from "../assets/fonts/GlobalFonts";
import { useTheme } from "../screen/theme/useTheme";
import { Theme } from "../screen/theme/ThemeConfig";
import ConfirmationDialog from "./ConfirmationDialog";

interface S {
  item: any;
  icon: any;
  onPressDeleteFile: Function;
  screenName: string;
  onPressItem: Function;
  onLongPress: any;
  isItemSelected: boolean;
  selectedItems: Array<any>;
  isShowEditBtn?: boolean;
  onPressEditFile?: (item: any) => void;
  index: number;
}

const SELECT_COLOR = "#4D8DFF";

export const FileCommonRenderItem = (props: S) => {

  const {
    item,
    icon,
    onPressDeleteFile,
    screenName,
    onLongPress,
    isItemSelected,
    selectedItems,
    onPressItem,
    isShowEditBtn = false,
    onPressEditFile = () => {},
    index,
  } = props;

  const { theme, mode } =
    useTheme();

  const [
    isShowDeleteConfirmation,
    setIsShowDeleteConfirmation,
  ] = useState(false);

  const styles =
    createStyles(
      theme,
      mode,
    );

  const openFile = (
    item: any,
  ) => {

    if (
      screenName ===
      "PdfViewer"
    ) {

      Utility.navigation.navigateTo(
        "PdfViewer",
        {
          uri: item.path,
          name: item.name,
        },
      );

    } else if (
      screenName ===
      "XslxReader"
    ) {

      Utility.navigation.navigateTo(
        "XslxReader",
        {
          uri: item.path,
          name: item.name,
        },
      );

    } else if (
      screenName ===
      "WordReader"
    ) {

      Utility.navigation.navigateTo(
        "WordReader",
        {
          uri: item.path,
          name: item.name,
        },
      );

    } else if (
      screenName ===
      "PPTReader"
    ) {

      Utility.navigation.navigateTo(
        "PPTReader",
        {
          uri: item.path,
          name: item.name,
        },
      );
    }
  };

  const onPressItemHandler =
    () => {

      if (
        selectedItems?.length >
        0
      ) {

        onPressItem(item);

      } else {

        openFile(item);
      }
    };

  return (
    <>

      <View
        style={[
          styles.card,

          {
            marginTop:
              index === 0
                ? scaledSize(
                    6,
                  )
                : 0,
          },

          isItemSelected &&
            styles.selectedCard,
        ]}>

        {/* selection ui */}

        {isItemSelected && (
          <>

            <View
              style={
                styles.leftAccent
              }
            />

            <View
              style={
                styles.checkBadge
              }>

              <MaterialIcons
                name="check"
                size={16}
                color="#FFF"
              />

            </View>

          </>
        )}

        {/* icon */}

        <View
          style={
            styles.iconContainer
          }>

          <Image
            source={icon}
            style={
              styles.icon
            }
          />

        </View>

        {/* content */}

        <TouchableOpacity
          style={
            styles.touchable
          }
          onPress={
            onPressItemHandler
          }
          onLongPress={() =>
            onLongPress(
              item,
            )
          }>

          <View
            style={
              styles.fileNameParentView
            }>

            <Text
              numberOfLines={1}
              style={
                styles.fileName
              }>

              {item?.name}

            </Text>

            <View
              style={
                styles.dateAndSizeParentView
              }>

              <Text
                style={
                  styles.metaText
                }>
                {Utility.date.getDateByMomentFormat(
                  item.mtime,
                )}
              </Text>

              <Text
                style={[
                  styles.metaText,
                  {
                    marginTop:
                      scaledSize(
                        4,
                      ),
                  },
                ]}>
                {getFileSize(
                  item?.size,
                )}
              </Text>

            </View>

          </View>

        </TouchableOpacity>

        {/* actions hidden during selection */}

        {!isItemSelected && (

          <View
            style={
              styles.actionContainer
            }>

            {isShowEditBtn && (

              <TouchableOpacity
                style={
                  styles.actionButton
                }
                onPress={() =>
                  onPressEditFile(
                    item,
                  )
                }>

                <MaterialIcons
                  name="edit"
                  size={20}
                  color={
                    theme.iconColor
                  }
                />

              </TouchableOpacity>

            )}

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                setIsShowDeleteConfirmation(
                  true,
                )
              }>

              <MaterialIcons
                name="delete"
                size={20}
                color={
                  theme.deleteIconColor
                }
              />

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                Utility.fileShare(
                  item.path,
                )
              }>

              <MaterialIcons
                name="share"
                size={20}
                color={
                  theme.themeColor
                }
              />

            </TouchableOpacity>

          </View>

        )}

      </View>

      <ConfirmationDialog
        visible={
          isShowDeleteConfirmation
        }
        onCancel={() =>
          setIsShowDeleteConfirmation(
            false,
          )
        }
        onSubmit={() => {

          onPressDeleteFile(
            item,
          );

          setIsShowDeleteConfirmation(
            false,
          );
        }}
        mode="delete"
      />

    </>
  );
};

const createStyles = (
  theme: Theme,
  mode: string,
) =>
  StyleSheet.create({

    card: {
      minHeight:
        scaledSize(99),

      marginHorizontal:
        scaledSize(10),

      marginBottom:
        scaledSize(10),

      padding:
        scaledSize(14),

      borderRadius:
        scaledSize(18),

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        theme.bgColor,

      borderWidth:
        mode === "dark"
          ? 1
          : 0,

      borderColor:
        theme.borderColor,

      overflow:
        "hidden",
    },

    selectedCard: {

      borderWidth: 1.3,

      borderColor:
        SELECT_COLOR,

      backgroundColor:
        mode === "dark"
          ? "rgba(77,141,255,0.06)"
          : "rgba(77,141,255,0.04)",
    },

    leftAccent: {
      position: "absolute",
      left: 0,
      top: scaledSize(18),
      bottom: scaledSize(18),
      width: scaledSize(4),
      backgroundColor:
        SELECT_COLOR,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    },

    checkBadge: {
      position: "absolute",
      right: scaledSize(10),
      top: scaledSize(10),
      width: scaledSize(26),
      height: scaledSize(26),
      borderRadius: 100,
      backgroundColor:
        SELECT_COLOR,
      justifyContent:
        "center",
      alignItems:
        "center",
      zIndex: 10,
    },

    iconContainer: {
      width: scaledSize(44),
      height: scaledSize(44),
      borderRadius:
        scaledSize(12),
      backgroundColor:
        theme.buttonBGColor,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight:
        scaledSize(14),
    },

    icon: {
      width: scaledSize(28),
      height: scaledSize(28),
      resizeMode:
        "contain",
    },

    touchable: {
      flex: 1,
    },

    fileNameParentView: {
      flex: 1,
    },

    fileName: {
      color:
        theme.primaryTextColor,
      fontSize:
        scaledSize(15),
      fontFamily:
        Fonts.regular,
    },

    dateAndSizeParentView: {
      marginTop:
        scaledSize(8),
    },

    metaText: {
      color:
        theme.secondaryTextColor,
      fontSize:
        scaledSize(11),
    },

    actionContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        scaledSize(8),
    },

    actionButton: {
      width:
        scaledSize(36),
      height:
        scaledSize(36),
      borderRadius:
        scaledSize(8),
      backgroundColor:
        theme.buttonBGColor,
      justifyContent:
        "center",
      alignItems:
        "center",
    },
  });