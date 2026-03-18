import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Feather';

import { COLORS } from '../utilies/GlobalColors';
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

  const [isFocus, setIsFocus] = useState(false);

  const theme = useColorScheme();

  /* ---------- Dropdown Item ---------- */

  const renderDropdownItem = (item: any) => {
    console.log('dropdown item', item);

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

  useEffect(() => {
    console.log('dropdown data', data);
    console.log('dropdown LeftIcon', LeftIcon);
  }, );

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

        data={data}
        renderItem={renderDropdownItem}

        search={isShowSearch}
        maxHeight={220}

        labelField="label"
        valueField="id"

        placeholder={placeholder}
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
          // setIcon(item.icon);
          setIsFocus(false);
          onSelect(item);
        }}

        renderLeftIcon={() =>
          LeftIcon ? (
            <LeftIcon />
          ) : (
            <Icon
              name="user"
              size={scaledSize(14)}
              color={COLORS.THEME_COLOR}
              style={{ marginRight: 8 }}
            />
          )
        }
      />

    </View>

  );
};

export default CustomDropdown;

const styles = StyleSheet.create({

  wrapper: {
    width: '100%',
    marginTop: scaledSize(8),
  },

  dropdown: {
    height: scaledSize(40),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    //  backgroundColor:'#FAFAFA',
  },

  focusedDropdown: {
    borderColor: COLORS.THEME_COLOR,
    backgroundColor: '#fff'
  },

  placeholderStyle: {
    fontSize: 14,
    color: '#999'
  },

  selectedTextStyle: {
    fontSize: 15,
    color: '#222',
    left: scaledSize(4)

  },

  searchInput: {
    height: 40,
    fontSize: 14,
    borderRadius: 8
  },

  iconStyle: {
    width: 20,
    height: 20
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  bankIcon: {
    height: ICON_SIZE,
    width: ICON_SIZE,
    marginRight: 10
  },

  bankLabel: {
    fontSize: scaledSize(13),
    color: '#333',
    //  left:scaledSize(10)
  },

  selectedIcon: {
    height: ICON_SIZE,
    width: ICON_SIZE,
    marginRight: 10
  }

});