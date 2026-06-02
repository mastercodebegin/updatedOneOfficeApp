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

import MaterialIcons
from 'react-native-vector-icons/MaterialIcons';

import {
  scaledSize,
} from '../utilies/Utilities';

import {
  useTheme,
} from '../screen/theme/useTheme';

import {
  Fonts,
} from '../assets/fonts/GlobalFonts';

interface Props {

  visible:boolean;

  files:Array<any>;

  protectedFiles?:Array<any>;

  onClose:()=>void;

  onSubmit:(
    passwords:any
  )=>void;
}

const CustomMultiplePdfPasswordModal =
(
 props:Props
) => {

 const {

  visible,

  files,

  onClose,

  onSubmit,

  protectedFiles=[],

 } = props;

 const {
  theme,
 } = useTheme();

 const [
  passwords,

  setPasswords,

 ] = useState<
  Array<{

   id:number|string;

   pass:string;

  }>
 >([]);

 const [

  hidden,

  setHidden,

 ] = useState({});

 useEffect(() => {

  console.log(
   'protectedFiles',
   protectedFiles
  );

 }, []);

 const updatePassword =
 (
  id:string,

  value:string,
 ) => {

  setPasswords(
   prev => {

    const exists =
      prev.some(
       item =>
       item.id === id
      );

    if (exists) {

      return prev.map(
       item =>

       item.id === id

       ? {

          ...item,

          pass:value,

         }

       : item
      );
    }

    return [

      ...prev,

      {

       id,

       pass:value,

      },

    ];
   }
  );
 };

 const checkIsProtectedFile =
 (
  item:any,
 ) => {

  return protectedFiles.some(
   file =>

   file.id === item.id
  );
 };

 const renderItem =
 ({ item }) => {

  const password =

   passwords.find(

    file =>

    file.id === item.id

   )?.pass || '';

  const secure =

   hidden[item.id]

   !== false;

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

    }}>

    {/* top */}

    <View
     style={{

      flexDirection:'row',

      alignItems:'center',

     }}>

      {/* icon */}

      <View
       style={{

        width:48,

        height:48,

        borderRadius:12,

        backgroundColor:

        theme.buttonBGColor,

        justifyContent:

        'center',

        alignItems:

        'center',

        marginRight:12,

       }}>

       {checkIsProtectedFile(
         item
       ) ? (

        <MaterialIcons

         name='lock'

         size={20}

         color='#FF4D67'

        />

       ) : (

        <Text
         style={{

          color:'green',

          fontWeight:'700',

         }}>

         PDF

        </Text>

       )}

      </View>

      {/* file */}

      <View
       style={{
        flex:1,
       }}>

       <Text
        numberOfLines={1}

        style={{

         color:

         theme.primaryTextColor,

         fontSize:18,

        }}>

        {item.name}

       </Text>

       <Text
        style={{

         color:

         theme.secondaryTextColor,

         marginTop:4,

        }}>

        {item.size}

       </Text>

      </View>

    </View>

    {/* input */}

    <View
     style={{

      marginTop:18,

      borderWidth:1,

      borderColor:

      theme.borderColor,

      borderRadius:14,

      flexDirection:'row',

      alignItems:'center',

      paddingHorizontal:14,

     }}>

      <TextInput

       value={password}

       secureTextEntry={
        secure
       }

       placeholder='Password'

       placeholderTextColor=
       '#7C8798'

       style={{

        flex:1,

        color:

        theme.primaryTextColor,

        height:52,

       }}

       onChangeText={
        txt =>

        updatePassword(
         item.id,

         txt
        )
       }
      />

      <TouchableOpacity
       onPress={() => {

        setHidden(
         prev => ({

          ...prev,

          [item.id]:
           !secure,

         })
        );
       }}>

       <MaterialIcons

        name={
         secure
         ? 'visibility-off'
         : 'visibility'
        }

        size={22}

        color='#A2A9B8'
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

   animationType='fade'>

   <View
    style={{

      flex:1,

      backgroundColor:
      'rgba(0,0,0,.65)',

      justifyContent:
      'center',

      padding:
      scaledSize(18),

    }}>

    <View
     style={{

      backgroundColor:

      theme.bgContainor,

      borderRadius:

      scaledSize(24),

      padding:

      scaledSize(20),

      maxHeight:'82%',

     }}>

      {/* title */}

      <Text
       style={{

        color:

        theme.primaryTextColor,

        fontSize:

        scaledSize(20),

        fontWeight:'500',

        fontFamily:

        Fonts.regular,

        marginBottom:18,

       }}>

       Password Required

      </Text>

      {/* list */}

      <FlatList

       data={files}

       keyExtractor={
        item =>

        item.id.toString()
       }

       renderItem={
        renderItem
       }

       showsVerticalScrollIndicator=
       {false}
      />

      {/* buttons */}

      <View
       style={{

        flexDirection:'row',

        justifyContent:
        'space-between',

        marginTop:20,

       }}>

       <TouchableOpacity

        onPress={onClose}

        style={{

         flex:.45,

         height:50,

         borderWidth:1,

         borderColor:

         theme.borderColor,

         borderRadius:14,

         justifyContent:
         'center',

         alignItems:
         'center',

        }}>

        <Text
         style={{
          color:'#AAB2C0',
         }}>

         Cancel

        </Text>

       </TouchableOpacity>

       <TouchableOpacity

        onPress={() =>
         onSubmit(
          passwords
         )
        }

        style={{

         flex:.45,

         height:50,

         backgroundColor:

         theme.buttonBGColor,

         borderRadius:14,

         justifyContent:
         'center',

         alignItems:
         'center',

        }}>

        <Text
         style={{

          color:

          theme.iconColor,

          fontWeight:'700',

         }}>

         Open Files

        </Text>

       </TouchableOpacity>

      </View>

    </View>

   </View>

  </Modal>
 );
};

export default
CustomMultiplePdfPasswordModal;