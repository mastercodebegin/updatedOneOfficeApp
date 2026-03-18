// Foo.jsx
import Toast from 'react-native-toast-message';
import { Button } from 'react-native'

export function ErrorToast(props:any) {
    console.log(props);
    
    Toast.show({
      type: 'error',
      text1: props,
      text2: '',
    })
}

export function CustomSuccessToast(props:any) {
  console.log(props);
  
  Toast.show({
    type: 'success',
    text1: props,
    text2: '',
  })
}

export function CustomErrorToast(props:any) {
  console.log(props);
  
  Toast.show({
    type: 'error',
    text1: props,
    text2: '',
  })
}