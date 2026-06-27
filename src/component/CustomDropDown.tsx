import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import { Fonts } from '../assets/fonts/GlobalFonts';
import { useResponsive } from '../customhooks/useResponsive';

const ICON_SIZE = 24;

export interface BankDropdownItem {
  id: number;
  label: string;
  value: object;
  icon: number;
}
interface S {
  containorStyle?:StyleProp<ViewStyle>
  placeholder: string;
  value?: string;
  onSelect: Function;
  data: Array<BankDropdownItem>;
  onFocuse?: Function;
  onBlur?: Function;
  LeftIcon?: any
  searchPlaceholder?: string
  isShowSearch?: boolean
}

const CustomDropdown = (props: S) => {

  const { placeholder, onSelect, data,value, onFocuse, onBlur, LeftIcon,containorStyle={}, searchPlaceholder = 'Enter keyword', isShowSearch = true } = props;

  const { theme, mode } = useTheme();
  const [isFocus, setIsFocus] = useState(false);
  const {scaledSize} = useResponsive()
  const styles = useMemo(() => createStyles(theme, mode,scaledSize), [theme, mode]);

  useEffect(()=>{
    console.log('data===',data);
    
  })
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
          styles.dropdown,containorStyle,
          isFocus && styles.focusedDropdown
        ]}

        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.searchInput}
        iconStyle={styles.iconStyle}
        containerStyle={{...styles.dropdownContainer, borderColor: isFocus ? 'gray' : theme.borderColor}}
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
            size={scaledSize(20)}
          />
        )}
      />

    </View>

  );
};

export default CustomDropdown;

const createStyles = (theme: Theme, mode: string,scaledSize:any) => StyleSheet.create({

  wrapper: {
    width: '100%',
  },

  dropdown: {
    height: scaledSize(45),
    backgroundColor: theme.bgContainor,
    borderRadius: scaledSize(18),
    paddingHorizontal: scaledSize(16),
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: mode === 'dark' ? 0.1 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  focusedDropdown: {
    // borderColor: theme.themeColor,
    borderWidth: scaledSize(1),
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
    fontFamily: Fonts.regular,
    marginLeft: 12,
  },

  searchInput: {
    height: scaledSize(40),
    fontSize: scaledSize(14),
    borderRadius: scaledSize(12),
    backgroundColor: theme.bgColor,
    borderColor: theme.borderColor,
    borderWidth: 0,
    color: theme.primaryTextColor,
    paddingHorizontal: scaledSize(10),
    fontFamily: Fonts.regular,
  },

  iconStyle: {
    width: scaledSize(22),
    height: scaledSize(22),
  },

  leftIcon: {
    marginRight: 8,
    opacity: 0.8,
  },

  dropdownContainer: {
    backgroundColor: theme.bgColor,
    borderRadius: scaledSize(12),
    borderColor: theme.borderColor,
    borderWidth: .5,
    marginTop: scaledSize(4),
    overflow: 'hidden',
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaledSize(14),
  },

  bankIcon: {
    height: scaledSize(24),
    width: scaledSize(24),
    marginRight: scaledSize(10),
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