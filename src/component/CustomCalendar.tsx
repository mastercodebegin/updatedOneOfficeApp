import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { scaledSize, widthFromPercentage } from '../utilies/Utilities';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import { FONTS } from '../utilies/GlobalColors';

interface S {
  onSelectDate: (date: any) => void,
  onCancelPress: () => void
}

export default function CustomCalendar(props: S) {
  const { onSelectDate, onCancelPress } = props;
  const { theme, mode } = useTheme();
  const styles = useMemo(() => createStyles(theme, mode), [theme, mode]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    onSelectDate(selectedDate);
  };

  const today = new Date();
  const customDatesStyles = [{
    date: today,
    style: styles.todayStyle,
    textStyle: styles.todayTextStyle,
  }];

  return (
    <View style={styles.container}>
      <View style={styles.dragIndicator} />
      <CalendarPicker
        onDateChange={onDateChange}
        width={widthFromPercentage(82)}
        headerWrapperStyle={styles.headerWrapper}
        monthTitleStyle={styles.monthTitle}
        yearTitleStyle={styles.yearTitle}
        previousComponent={
          <View style={styles.arrowContainer}>
            <Icon name="chevron-back" size={24} color={theme.themeColor} />
          </View>
        }
        nextComponent={
          <View style={styles.arrowContainer}>
            <Icon name="chevron-forward" size={24} color={theme.themeColor} />
          </View>
        }
        dayLabelsWrapper={styles.weekLabelsWrapper}
        dayOfWeekStyles={styles.weekDayLabel}
        dayStyle={styles.dayContainer}
        textStyle={styles.dayText}
        selectedDayStyle={styles.selectedDay}
        selectedDayTextStyle={styles.selectedDayText}
        todayBackgroundColor={'transparent'} // Handled by customDatesStyles
        todayTextStyle={styles.todayTextStyle} // Handled by customDatesStyles
        customDatesStyles={customDatesStyles}
        disabledDatesTextStyle={styles.disabledDateText}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancelPress}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
  container: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: theme.bgContainor,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.borderColor,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0, // No extra padding
    marginBottom: 20,
  },
  arrowContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: theme.buttonBGColor,
  },
  monthTitle: {
    fontSize: scaledSize(16),
    // fontWeight: '700',
    letterSpacing:1,
    color: theme.primaryTextColor,
  },
  yearTitle: {
    fontSize: scaledSize(16),
    // fontWeight: '700',
    color: theme.primaryTextColor,
    fontFamily:FONTS.regular,
    letterSpacing:.5
  },
  weekLabelsWrapper: {
    borderBottomWidth: 0,
    paddingBottom: 10,
  },
  weekDayLabel: {
    fontSize: scaledSize(12),
    color: theme.secondaryTextColor,
    fontWeight: '500',
  },
  dayContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: theme.primaryTextColor,
    fontSize: scaledSize(14),
  },
  selectedDay: {
    backgroundColor: theme.themeColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    elevation: 4,
    shadowColor: theme.themeColor,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  selectedDayText: {
    color: 'white',
    // fontWeight: '700',
  },
  todayStyle: {
    backgroundColor: 'transparent',
    color: theme.themeColor,
    // fontWeight: '700',
  },
  todayTextStyle: {
    color: theme.themeColor,
    // fontWeight: '700',
  },
  disabledDateText: {
    opacity: 0.35,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.primaryTextColor,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    // borderWidth:.5,borderColor:theme.themeColor,
    backgroundColor: theme.buttonBGColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: theme.themeColor,
    fontSize: 16,
    fontWeight: '600',
  },
});