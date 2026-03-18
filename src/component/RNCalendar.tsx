import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const RNCalendar = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month.month);
  };

  return (
    <View>
      <Picker
        selectedValue={selectedYear}
        style={styles.picker}
        onValueChange={(itemValue) => handleYearChange(itemValue)}
      >
        {/* Render a list of years */}
        {Array.from({ length: 50 }, (_, i) => (
          <Picker.Item key={i} label={`${2024 - i}`} value={2020 - i} />
        ))}
      </Picker>
      <Calendar
        current={`${selectedYear}-${selectedMonth < 10 ? '0' : ''}${selectedMonth}-01`}
        onMonthChange={handleMonthChange}
        // Other calendar props here...
      />
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: 150,
    alignSelf: 'center',
  },
});
export default RNCalendar;