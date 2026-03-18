import React, { useEffect } from 'react'
import { View ,Text,SafeAreaView} from 'react-native';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    renderers,
    MenuProvider
    
    
  } from 'react-native-popup-menu';
  import Icon from 'react-native-vector-icons/Ionicons';
import { scaledSize } from '../utilies/Utilities';

  export const CustomMenu = ({Icon,menuOptionstyle,menuOption}) =>{
  useEffect(()=>{
// console.log('icon-------',Icon);
// console.log('menuOption-------',menuOption);

  },[Icon,menuOptionstyle,menuOption])
  
    
   return(<SafeAreaView>
      <Menu renderer={renderers.Popover}
      rendererProps={{placement: 'bottom', anchorStyle: {backgroundColor: 'white'}}}
    //   MenuProvider={}
      //   rendererProps={{placement:'bottom',preferredPlacement:'left'}}
    
      >
        <MenuTrigger>
            {Icon}
            </MenuTrigger>
        <MenuOptions customStyles={{optionWrapper: menuOptionstyle, optionText: {color:'black',fontSize:14}}}>
{menuOption?.map((item,index)=>
  <MenuOption key={index+1}onSelect={() =>item.onSelect()} disabled={false}>
    <Text style={{fontSize:scaledSize(16),}}>{item.label}</Text>
    </MenuOption>)}
    </MenuOptions>
      </Menu>
    </SafeAreaView>
 ) }
  export default CustomMenu

// import * as React from 'react';
// import { View,SafeAreaView} from 'react-native';
// import { Button, Menu, Divider, Provider } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/Ionicons';

// const CustomMenu = (props) => {
//   const [visible, setVisible] = React.useState(false);

//   const openMenu = () => setVisible(true);

//   const closeMenu = () => setVisible(false);

//   return (
//     <Provider>
//       <SafeAreaView
//         style={{
//           flexDirection: 'row',
//         //   backgroundColor:'blue',
//           justifyContent: 'flex-end',
//           alignItems:'flex-end',
//           zIndex:1
//         }}>
//         <Menu
        
//           visible={visible}
//           onDismiss={closeMenu}
//           anchor={<Icon  name="menu" size={40} onPress={openMenu}></Icon>}>
//           <Menu.Item onPress={(e)=>{onPress('e'),closeMenu()}} title="Item 1" />
//           <Menu.Item onPress={(e)=>{onPress('e'),closeMenu()}} title="Item 2"/>
//           {/* <Divider /> */}
//           <Menu.Item onPress={(e)=>{onPress('e'),closeMenu()}} title="Item 3" />
//         </Menu>
//       </SafeAreaView>
//     </Provider>
//   );
// };

// export default CustomMenu;