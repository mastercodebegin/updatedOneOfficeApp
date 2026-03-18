import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useState } from "react";
import { View } from "react-native";



const TIME = { min: 0, max: 23 };
const SliderPad = 23;

const CustomRangePicker = ({timeRange, onChange}) => {
  const { min, max } = TIME;
  const [width, setWidth] = useState(280);
  const [selected, setSelected] = useState<Array<number>>([]);

  if (!selected) {
    setSelected([min, max]);
  }

  const onLayout = (event) => {
    setWidth(event.nativeEvent.layout.width - SliderPad * 2);
  };

  return (
    <View onLayout={onLayout} style={{
      width: "100%",
    }}>
      <MultiSlider
        min={min}
        max={max+1}
        values={timeRange}
        sliderLength={width}
        onValuesChangeFinish={onChange}
        enableLabel={true}
        // customLabel={SliderCustomLabel(textTransformerTimes)}
        // customMarker={CustomMarker}
        // markerSize={20}
        trackStyle={{
          height: 5,
          borderRadius: 8,
        }}
        markerOffsetY={3}
        selectedStyle={{
          backgroundColor: "#D764FF",
        }}
        unselectedStyle={{
          backgroundColor: "rgba(38, 38, 38,1)",
        }}
      />
    </View>
  );
};

export default CustomRangePicker;
