import React, { useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import { Fonts } from '../assets/fonts/GlobalFonts';
import { scaledSize } from '../utilies/Utilities';

const ICON_SIZE = 24;

interface S {
  placeholder: string;
  value: string;
  onSelect: Function;
  data: Array<any>;
  onFocuse?: Function;
  onBlur?: Function;
  LeftIcon?: any
  searchPlaceholder?: string
  isShowSearch?: boolean
}

const CustomDropdown = (props: S) => {

  const { placeholder, onSelect, data,value, onFocuse, onBlur, LeftIcon, searchPlaceholder = 'Enter keyword', isShowSearch = true } = props;

  const { theme, mode } = useTheme();
  const [isFocus, setIsFocus] = useState(false);
  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);

  /* ---------- Dropdown Item ---------- */

  const renderDropdownItem = (item: any) => {
    return (
      <View style={styles.dropdownItem}>

        {item.icon && (
          <Image
            source={item.icon}
            style={styles.bankIcon}
            resizeMode="contain"
          />
        )}

        <Text style={styles.bankLabel}>
          {item.label}
        </Text>

      </View>
    );
  };

  return (

    <View style={styles.wrapper}>

      <Dropdown
        style={[
          styles.dropdown,
          isFocus && styles.focusedDropdown
        ]}

        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.searchInput}
        iconStyle={styles.iconStyle}
        containerStyle={styles.dropdownContainer}
        itemTextStyle={styles.itemTextStyle}
        activeColor={theme.buttonBGColor}

        data={data}
        renderItem={renderDropdownItem}

        search={isShowSearch}
        maxHeight={220}

        labelField="label"
        valueField="id"

        placeholder={!isFocus ? placeholder : '...'}
        searchPlaceholder={searchPlaceholder}

        value={value}

        showsVerticalScrollIndicator={false}

        onFocus={() => {
          setIsFocus(true);
          onFocuse && onFocuse();
        }}

        onBlur={() => {
          setIsFocus(false);
          onBlur && onBlur();
        }}

        onChange={item => {
          setIsFocus(false);
          onSelect(item);
        }}

        renderLeftIcon={() =>
          LeftIcon ? (
            <LeftIcon />
          ) : (
            <Icon
              name="user"
              size={scaledSize(20)}
              color={theme.secondaryTextColor}
              style={styles.leftIcon}
            />
          )
        }
        renderRightIcon={() => (
          <Icon
            style={styles.iconStyle}
            color={isFocus ? theme.themeColor : theme.secondaryTextColor}
            name={isFocus ? 'chevron-up' : 'chevron-down'}
            size={20}
          />
        )}
      />

    </View>

  );
};

export default CustomDropdown;

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({

  wrapper: {
    width: '100%',
  },

  dropdown: {
    height: 58,
    backgroundColor: theme.bgContainor,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: mode === 'dark' ? 0.1 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  focusedDropdown: {
    borderColor: theme.themeColor,
    borderWidth: 1.5,
    elevation: 4,
  },

  placeholderStyle: {
    fontSize: scaledSize(14),
    color: theme.secondaryTextColor,
    fontFamily: Fonts.regular,
  },

  selectedTextStyle: {
    fontSize: scaledSize(14),
    color: theme.primaryTextColor,
    fontFamily: Fonts.medium,
    marginLeft: 12,
  },

  searchInput: {
    height: 40,
    fontSize: 14,
    borderRadius: 12,
    backgroundColor: theme.bgColor,
    borderColor: theme.borderColor,
    borderWidth: 1,
    color: theme.primaryTextColor,
    paddingHorizontal: 12,
    fontFamily: Fonts.regular,
  },

  iconStyle: {
    width: 22,
    height: 22,
  },

  leftIcon: {
    marginRight: 8,
    opacity: 0.8,
  },

  dropdownContainer: {
    backgroundColor: theme.bgColor,
    borderRadius: 12,
    borderColor: theme.borderColor,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  bankIcon: {
    height: 28,
    width: 28,
    marginRight: 12,
  },

  bankLabel: {
    fontSize: scaledSize(14),
    color: theme.primaryTextColor,
    fontFamily: Fonts.regular,
    flex: 1,
  },

  itemTextStyle: {
    color: theme.primaryTextColor,
    fontSize: scaledSize(14),
    fontFamily: Fonts.regular,
  },
});