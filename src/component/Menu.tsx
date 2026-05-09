import React from 'react';

import {
  SafeAreaView,
  Text,
} from 'react-native';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';

import { scaledSize } from '../utilies/Utilities';

import { useTheme } from '../screen/theme/useTheme';

type MenuItem = {
  label: string;
  onSelect: () => void;
};

type Props = {
  Icon: React.ReactNode;

  menuOptionstyle?: any;

  menuOption: MenuItem[];
};

export const CustomMenu = ({
  Icon,
  menuOptionstyle,
  menuOption,
}: Props) => {
  const { mode, theme } = useTheme();

  return (
    <SafeAreaView>
      <Menu
        renderer={renderers.Popover}
        rendererProps={{
          placement: 'bottom',
          anchorStyle: {
            backgroundColor:theme.bgColor
              
          },
        }}>

        <MenuTrigger>
          {Icon}
        </MenuTrigger>

        <MenuOptions
          customStyles={{
            optionsContainer: {
              backgroundColor: theme.bgColor,
              // mode === 'dark'
              //   ? theme.bgColor
              //   : '#FFFFFF',

              borderRadius: scaledSize(14),

              paddingVertical: scaledSize(4),

              minWidth: scaledSize(150),

              borderWidth: scaledSize(1),

              borderColor:
                mode === 'dark'
                  ? '#2B2E38'
                  : '#ECEEF5',

              shadowColor: '#000',

              shadowOpacity:
                mode === 'dark'
                  ? 0.25
                  : 0.08,

              shadowRadius: 10,

              shadowOffset: {
                width: 0,
                height: 4,
              },

              elevation: 6,
            },

            optionWrapper: {
              paddingVertical: scaledSize(12),

              paddingHorizontal: scaledSize(12),

              ...menuOptionstyle,
            },

          }}>

          {menuOption?.map(
            (item, index) => (
              <MenuOption
                key={index}
                onSelect={item.onSelect}>

                <Text
                  style={{
                    fontSize:
                      scaledSize(14),

                    color: theme.primaryTextColor,


                    // fontWeight: '600',
                    letterSpacing: .5,
                  }}>
                  {item.label}
                </Text>
              </MenuOption>
            ),
          )}
        </MenuOptions>
      </Menu>
    </SafeAreaView>
  );
};

export default CustomMenu;