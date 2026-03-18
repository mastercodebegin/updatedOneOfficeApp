import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { IconLibraryType,VECTOR_ICON_LIBRARIES } from '../utilies/Utilities';

interface CustomVectorIconProps {
  iconLibrary: IconLibraryType; // 👈 Now it enforces valid keys
  iconName: string;
  size?: number;
  onPress?:Function
  style?:StyleProp<TextStyle>
}

const CustomVectorIcon: React.FC<CustomVectorIconProps> = ({ 
  iconLibrary, 
  iconName, 
  size = 24, 
  style={},
  onPress=()=>{}
}) => {
  const IconComponent = VECTOR_ICON_LIBRARIES[iconLibrary];

  if (!IconComponent) {
    console.warn(`❌ Icon library "${iconLibrary}" not found`);
    return null;
  }

  return <IconComponent name={iconName}
   size={size}  onPress={()=>onPress()} style={{...style}}/>;
};

export default CustomVectorIcon;
