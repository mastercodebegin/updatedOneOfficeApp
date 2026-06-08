import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ViewProps,
  StyleProp,
  ViewStyle,
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
import FileSlice from "../screen/dashboard/FileSlice";
import { useSelector } from "react-redux";
interface S {
  item: any;
  icon: any;
  onPressDeleteFile: Function;
  screenName: string;
  onPressItem: Function;
  onLongPress: any;
  isShowEditBtn?: boolean;
  actionButtonContainerStyle?:StyleProp<ViewStyle>
  leftIconStyle?:StyleProp<ViewStyle>
  onPressEditFile?: (item: any) => void;
  index: number;
}


export const FileCommonRenderItem = (props: S) => {
  
  const {
    item,
    icon,
    onPressDeleteFile,
    screenName,
    onLongPress,
    onPressItem,
    actionButtonContainerStyle,
    isShowEditBtn = false,
    leftIconStyle,
    onPressEditFile = () => {},
    index,
  } = props;
  
  const { selectedFiles,selectedItems } = useSelector((state: any) => state.FileSlice,
  );  const { theme, mode } =useTheme();

  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme])

  const checkisFolderSelected = (id: number) => {
    return selectedFiles.some(
      (item: any) => item.id === id,
    );
  };

  const [
    isShowDeleteConfirmation,
    setIsShowDeleteConfirmation,
  ] = useState(false);

 
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
        selectedFiles?.length >
        0
      ) {

        onPressItem(item);

      } else {

        openFile(item);
      }
    };

  return (
    <>

      <TouchableOpacity
        style={[
          styles.card,

          {
            marginTop:
              index === 0
                ? scaledSize(
                    20,
                  )
                : 0,
          },

          checkisFolderSelected(item.id) &&
            styles.selectedCard,
        ]} onLongPress={()=>onLongPress(
              item,
            )}
            onPress={onPressItemHandler}
            >

        {/* selection ui */}

        {checkisFolderSelected(item.id) && (
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

        <View style={[styles.iconContainer,leftIconStyle]}>

          <Image
            source={icon}
            style={styles.icon}
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
          // onLongPress={() =>
          //   onLongPress(
          //     item,
          //   )
          // }
          >

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

            <View style={styles.dateAndSizeParentView}>

              <View style={styles.metaRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={scaledSize(13)}
                  color={theme.iconColor}
                />

                <Text style={styles.metaText}>
                  {Utility.date.getDateByMomentFormat(
                    item.mtime,
                  )}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MaterialIcons
                  name="insert-drive-file"
                  size={scaledSize(14)}
                  color={theme.iconColor}
                />

                <Text style={styles.metaText}>
                  {getFileSize(
                    item?.size,
                  )}
                </Text>
              </View>

            </View>

          </View>

        </TouchableOpacity>

        {/* actions hidden during selection */}

        {!checkisFolderSelected(item.id) && (

          <View
            style={
              [styles.actionContainer,actionButtonContainerStyle]
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
                  size={scaledSize(20)}
                  color={
                    theme.iconColor
                  }
                />

              </TouchableOpacity>

            )}

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
              ]}
              onPress={() =>
                setIsShowDeleteConfirmation(
                  true,
                )
              }>

              <MaterialIcons
                name="delete"
                size={scaledSize(20)}
                color={
                  theme.deleteIconColor
                }
              />

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.shareButton,
              ]}
              onPress={() =>
                Utility.fileShare(
                  item.path,
                )
              }>

              <MaterialIcons
                name="share"
                size={scaledSize(20)}
                color={
                  theme.themeColor
                }
              />

            </TouchableOpacity>

          </View>

        )}

      </TouchableOpacity>

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
        scaledSize(100),

      marginHorizontal:
        scaledSize(16),

      marginBottom:
        scaledSize(16),

      paddingVertical:
        scaledSize(22),

      paddingHorizontal:
        scaledSize(20),

      borderRadius:
        scaledSize(14),

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        mode === "dark"
          ? theme.bgColor
          : "#FFFFFF",

      borderWidth:
        mode === "dark"
          ? 1
          : 0,

      borderColor:
        theme.borderColor,

      overflow:
        "hidden",

      shadowColor:
        "#9CA3AF",

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity:
        mode === "dark" ? 0 : 0.16,

      shadowRadius:
        18,

      elevation:
        mode === "dark" ? 0 : 4,
    },

    selectedCard: {

      borderWidth: mode !== "dark" ? 1 : 0.5,

      borderColor:
        theme.themeColor,

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
        theme.themeColor,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    },

    checkBadge: {
      position: "absolute",
      right: scaledSize(16),
      top: scaledSize(34),
      width: scaledSize(26),
      height: scaledSize(26),
      borderRadius: 100,
      backgroundColor:
        theme.themeColor,
      justifyContent:
        "center",
      alignItems:
        "center",
      zIndex: 10,
    },

    iconContainer: {
      width: scaledSize(50),
      height: scaledSize(50),
      borderRadius: scaledSize(12),
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor:'red',
      marginRight: scaledSize(20),
    },

    icon: {
      width: scaledSize(55),
      height: scaledSize(55),
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
        scaledSize(14),
      fontFamily:
        Fonts.bold,
    },

    dateAndSizeParentView: {
      marginTop:
        scaledSize(14),
      gap:
        scaledSize(10),
    },

    metaRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        scaledSize(10),
    },

    metaText: {
      color:
        theme.primaryTextColor,
      fontSize:
        scaledSize(12),
      fontFamily:
        Fonts.regular,
    },

    actionContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        scaledSize(12),
    },

    actionButton: {
      width:
        scaledSize(34),
      height:
        scaledSize(34),
      borderRadius:
        scaledSize(8),
      backgroundColor:
        mode === "dark"
          ? theme.buttonBGColor
          : "#F5F5F5",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    deleteButton: {
      backgroundColor:
        mode === "dark"
          ? theme.buttonBGColor
          : "rgba(255, 59, 92, 0.1)",
    },

    shareButton: {
      backgroundColor:
        mode === "dark"
          ? theme.buttonBGColor
          : "rgba(0, 182, 204, 0.1)",
    },
  });
