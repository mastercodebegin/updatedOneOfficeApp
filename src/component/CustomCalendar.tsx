import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { scaledSize, widthFromPercentage } from '../utilies/Utilities';
import { COLORS } from '../utilies/GlobalColors';
import { Fonts } from '../assets/fonts/GlobalFonts';
import CustomeButton from './CustomButton';
import { color } from 'react-native-elements/dist/helpers';
import Icon from 'react-native-vector-icons/Ionicons';

interface S {
  onSelectDate: any,
  onCancelPress:Function

}

interface SS {
  selectedStartDate: any,


}


export default class CustomCalendar extends Component<S, SS> {
  constructor(props) {
    super(props);
    this.state = {
      selectedStartDate: new Date(),
    };
    this.onDateChange = this.onDateChange.bind(this);
  }

 monthColor='black'
 dateColor='black'


  componentDidUpdate() {
    console.log(this.state.selectedStartDate);
    this.props.onSelectDate(this.state.selectedStartDate)

  }
  onDateChange(date) {
    this.setState({
      selectedStartDate: date,
    });
  }

  customDayHeaderStylesCallback = () => {
    return {
      style: {
        backgroundColor: 'transparent', // Keep background transparent or customize it
      },
      textStyle: {
        color: COLORS.THEME_COLOR, // Change this to your desired color for week names
        fontWeight: 'bold',
      },
    };
  };
  // BUTTON_PURPLE: '#813BE3',
  // LIGHT_PURPLE: '#b078ff',

  render() {
    const { selectedStartDate } = this.state;
    const startDate = selectedStartDate ? selectedStartDate.toString() : '';
    return (
      <View style={[{ width: scaledSize(430), alignSelf: 'center', backgroundColor: 'white', height: scaledSize(400),borderRadius:4 }]}>
        <CalendarPicker
          onDateChange={this.onDateChange}
          yearTitleStyle={{ fontSize: scaledSize(14), marginLeft: scaledSize(20), }}
          yearTitle
          previousComponent={<Icon name="caret-back" size={24} color={COLORS.THEME_COLOR} />}
          nextComponent={<Icon name="caret-forward-outline" size={24} color={COLORS.THEME_COLOR} />}

          // previousTitleStyle={{ fontSize: scaledSize(14), fontFamily: Fonts.bold,color:'#813BE3' }}
          // nextTitleStyle={{ color: '#813BE3', fontSize: scaledSize(14), fontFamily: Fonts.bold }}
          // initialView={{backgroundColor:COLORS.purple,}}
          textStyle={{ color:this.dateColor }}
          todayTextStyle={{ color: 'white', }}
          todayBackgroundColor={COLORS.THEME_COLOR}
          selectedDayColor={'#813BE3'}
          selectedDayTextColor={'white'}

          // customDayHeaderStyles={this.customDayHeaderStylesCallback}



        />

        <View style={{ height: scaledSize(40), width: widthFromPercentage(90), alignSelf: 'center',
          marginTop:scaledSize(20) }}>
          <CustomeButton name='Done' onPress={() => this.props.onCancelPress()} 
          buttonStyle={{backgroundColor:COLORS.THEME_COLOR,
            // borderWidth:.5,borderColor:COLORS.THEME_COLOR,
            borderRadius:scaledSize(6)}} 
          textStyle={{color:'white',fontSize:scaledSize(12),letterSpacing:2}} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: scaledSize(100),

  },
});