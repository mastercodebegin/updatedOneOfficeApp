import * as React from 'react';
import { FAB, Portal, Provider } from 'react-native-paper';
import { MSOffice, PdfIcon } from '../assets/GlobalImages';
import DocumentPicker from 'react-native-document-picker';
import { COLORS } from '../utilies/GlobalColors';
import { Image } from 'react-native';
import { scaledSize } from '../utilies/Utilities';

interface S {
  onPress: any,
  icon?:any
}
const FloatingButton = (props: S) => {
  const { onPress, icon } = props;
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  //   const openFile= async ()=>{
  //     try {
  //       const res = await DocumentPicker.pickMultiple({
  //         type:DocumentPicker.types.pdf 
  //       })
  // console.log('response-----',res);
  // // navigation.navigate('PdfViewer',{uri:res.uri})


  //     } catch (error) {

  //     }

  //   }

  return (
    // <Provider>
    //   <Portal>
      <FAB.Group
      open={open}
      visible
      fabStyle={{backgroundColor:COLORS.THEME_COLOR,
        borderRadius:scaledSize(70),
        height:scaledSize(70),width:scaledSize(70)}}
      backdropColor={COLORS.TRANSPARENT}
      color={'red'}
      // icon={'plus'}
      actions={[]}
      icon={icon?() => icon
        :'plus'}
      onStateChange={onStateChange}
      onPress={() => props.onPress()}
    />
   
  );
};

export default FloatingButton;