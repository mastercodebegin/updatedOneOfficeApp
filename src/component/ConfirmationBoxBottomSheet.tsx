import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Popup, Root, SPSheet } from 'react-native-popup-confirm-toast';

const  CustomComponent=()=>{
    return(<View>
<Text>hi</Text>
    </View>)
}
const ConfirmationBoxBottomSheet = (props) => {
  const handlePress = () => {
    const spSheet = SPSheet;
    spSheet.show({
      component: () => <CustomComponent {...props} spSheet={spSheet} />,
      dragFromTopOnly: true,
      onCloseComplete: () => {
        alert('onCloseComplete');
      },
      onOpenComplete: () => {
        alert('onOpenComplete');
      },
      height: 360,
    });
  };

  return (
    <View>
    <TouchableOpacity
        onPress={() =>
            Popup.show({
                type: 'confirm',
                title: 'Delete!',
                textBody: 'Do you want to delete file ',
                buttonText: 'Ok',
                confirmText: 'Cancel',
                callback: () => {
                   // alert('Okey Callback && hidden');
                    Popup.hide();
                },
                cancelCallback: () => {
                   // alert('Cancel Callback && hidden');
                    Popup.hide();
                },
            })
        }
    >
    </TouchableOpacity>
</View>
  );
};

export default ConfirmationBoxBottomSheet;
