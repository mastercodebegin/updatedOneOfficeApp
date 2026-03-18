import React from 'react';
import { View, Image } from 'react-native';
import SvgUri from 'react-native-svg-uri';

const SvgImageDisplay = () => {
  return (
    <View>
      {/* Using SvgUri to display the SVG */}
      <SvgUri
        width="200"
        height="200"
        source={require('../assets/images/svg/close.svg')} // Replace with your SVG file path
      />
    </View>
  );
};

export default SvgImageDisplay;
