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
    onPressEditFile = () => { },
    index,
  } = props;

  const { theme, mode } = useTheme();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState(false);

  const styles = createStyles(theme, mode);

  const openFile = (item: any) => {
    if (screenName === "PdfViewer") {
      Utility.navigation.navigateTo("PdfViewer", {
        uri: item.path,
        name: item.name,
      });
    } else if (screenName === "XslxReader") {
      Utility.navigation.navigateTo("XslxReader", {
        uri: item.path,
        name: item.name,
      });
    } else if (screenName === "WordReader") {
      Utility.navigation.navigateTo("WordReader", {
        uri: item.path,
        name: item.name,
      });
    } else if (screenName === "PPTReader") {
      Utility.navigation.navigateTo("PPTReader", {
        uri: item.path,
        name: item.name,
      });
    }
  };

  const onPressItemHandler = () => {
    if (selectedItems?.length > 0) {
      onPressItem(item);
    } else {
      openFile(item);
    }
  };

  return (
    <>
      <View
        style={[styles.card, { marginTop: index == 0 ? scaledSize(6) : 0 }, isItemSelected && styles.selectedCard]}
      >
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.icon} />
        </View>

        <TouchableOpacity
          style={styles.touchable}
          onPress={onPressItemHandler}
          onLongPress={() => onLongPress(item)}
        >
          <View style={styles.fileNameParentView}>
            <Text numberOfLines={1} style={styles.fileName}>
              {item?.name}
            </Text>

            <View style={styles.dateAndSizeParentView}>
              <Text style={styles.metaText}>
                {Utility.date.getDateByMomentFormat(item.mtime)}
              </Text>
              <Text style={{ ...styles.metaText, top: scaledSize(2) }}>
                {getFileSize(item?.size)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionContainer}>
          {isShowEditBtn && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onPressEditFile(item)}
            >
              <MaterialIcons
                name="edit"
                size={scaledSize(20)}
                color={theme.iconColor}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsShowDeleteConfirmation(true)}
          >
            <MaterialIcons
              name="delete"
              size={scaledSize(20)}
              color={theme.deleteIconColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ ...styles.actionButton, left: scaledSize(4) }}
            onPress={() => Utility.fileShare(item.path)}
          >
            <MaterialIcons
              name="share"
              size={scaledSize(20)}
              color={theme.themeColor}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ConfirmationDialog
        visible={isShowDeleteConfirmation}
        onCancel={() => setIsShowDeleteConfirmation(false)}
        onSubmit={() => {
          onPressDeleteFile(item);
          setIsShowDeleteConfirmation(false);
        }}
        mode="delete"
      />
    </>
  );
};

const createStyles = (theme: Theme, mode: string) =>
  StyleSheet.create({
    card: {
      minHeight: scaledSize(99),
      marginHorizontal: scaledSize(10),
      marginBottom: scaledSize(10),
      padding: scaledSize(10),
      borderRadius: scaledSize(14),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.bgColor,
      borderWidth: mode === 'dark' ? 1 : 0,
      borderColor: theme.borderColor,
      // Elevation for Android
      elevation: mode === 'light' ? scaledSize(3) : 1,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: mode === 'light' ? 0.1 : 0.2,
      shadowRadius: 4,
    },
    selectedCard: {
      backgroundColor: theme.themeSecondaryColor,
      borderColor: theme.themeColor,
      borderWidth: 1.5,
    },

    iconContainer: {
      width: scaledSize(44),
      height: scaledSize(44),
      borderRadius: scaledSize(12),
      backgroundColor: theme.buttonBGColor,
      justifyContent: "center",
      alignItems: "center",
      marginRight: scaledSize(12),
    },

    icon: {
      width: scaledSize(28),
      height: scaledSize(28),

      resizeMode: "contain",
    },

    touchable: {
      flex: 1,
      justifyContent: 'center',
    },

    fileNameParentView: {
      justifyContent: "center",
      flex: 1,
      paddingRight: scaledSize(8),
    },

    fileName: {
      color: theme.primaryTextColor,

      fontSize: scaledSize(15),
      fontWeight: '500',
      fontFamily: Fonts.regular,
    },

    dateAndSizeParentView: {
      marginTop: scaledSize(6),

      flexDirection: "column",
      alignItems: 'flex-start',
    },

    metaText: {
      color: theme.secondaryTextColor,
      fontSize: scaledSize(11),
      fontFamily: Fonts.regular,
    },

    actionContainer: {
      marginLeft: 'auto',
      flexDirection: "row",
      alignItems: "center",
      gap: scaledSize(8),
    },
    actionButton: {
      width: scaledSize(34),
      height: scaledSize(34),
      borderRadius: scaledSize(6),
      backgroundColor: theme.buttonBGColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });