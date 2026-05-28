import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Image, Modal,
  TextInput,
  SafeAreaView,
  FlatList, Alert,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomCloseIcon from '../../component/CustomCloseIcon'
import {  scaledSize, Utility, widthFromPercentage } from '../../utilies/Utilities'
import { COLORS, FONTS } from '../../utilies/GlobalColors'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Entypo from 'react-native-vector-icons/EvilIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Feather from 'react-native-vector-icons/Feather'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

import { Axis, BOB, BOI, Canera, HDFC, Icici, IDFC, Indusind, Kotak, PNB, RBL, SBI, YesBank } from '../../assets/GlobalImages'
import CustomDropdown from '../../component/CustomDropDown'
import { asyncStorageKeyName, BANK_LOGOS, banksName, BanksObject, CONSTANT, getBankIconByName } from '../../utilies/Constants'
import CustomInput from '../../component/CustomInput'
import CustomeButton from '../../component/CustomButton'
import { Fonts } from '../../assets/fonts/GlobalFonts'
import CustomInputBox from '../../component/CustomInputBox'
import RNCalendar from '../../component/RNCalendar'
import CustomCalendar from '../../component/CustomCalendar'
import FloatingButton from '../../component/FloatingButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomLinearGradientView from '../../component/CustomLinearGradientView'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomFAB from '../../component/CustomFAB'
import CustomLinearButton from '../../component/CustomLinearButton'
import CustomBackIcon from '../../component/CustomBackIcon'
import CustomVectorIcon from '../../component/CustomVectorIcon'
import { useTheme } from '../theme/useTheme'
import ConfirmationDialog from '../../component/ConfirmationDialog'
import CustomErrorMsgModal from '../../component/CustomErrorMsgModal'


const data = [
  {
    id: 1,
    label: "Axis",
    value: {
      bankName: "Axis",
      isCap: true
    }
  },
  {
    id: 2,
    label: "HDFC",
    value: {
      bankName: "HDFC",
      isCap: true
    }
  },
  {
    id: 3,
    label: "ICICI",
    value: {
      bankName: "ICICI",
      isCap: false
    }
  }
];

interface S {
  onPress: Function
}
export default function SaveUserCardDetails(props: S) {
  const { onPress } = props
  const { theme, mode } = useTheme()

  const [isShowAddCardModal, setIsShowAddCardModal] = useState(false)
  const [isEditUserShowModal, setIsEditUserShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string, firstName: string, lastName: string, mobileNumber: string }>()
  const [isShowCalendar, setIsShowCalendar] = useState(false)
  const [isShowAddUserDetailsModal, setIsShowAddUserDetailsModal] = useState(false)
  const [isShowCardsModal, setIsShowCardsModal] = useState(false)
  const [bankName, setBankName] = useState('')
  const [userName, setUserName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [dateOfBirth, setdateOfBirth] = useState('')
  const [lastFourDigit, setLastFourDigit] = useState('')
  const [parentIndex, setParentIndex] = useState<number>(0)
  const [userDetails, setUserDetails] = useState([])
  const [selectedDate, setSelectedDate] = useState(null);
  const [isStateUpdated, setIsStateUpdated] = useState(false);
  const [isCustomerIdRequired, setIsCustomerIdRequired] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [selectedBank, setSelectedBank] = useState({});
  const [isCardNameUpdate, setIsCardNameUpdate] = React.useState(false);
  const [cardId, setCardId] = React.useState(0)
  const [updatedCardNumber, setUpdatedCardNumber] = React.useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // const [cardI, setDropDownCard] = useState<any>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isUserDeleteConfirmationVisible, setIsUserDeleteConfirmationVisible] = useState(false);
  const [userToDeleteIndex, setUserToDeleteIndex] = useState<number | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isShowErrorModal, setIsShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const styles = React.useMemo(() => createStyles(theme, mode), [theme, mode]);

  const getPasswordByIsCap = (isCap: boolean, value: string) => {
    if (isCap == undefined) {
      setErrorMessage('Sorry, we could not generate the password. Please check user details again.');
      setIsShowErrorModal(true);
      return true
    }
    if (isCap) {
      return value.toUpperCase()
    }
    else {
      return value
    }
  }

  function getDateAndMonth(dob) {
    // Split the dob string by '/' and extract the day and month
    const [day, month] = dob.split('/');

    // Return the formatted day and month as "DD-MM"
    return `${day}${month}`;
  }
  const onSelectBank = (v: any) => {
    console.log('onselect bank', v);

    setBankName(v.label)
    setSelectedBank(v)
    if (v.value.isCustomerIdRequired) {
      setIsCustomerIdRequired(true)
    }
    else {
      setIsCustomerIdRequired(false)
    }
    return true

    // -----------------------------
    const { isFirstName4CharAndDobDDMM, isFirstName4CharAndCardLast4Digit,
      isFirstName4CharAndDobDDMMYYYY, isCustomerIdRequired,
      isFirstName4CharAndDobDDMMYY, isMobileNumber, isFirstName4CharAndDobYYYY,
      label, isCap, } = v.value
    const { firstName, dob } = selectedUser
    const firstFourChars = firstName.substring(0, 4)
    var selectedCard = selectedUser.cards.find((card: any) => card.bankName == label)
    if (selectedCard == undefined) {
      alert('No card found for this bank please add card first! ');
      return true
    }
    const { lastFourDigit } = selectedCard
    // console.log(v);
    // console.log('selectedUser=====================', selectedUser);
    // console.log('v=====================',v);
    // console.log('check isFirstName4CharAndDobDDMM=====================',isFirstName4CharAndDobDDMM);
    // console.log('isFirstName4CharAndCardLast4Digit=====================',isFirstName4CharAndCardLast4Digit);
    console.log('selectedCard ', selectedCard);
    // console.log('v ', v);


    if (isFirstName4CharAndCardLast4Digit) {
      const value = getPasswordByIsCap(isCap, firstFourChars + lastFourDigit)
      console.log(value);
      return value

    }
    else if (isFirstName4CharAndDobDDMM) {
      console.log('v.isFirstName4CharAndDobDDMM',);
      console.log('selectedCard isFirstName4CharAndDobDDMM', selectedCard);
      console.log('firstName', firstName);
      console.log('lastfourdigit', lastFourDigit);
      console.log(firstName + lastFourDigit);
      console.log('dob===', dob);
      const date = getDateAndMonth(dob)
      console.log(date);
      const value = getPasswordByIsCap(isCap, firstFourChars + date)
      console.log(value);
      return value

    }
    else if (isFirstName4CharAndDobDDMMYY) {
      const [day, month, year] = dob.split('/');
      const shortYear = year.substring(2, 4);
      const date = day + month + shortYear
      console.log(date);
      const value = getPasswordByIsCap(isCap, firstFourChars + date)
      console.log(value);
      return value
    }
    else if (isFirstName4CharAndDobDDMMYYYY) {
      const [day, month, year] = dob.split('/');
      const date = day + month + year
      console.log(date);
      const value = getPasswordByIsCap(isCap, firstFourChars + date)
      console.log(value);
      return value
    }
    else if (isMobileNumber) {
      console.log(selectedUser?.mobileNumber);

      return selectedUser?.mobileNumber
    }
    else if (isFirstName4CharAndDobYYYY) {
      const [date, month, year] = dob.split('/');
      console.log('year-----', year);
      const value = getPasswordByIsCap(isCap, firstFourChars + year)
      console.log(value);
      return value
    }

    else if (v.value.isCustomerIdRequired) {
      console.log('year-----', selectedCard.customerId);
      return selectedCard.isCustomeIdRequired
    }

    else {
      console.log('else========', v.value);
    }







  }
  const bankList =
    [
      {
        "id": 1,
        "label": "Axis",
        "value": {
          "isFirstName4CharAndDobDDMM": true,
          "isCap": true,
          "bankName": "Axis",

        },
        "icon": Axis
      },
      {
        "id": 2,
        "label": "Bank Of Baroda",
        "value": {
          "isCap": true,
          "isFirstName4CharAndDobDDMM": true,
          "bankName": "BOB",
        },
        "icon": BOB
      },
      {
        "id": 3,
        "label": "HDFC",
        "value": {
          "isCap": true,
          "isFirstName4CharAndCardLast4Digit": true,
          "bankName": "HDFC",
        },
        "icon": HDFC
      },
      {
        "id": 4,
        "label": "ICICI",
        "value": {
          "isCap": false,
          "isFirstName4CharAndDobDDMM": true,
          "bankName": "ICICI",
        },
        "icon": Icici
      },
      {
        "id": 5,
        "label": "INDUSIND",
        "value": {
          "isCap": false,
          "isFirstName4CharAndDobDDMM": true,
          "bankName": "INDUSIND",
        },
        "icon": Indusind
      },
      {
        "id": 6,
        "label": "RBL",
        "value": {
          "isCap": true,
          "isFirstName4CharAndDobDDMMYY": true,
          "bankName": "RBL",
        },
        "icon": RBL
      },
      {
        "id": 7,
        "label": "SBI",
        "value": {
          "isDobDDMMYYYYCardLast4Digit": true,
          "isCap": false,
          "bankName": "SBI",
        },
        "icon": SBI
      },
      {
        "id": 8,
        "label": "BOI",
        "value": {
          "isMobileNumber": true,
          "isCap": false,
          "bankName": "BOI",
        },
        "icon": BOI
      },
      {
        "id": 9,
        "label": "CANERA",
        "value": {
          "isCap": true,
          "isCustomerIdRequired": true,
          "bankName": "CANERA",
        },
        "icon": Canera
      },
      {
        "id": 10,
        "label": "KOTAK",
        "value": {
          "isCap": false,
          "isFirstName4CharAndDobYYYY": true,
          "bankName": "KOTAK",
        },
        "icon": Kotak
      },
      {
        "id": 11,
        "label": "PNB",
        "value": {
          "isFirstName4CharAndDobDDMM": true,
          "bankName": "PNB",
          "isCap": false,

        },
        "icon": PNB
      },
      {
        "id": 12,
        "label": "IDFC",
        "value": {
          "isCap": true,
          "isDobDDMM": true,
          "bankName": "IDFC",
        },
        "icon": IDFC
      },
      {
        "id": 13,
        "label": "YESBANK",
        "value": {
          "isFirstName4CharAndDobYYYY": true,
          "isCap": true,
          "bankName": "YESBANK",

        },
        "icon": YesBank
      },
      {
        "id": 14,
        "label": "Standard Chartered",
        "value": {
          "isFirstName4CharAndDobYYYY": true,
          "bankName": "Standard Chartered",
          "isCap": true,

        },
        "icon": YesBank
      }
    ]

  useEffect(() => {
    const data = async () => {
      const savedUsers = await AsyncStorage.getItem(asyncStorageKeyName.SAVED_USERS)
      // console.log('savedcards----', savedUsers);
      // console.log('isStateUpdated----', isStateUpdated);
      const parseObj = JSON.parse(savedUsers)
      if (parseObj && !isStateUpdated) {
        console.log('typeof--', parseObj);

        setUserDetails(parseObj)
        setIsStateUpdated(true)
      }

    }
    data()
  }, [userDetails])
  const deleteCardHandler = async (childIndex, parentIdx) => {
    // Create a deep copy of the userDetails object at the given parent index
    let arrStr = JSON.stringify(userDetails[parentIdx]);
 
    console.log('arrStr==========', arrStr);

    let arr = JSON.parse(arrStr);

    let cards = arr.cards;
    // Remove the card at the given childIndex
    cards.splice(childIndex, 1);
    // Update the cards array
    arr.cards = cards;
    console.log('arr================', arr);
    const tempUser = arr
    tempUser.cards = [...cards]
    // console.log('tempUser================', tempUser);
    // console.log('tempUser================', tempUser);

    setSelectedUser(tempUser);
    // Update the userDetails state
    let updatedUserCardDetails = [...userDetails];
    updatedUserCardDetails[parentIdx] = arr;

    // Set the new state
    setUserDetails(updatedUserCardDetails);
    await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(updatedUserCardDetails));
  };

  const addUserDetail = async () => {
    console.log('selectedbank', selectedBank);
    if (firstName.length == 0) {
      setErrorMessage('Please enter first name');
      setIsShowErrorModal(true);
      return;
    }
    if (lastName.length == 0) {
      setErrorMessage('Please enter last name');
      setIsShowErrorModal(true);
      return;
    }
    if (mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid mobile number');
      setIsShowErrorModal(true);
      return;
    }
    if (selectedDate == null) {
      setErrorMessage('Please select a date');
      setIsShowErrorModal(true);
      return;
    }
    if (bankName.length == 0) {
      setErrorMessage('Please select a bank');
      setIsShowErrorModal(true);
      return;
    }
    if (isCustomerIdRequired && customerId.length == 0) {
      setErrorMessage('Please enter customer id');
      setIsShowErrorModal(true);
      return;
    }
    if (lastFourDigit.length != 4) {
      setErrorMessage('Please enter the last 4 digits of the card');
      setIsShowErrorModal(true);
      return;
    }

      const cardDetails = {
        id: Utility.generateUniqueNumber(), bankName: bankName, lastFourDigit: lastFourDigit,
        customerId: customerId, ...selectedBank
      };
      const obj = { id: Utility.generateUniqueNumber(), firstName: firstName, lastName: lastName, mobileNumber: mobileNumber, dob: selectedDate, cards: [cardDetails] }
      const data = await AsyncStorage.getItem(asyncStorageKeyName.SAVED_USERS)
      console.log('first', !!data);

      if (!!data) {
        console.log('second1', !!data);
        console.log('second1 data', data);
        let arr = JSON.parse(data)
        arr.push(obj)
        await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(arr))
        setUserDetails(arr)
        setIsShowAddUserDetailsModal(false)
      }
      else {
        console.log('else part',);
        console.log('second1', !!data);
        console.log('key', asyncStorageKeyName.SAVED_USERS);
        let arr = []
        arr.push(obj)
        await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(arr))

        setUserDetails(arr)
        setIsShowAddUserDetailsModal(false)


      }
    


  }
  const onSelectDate = (date) => {
    // console.log('date-----', date?.format('DD-MM-YYYY'));
    setSelectedDate(date.format('DD/MM/YYYY'));
    setIsShowCalendar(false)
  }
  const deleteUser = async (index: number) => {
    console.log('index', index);
    const data = await AsyncStorage.getItem(asyncStorageKeyName.SAVED_USERS)
    const userDeatilsObj = JSON.parse(data)
    userDeatilsObj.splice(index, 1)
    await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(userDeatilsObj))
    setUserDetails(userDeatilsObj)

  }
  const updateUser = async (updatedDetails: any) => {
    console.log('updatedDetails', updatedDetails);

    try {
      if (!checkValidation()) {
        console.log('returning from validation');
        return
      }
      console.log('Updating user with ID:', updatedDetails);

      const data = await AsyncStorage.getItem(asyncStorageKeyName.SAVED_USERS);
      if (data !== null) {
        const userDetailsObj = JSON.parse(data);

        // Find the index of the user with the matching ID
        const userIndex = userDetailsObj.findIndex((user: any) => user.id == selectedUser.id);
        console.log('Found user with ID:', data);

        if (userIndex !== -1) {
          // Update the user details at the found index
          userDetailsObj[userIndex] = { ...userDetailsObj[userIndex], ...updatedDetails };

          // Save the updated object back to AsyncStorage
          await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(userDetailsObj));

          // Update the state to reflect the changes
          setUserDetails(userDetailsObj);
          setIsEditUserShowModal(false)
          console.log('User details updated successfully');
        } else {
          console.log('User not found');
        }
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const checkValidation = () => {
    if (firstName.length == 0) {
      setErrorMessage('Please enter first name');
      setIsShowErrorModal(true);
      return false
    }
    if (lastName.length == 0) {
      setErrorMessage('Please enter last name');
      setIsShowErrorModal(true);
      return false
    }
    if (mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid mobile number');
      setIsShowErrorModal(true);
      return false

    }
    if (selectedDate == null) {
      setErrorMessage('Please select a date');
      setIsShowErrorModal(true);
      return false
    }

    return true
  }
  const renderChildRow = (label, value) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.labelView}>
          <Text style={styles.label}>{label} </Text>
        </View>
        <Text style={styles.text}>{value}</Text>
      </View>
    )
  }
  const showEditUserModal = (item) => {
    setFirstName(item.firstName)
    setLastName(item.lastName)
    setSelectedDate(item.dob)
    setMobileNumber(item.mobileNumber)
    setIsEditUserShowModal(true),
      setSelectedUser(item)

  }
  const renderCards = (item, childIndex, parentIndex) => {
    console.log('renderCards---', item);

    return (

      <View style={{
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: theme.bgColor,
        borderWidth:1,
        paddingHorizontal:2,
        height:scaledSize(74),
        // width:400,
        borderRadius:scaledSize(10),
        paddingVertical: scaledSize(10),
        borderBottomWidth: 0.5,
        borderColor: theme.borderColor
      }}>

        <View style={styles.bankLogoContainer}>
          <Image
            source={BANK_LOGOS[item.value.bankName]}
            style={styles.bankLogo}
            resizeMode="contain" />
        </View>

        <View style={{ flex: 1, left: scaledSize(10) }}>

          <Text style={{
            fontSize: scaledSize(12),
            fontWeight: "500",
            color: theme.primaryTextColor
          }}>
            {item.bankName}
          </Text>

          <Text style={{
            color: theme.secondaryTextColor,
            marginTop: 2
          }}>
            Card ending •••• {item.lastFourDigit}
          </Text>

        </View>

        <TouchableOpacity onPress={() => editCard(item)} 
        style={[styles.actionButton, 
        { backgroundColor: theme.buttonBGColor,marginRight:scaledSize(4) }]}>
          <MaterialCommunityIcons
            name="pencil"
            size={22}
            color={theme.iconColor}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setCardToDelete({ parentIndex: parentIndex, childIndex: childIndex });
          setIsShowDeleteConfirmation(true);
        }} style={[styles.actionButton, { backgroundColor: theme.buttonBGColor,right:scaledSize(4) }]}>
          <MaterialCommunityIcons
            name="delete"
            size={22}
            color={theme.deleteIconColor}
          />
        </TouchableOpacity>

      </View>

    )
  }

  const renderParentItem = ({ item, index }) => {
    return (
      <View
        style={{
          backgroundColor: theme.bgContainor,
          borderRadius: scaledSize(20),
          padding: scaledSize(18),
          marginVertical: scaledSize(14),
          marginHorizontal: scaledSize(16),
          borderWidth: 1,
          borderColor: theme.borderColor,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: mode === 'dark' ? 0.2 : 0.08,
          shadowRadius: 6,
        }}
      >

        {/* USER HEADER */}
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{`${item.firstName?.charAt(0) || ''}${item.lastName?.charAt(0) || ''}`.toUpperCase()}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.userNameText}>
              {Utility.string.getFirstLetterCapitalize(item.firstName)} {item.lastName}
            </Text>
            <Text style={styles.userSubtitle}>Personal Information</Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => showEditUserModal(item)}
              style={[styles.actionButton, { backgroundColor: theme.buttonBGColor }]}
            >
              <MaterialCommunityIcons name="pencil" size={22} color={theme.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setUserToDeleteIndex(index);
                setIsUserDeleteConfirmationVisible(true);
              }}
              style={[styles.actionButton, { backgroundColor: theme.buttonBGColor }]}
            >
              <MaterialCommunityIcons name="delete" size={22} color={theme.deleteIconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* USER INFO BOX */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={theme.secondaryTextColor} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>DOB:</Text>
            <Text style={styles.infoValue}>{item.dob}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={theme.secondaryTextColor} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{'+91 - ' + item.mobileNumber}</Text>
          </View>
        </View>

        {/* DIVIDER & CARDS TITLE */}
        <View style={styles.sectionDivider} />
        <View style={styles.cardsHeader}>
          <MaterialCommunityIcons name="credit-card-multiple-outline" size={20} color={theme.themeColor} />
          <Text style={styles.cardsHeaderText}>Linked Cards</Text>
        </View>

        {/* CARDS LIST */}
        <FlatList
          data={item.cards}
          renderItem={({ item, index: childIndex }) => renderCards(item, childIndex, index)}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        {/* ADD CARD BUTTON */}
        <TouchableOpacity
          onPress={() => {
            // setIsShowCardsModal(true)
            setIsShowAddCardModal(true)
            setSelectedUser(item)
            setParentIndex(index)
          }}
          style={styles.addCardButton}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.themeColor}
          />

          <Text style={styles.addCardButtonText}>
            Add Card
          </Text>
        </TouchableOpacity>

      </View>
    )
  }
  const checkIsEditable = (id: number) => {
    // console.log(id, 'id');
    // console.log(cardId, 'cardId');

    if (isCardNameUpdate && cardId == id) {
      // console.log('return true');

      return true
    }
    else {
      // console.log('return false');
      return false

    }
  }



  const renameCard = async (childIndex: any) => {
    // Step 1: Stringify and parse userDetails for immutability
    let arrStr = JSON.stringify(userDetails[parentIndex]);
    let arr = JSON.parse(arrStr);

    let cards = arr.cards;
    console.log('cadrs==1');

    // Step 2: Access the card to be renamed using childIndex
    if (cards[childIndex]) {
      // Step 3: Rename the card (for example, updating the `cardName` property)
      cards[childIndex].lastFourDigit = updatedCardNumber;
    } else {
      console.log("Card not found at the given index.");
      return;
    }

    // Step 4: Update the cards array
    arr.cards = [...cards];
    console.log('Updated array of cards:', arr);

    // Step 5: Prepare the tempUser object for the state update
    const tempUser = arr;
    tempUser.cards = [...cards];

    // Step 6: Update the selectedUser state with the renamed card
    setSelectedUser(tempUser);

    // Step 7: Update userDetails with the renamed card for the parentIndex
    let updatedUserCardDetails = [...userDetails];
    updatedUserCardDetails[parentIndex] = arr;
    await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(updatedUserCardDetails));

    // Step 8: Set the updated state
    setCardId(0)
    setUpdatedCardNumber('')
    setUserDetails(updatedUserCardDetails);
  };




  // const checkIsCustomerIdRequiredHandler = (name:string) => {


  // }

  const addCard = async () => {
    console.log('add card -     --', selectedBank);
    console.log('lastFourDigit  -     --', lastFourDigit);
    console.log('customerId  -     --', customerId);

    const user = userDetails.find((user: any) => user.id == selectedUser.id)
    console.log('ser.cards  -     --', user.cards);
    const filteredCard = user.cards.find((card: any) => card.bankName == bankName && card.lastFourDigit == lastFourDigit)
    console.log('filtered card', filteredCard);
    if (bankName.length == 0) {
      setErrorMessage('Please select a bank');
      setIsShowErrorModal(true);
      return;
    }
    if (filteredCard != undefined) {
      setErrorMessage('Card is already added');
      setIsShowErrorModal(true);
      return;
    }
    if (lastFourDigit.length != 4) {
      setErrorMessage('Please enter card Last 4 digit');
      setIsShowErrorModal(true);
      return;
    }
    if (selectedBank.value.isCustomerIdRequired && customerId.length == 0) {
      setErrorMessage('Please enter customer-id');
      setIsShowErrorModal(true);
      return;
    }
    // if(selectedBank)
    const obj = {
      bankName: bankName,
      lastFourDigit: lastFourDigit,
      customerId: customerId,
      id: Utility.generateUniqueNumber(),
      ...selectedBank
    };

    // Get the parent object and parse it
    let arrStr = JSON.stringify(userDetails[parentIndex]);
    let arr = JSON.parse(arrStr);
    // console.log('arrStr', arr);

    // Add the new card to the cards array
    let cards = arr.cards || [];
    cards.push(obj);
    arr.cards = cards;

    const tempUser = arr;
    tempUser.cards = [...cards];

    // Step 6: Update the selectedUser state with the renamed card
    setSelectedUser(tempUser);

    // Update the AsyncStorage with the new card details
    userDetails[parentIndex] = arr;
    await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(userDetails));

    // Update the state
    setUserDetails([...userDetails]); // Spread operator to create a new reference
    clearState()
  }

  const clearState = () => {
    setIsShowAddCardModal(false); // Close the modal
    setBankName('')
    setIsCustomerIdRequired(false)
    setSelectedBank({})
    setLastFourDigit('')
    setCustomerId('')
  }
  const selectBankOnAddUser = (item: any) => {
    console.log('test========', item);
    console.log('test========', item.value.isCustomerIdRequired);
    setBankName(item.label)
    setSelectedBank(item)
    if (item.value.isCustomerIdRequired) {
      setIsCustomerIdRequired(true)
    }
    else {
      setIsCustomerIdRequired(false)
    }
  }

  const displayAllCards = () => {

    return (
      <Modal visible={isShowCardsModal} transparent={false} style={{ flex: 1, }}>
        <View style={{ flex: 1, }}>
          <View style={{ height: scaledSize(55), }}>

            <CustomLinearGradientView>
              <View style={{ height: scaledSize(55), flexDirection: 'row', }}>
                <View style={{
                  flex: .7, justifyContent: 'flex-start', height: scaledSize(55),
                  alignItems: 'center', flexDirection: 'row', left: scaledSize(10)
                }}>

                  {/* <Ionicons name='arrow-back' color={'white'} size={scaledSize(24)} onPress={() => setIsShowCardsModal(false)}
                    style={{ marginLeft: scaledSize(10), }}
                  /> */}
                  <CustomBackIcon onPress={() => setIsShowCardsModal(false)} color='white' />
                </View>
                <View style={{
                  flex: 1.3, justifyContent: 'center', alignItems: 'flex-start',
                  height: scaledSize(50)
                }}>
                  <Text style={[styles.label, { fontWeight: 'bold', color: 'white' }]}>My cards </Text>
                </View>
              </View>
            </CustomLinearGradientView>
          </View>
          <FlatList
            data={selectedUser.cards}
            renderItem={({ item, index }) => renderCards(item, index,)}
            keyExtractor={(item, index) => {
              const key = item.lastFourDigit ? `${item.lastFourDigit}-${index}` : `${index}`;
              return key;
            }}
          />
          <View style={{ position: 'absolute', top: scaledSize(600), left: scaledSize(280), }}>

            <CustomFAB onPress={() => setIsShowAddCardModal(true)} />
          </View>
        </View>
      </Modal>
    )
  }
const renderAddCardDetails = () => {
  return (
    <Modal visible={isShowAddCardModal} transparent animationType='fade' >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name='credit-card-plus-outline' size={scaledSize(28)} color={theme.themeColor} />
            </View>
            <View>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <Text style={styles.modalSubtitle}>Link a new card to this user</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={() => clearState()}>
            <CustomCloseIcon color={theme.iconColor} style={{ fontSize: scaledSize(16), bottom: 1 }} iconSize={scaledSize(14)} onPress={() => clearState()} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Bank Dropdown */}
            <CustomDropdown
              data={bankList}
              placeholder="Select bank"
              onSelect={(item) => onSelectBank(item)}
              value={selectedBank.id}
              onFocuse={() => setFocusedField('addCardBank')}
              onBlur={() => setFocusedField(null)}
              LeftIcon={() => (
                selectedBank.value ?
                  <Image source={selectedBank.icon} style={styles.bankIcon} resizeMode="contain" />
                  : <MaterialCommunityIcons name="bank-outline" size={22} color={theme.secondaryTextColor} style={styles.inputIcon} />
              )}
            />

            {/* Card Number */}
            <View style={[styles.inputContainer, focusedField === 'addCardLast4' && styles.focusedInput]}>
              <MaterialCommunityIcons name='credit-card-scan-outline' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
              <TextInput
                placeholder='Last 4 Digits of Card'
                onChangeText={(v) => setLastFourDigit(v)}
                maxLength={4}
                keyboardType="number-pad"
                style={styles.textInput}
                placeholderTextColor={theme.secondaryTextColor}
                onFocus={() => setFocusedField('addCardLast4')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Customer Id */}
            {isCustomerIdRequired && (
              <View style={[styles.inputContainer, focusedField === 'addCardCustomerId' && styles.focusedInput]}>
                <MaterialCommunityIcons name='identifier' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
                <TextInput
                  placeholder='Enter Customer ID'
                  onChangeText={(v) => setCustomerId(v)}
                  style={styles.textInput}
                  placeholderTextColor={theme.secondaryTextColor}
                  onFocus={() => setFocusedField('addCardCustomerId')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}
          </ScrollView>

          {/* Button */}
          <View style={styles.footer}>
            <CustomeButton
              name="Add Card"
              onPress={() => addCard()}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
  return (
    <View style={{ flex: 1, backgroundColor: theme.bgContainor }}>
      <View style={{ height: scaledSize(50), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bgColor }}>
        <View style={{ flex: 1 }}>

          <View style={{ height: scaledSize(60), flexDirection: 'row', }}>
            <View style={{
              flex: .1, justifyContent: 'center', alignItems: 'center',
              left: scaledSize(10),
            }}>
              {/* <TouchableOpacity onPress={props?.onPress ? () => props.onPress : () => navigateToBack()}> */}
              {/* <Ionicons name='arrow-back-circle-outline' color={theme.iconColor} size={scaledSize(30)} onPress={ props.onPress}/> */}
              <CustomBackIcon onPress={onPress} color={theme.iconColor} size={18} />
              {/* </TouchableOpacity> */}
            </View>
            <View style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{
                fontFamily: Fonts.regular,
                fontSize: scaledSize(12),
                color: theme.primaryTextColor,
                letterSpacing: 1,
              }}>
                Users
              </Text>
            </View>

          </View>
        </View>

      </View>


      <View style={{ flex: 1, backgroundColor: theme.bgContainor }}>

        {userDetails.length > 0 ? (
          <FlatList
            data={userDetails}
            renderItem={renderParentItem}
            nestedScrollEnabled
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        ) : (

          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 25
          }}>

            <View style={{
              width: '100%',
              backgroundColor: theme.bgColor,
              borderRadius: 16,
              padding: 25,
              alignItems: 'center',
              elevation: 4
            }}>

              {/* Icon */}
              <MaterialCommunityIcons
                name="credit-card-lock-outline"
                size={60}
                color={theme.themeColor}
                style={{ marginBottom: 15 }}
              />

              {/* Title */}
              <Text style={{
                fontSize: scaledSize(18),
                fontFamily: Fonts.bold,
                marginBottom: 10,
                color: theme.primaryTextColor,
                textAlign: 'center'
              }}>
                Credit Card Statement Password
              </Text>

              {/* Description */}
              <Text style={{
                fontSize: scaledSize(12),
                fontFamily: Fonts.regular,
                textAlign: 'flex-start',
                color: theme.secondaryTextColor,
                left: scaledSize(10),
                lineHeight: scaledSize(20)
              }}>
                No need to remember credit card statement password combinations.
                Add your user details and the last 4 digits of your card to generate the correct password instantly.
              </Text>
              {/* <View style={{flexDirection:'row'}}>
                <CustomVectorIcon iconLibrary='AntDesign' iconName='lock' style={{color:'green'}}/>

              <Text style={{
                fontSize: scaledSize(14),
                fontFamily: Fonts.bold,
                textAlign: 'flex-start',
                color: 'black',
                left: scaledSize(2),
                lineHeight: scaledSize(20)
              }}>
                Your information stays only on your device and is never shared.
              </Text>
                </View> */}

            </View>

          </View>

        )}

      </View>
{renderAddCardDetails()}
      <Modal visible={isShowAddUserDetailsModal} transparent animationType='fade' >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.headerIconContainer}>
                <Feather name='user-plus' size={scaledSize(28)} color={theme.themeColor} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Add User Details</Text>
                <Text style={styles.modalSubtitle}>Store user and card information securely</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => { setIsShowAddUserDetailsModal(false), setBankName('') }}>
              <CustomCloseIcon color={theme.iconColor} style={{fontSize:scaledSize(16),
              bottom:1}}
               iconSize={scaledSize(14)}
              onPress={()=>setIsShowAddUserDetailsModal(false)} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              {/* Personal Info Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="account-circle-outline" size={22} color={theme.themeColor} />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                <View style={[styles.inputContainer, focusedField === 'firstName' && styles.focusedInput]}>
                  <AntDesign name='user' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
                  <TextInput
                    placeholder='Enter First Name'
                    onChangeText={setFirstName}
                    style={styles.textInput}
                    placeholderTextColor={theme.secondaryTextColor}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View style={[styles.inputContainer, focusedField === 'lastName' && styles.focusedInput]}>
                  <AntDesign name='user' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
                  <TextInput
                    placeholder='Enter Last Name'
                    onChangeText={setLastName}
                    style={styles.textInput}
                    placeholderTextColor={theme.secondaryTextColor}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View style={[styles.inputContainer, focusedField === 'mobile' && styles.focusedInput]}>
                  <FontAwesome5 name='mobile-alt' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
                  <TextInput
                    placeholder='Enter Mobile Number'
                    onChangeText={setMobileNumber}
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.textInput}
                    placeholderTextColor={theme.secondaryTextColor}
                    onFocus={() => setFocusedField('mobile')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <View style={styles.sectionDivider} />
              </View>

              {/* Card Info Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="credit-card-outline" size={22} color={theme.themeColor} />
                  <Text style={styles.sectionTitle}>Card Information</Text>
                </View>

                <CustomDropdown
                  data={bankList}
                  placeholder="Select bank"
                  onSelect={(item) => {
                    selectBankOnAddUser(item);
                  }}
                  value={selectedBank.id}
                  onFocuse={() => setFocusedField('bank')}
                  onBlur={() => setFocusedField(null)}
                  LeftIcon={() => (
                    selectedBank.value ?
                      <Image source={selectedBank.icon} style={styles.bankIcon} resizeMode="contain" />
                      : <MaterialCommunityIcons name="bank-outline" size={22} color={theme.secondaryTextColor} style={styles.inputIcon} />
                  )}
                />

                <TouchableOpacity style={[styles.inputContainer, focusedField === 'dob' && styles.focusedInput]} onPress={() => { setIsShowCalendar(true); setFocusedField('dob') }}>
                  <AntDesign name='calendar' color={theme.secondaryTextColor} size={20} style={styles.inputIcon} />
                  <Text style={[styles.textInput, { color: selectedDate ? theme.primaryTextColor : theme.secondaryTextColor, marginLeft: 0, top: 2 }]}>
                    {selectedDate ? selectedDate : 'Select Expiry Date'}
                  </Text>
                </TouchableOpacity>

                {isCustomerIdRequired && (
                  <View style={[styles.inputContainer, focusedField === 'customerId' && styles.focusedInput]}>
                    <MaterialCommunityIcons name='identifier' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
                    <TextInput
                      placeholder='Enter Customer ID'
                      onChangeText={setCustomerId}
                      style={styles.textInput}
                      placeholderTextColor={theme.secondaryTextColor}
                      onFocus={() => setFocusedField('customerId')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                )}

                <View style={[styles.inputContainer, focusedField === 'last4' && styles.focusedInput]}>
                  <MaterialCommunityIcons name='credit-card-scan-outline' color={theme.secondaryTextColor} size={scaledSize(20)} style={styles.inputIcon} />
                  <TextInput
                    placeholder='Last 4 Digit Card Number'
                    onChangeText={setLastFourDigit}
                    keyboardType="number-pad"
                    maxLength={4}
                    style={styles.textInput}
                    placeholderTextColor={theme.secondaryTextColor}
                    onFocus={() => setFocusedField('last4')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* <View style={styles.secureInfoCard}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.themeColor} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.secureInfoText}>Your information is secure</Text>
                  <Text style={styles.secureInfoSubText}>We never store full card details</Text>
                </View>
              </View> */}
            </ScrollView>

            <View style={styles.footer}>
              <CustomeButton
                name='Save Details'
                buttonStyle={styles.saveButton}
                textStyle={styles.saveButtonText}
                onPress={() => addUserDetail()}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isEditUserShowModal} transparent animationType='fade' >

        <View style={{ flex: 1, justifyContent: "center", alignItems: 'center', }}>
          <View style={{
            height: scaledSize(400),
            width: scaledSize(350), backgroundColor: theme.bgColor, borderWidth: .2,
            alignItems: 'center', borderRadius: scaledSize(10), padding: 20, paddingTop: 10
          }}>

            <View style={{ flexDirection: 'row', height: scaledSize(80) }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{
                  color: theme.primaryTextColor,
                  fontFamily: FONTS.QuicksandBold,
                  fontSize: scaledSize(14), letterSpacing: 1,
                }}>
                  Update User Details</Text>
              </View>
              <View style={{ flex: .14, justifyContent: 'center', marginBottom: scaledSize(30) }}>
                <CustomCloseIcon onPress={() => setIsEditUserShowModal(false)} color='black' />
              </View>

            </View>
            <View style={styles.inputView}>
              <CustomInputBox value={selectedUser?.firstName} onChangeText={(v) => setFirstName(v)}
                CustomIcon={<AntDesign name='user' color={COLORS.THEME_COLOR} size={scaledSize(20)} />}
              />
            </View>
            <View style={styles.inputView}>
              <CustomInputBox value={selectedUser?.lastName} onChangeText={(v) => setLastName(v)}
                CustomIcon={<AntDesign name='user' color={COLORS.THEME_COLOR} size={scaledSize(20)} />}
              />
            </View>
            <View style={styles.inputView}>
              <CustomInputBox value={selectedUser?.mobileNumber} onChangeText={(v) => setMobileNumber(v)}
                isNumberKeyboard={true} maxLength={10}
                CustomIcon={<FontAwesome5 name='mobile' color={COLORS.THEME_COLOR} size={scaledSize(20)} />}
              />
            </View>

            <View style={[styles.inputView, { borderBottomWidth: scaledSize(.2), height: scaledSize(40), borderBottomColor: COLORS.inActiveBorderColor }]}>
              <TouchableOpacity style={[{ marginTop: scaledSize(10), flexDirection: 'row', }]} onPress={() => setIsShowCalendar(true)}>

                <TouchableOpacity style={{ marginLeft: scaledSize(6) }} onPress={() => setIsShowCalendar(true)}>

                  <AntDesign name='calendar' color={COLORS.THEME_COLOR} size={20} />
                </TouchableOpacity>

                <Text style={{ color: COLORS.textColor, marginLeft: scaledSize(16), fontWeight: '600' }}>
                  {selectedDate ? selectedDate : selectedUser?.dob}</Text>
              </TouchableOpacity>

            </View>


            <View style={{ height: scaledSize(40), width: '100%', marginTop: scaledSize(10) }}>
              <CustomeButton name='Update' onPress={() => updateUser({ firstName: firstName, lastName: lastName, dob: selectedDate ? selectedDate : dateOfBirth, mobileNumber: mobileNumber })} />
            </View>

          </View>
        </View>

      </Modal>

      <Modal visible={isShowCalendar} transparent animationType='fade'  >
        <View style={{
          marginTop: scaledSize(0), flex: 1,
          justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}>
          <View style={{ height: scaledSize(50), justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            {/* <CustomCloseIcon onPress={() => setIsShowCalendar(false)} /> */}
          </View>
          {/* <View style={{height:300,backgroundColor:'yellow',width:300}}> */}

          <CustomCalendar onSelectDate={(v) => onSelectDate(v)} onCancelPress={() => setIsShowCalendar(false)} />
          {/* </View> */}
        </View>
      </Modal>
      <View style={{ position: 'absolute', top: 0, bottom: 60, left: 0, right: 0 }}>

        {/* <FloatingButton onPress={() => checkbankName()} /> */}
        {/* <FloatingButton onPress={() => setIsShowAddUserDetailsModal(true)} /> */}
      </View>
      {/* <View style={{ height: scaledSize(150), borderTopWidth: !userDetails.length > 1 ? .2 : 0, borderColor: '#d3d3d3' }}> */}

        <View style={{ left: scaledSize(260), height: scaledSize(50), top: scaledSize(610),position:'absolute' }}>
          <CustomFAB onPress={() => setIsShowAddUserDetailsModal(true)} />
        </View>
      {/* </View> */}
      {isShowCardsModal ? displayAllCards() : null}
      <ConfirmationDialog
        visible={isShowDeleteConfirmation}
        onCancel={() => {
          setIsShowDeleteConfirmation(false);
          setCardToDelete(null);
        }}
        onSubmit={() => {
          if (cardToDelete) {
            deleteCardHandler(cardToDelete.childIndex, cardToDelete.parentIndex);
            setIsShowDeleteConfirmation(false);
            setCardToDelete(null);
          }
        }}
        mode="delete"
        message="Are you sure you want to delete this card?" />

      <ConfirmationDialog
        visible={isUserDeleteConfirmationVisible}
        onCancel={() => {
          setIsUserDeleteConfirmationVisible(false);
          setUserToDeleteIndex(null);
        }}
        onSubmit={() => {
          if (userToDeleteIndex !== null) {
            deleteUser(userToDeleteIndex);
            setIsUserDeleteConfirmationVisible(false);
            setUserToDeleteIndex(null);
          }
        }}
        mode="delete"
        message="Are you sure you want to delete this user?" />

      <CustomErrorMsgModal
        isVisible={isShowErrorModal}
        onPressClose={() => setIsShowErrorModal(false)}
        errorMessage={errorMessage}
      />

    </View>
  )
}
const createStyles = (theme: Theme, mode: string) => StyleSheet.create({

  labelView: {
    width: '50%', alignItems: 'flex-start',
    marginLeft: scaledSize(10)
  },

  inputView: {
    height: scaledSize(36), width: scaledSize(300),
    marginTop: scaledSize(16)
  },


  label: {
    fontSize: scaledSize(12),
    color: theme.primaryTextColor,
    letterSpacing: 1
  },
  text: {
    fontFamily: FONTS.QuicksandBold,
    fontSize: scaledSize(12),
    color: theme.primaryTextColor,
    letterSpacing: .5
  },
  seperator: {
    backgroundColor: 'black',
    height: 0, marginTop: 10
  },
  userCard: {
    width: "94%",
    backgroundColor: theme.bgColor,
    borderRadius: scaledSize(14),
    padding: scaledSize(14),
    marginVertical: scaledSize(8),
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: scaledSize(7),
    elevation: 5
  },
  parentCard: {
    backgroundColor: theme.bgContainor,
    borderRadius: scaledSize(24),
    padding: scaledSize(18),
    marginHorizontal: scaledSize(14),
    marginTop: scaledSize(14),
    borderWidth: 1,
    borderColor: theme.borderColor,
    elevation: scaledSize(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
    shadowRadius: scaledSize(6),
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: scaledSize(55),
    height: scaledSize(55),
    borderRadius: scaledSize(27.5),
    backgroundColor: theme.themeOpacity,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaledSize(10),
    // shadowColor: theme.themeColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 1,
    borderWidth:.5,
    borderColor: theme.borderColor
  },
  avatarText: {
    fontSize: scaledSize(20),
    fontWeight: 'bold',
    letterSpacing:1,
    color: theme.themeColor,
  },
  nameContainer: {
    flex: 1,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primaryTextColor,
  },
  userSubtitle: {
    fontSize: 13,
    color: theme.secondaryTextColor,
    marginTop: 4,
  },
  topActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: scaledSize(46),
    height: scaledSize(46),
    borderRadius: scaledSize(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scaledSize(6),
  },
  editButton: {
    backgroundColor: 'rgba(0,255,150,0.08)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255,0,80,0.08)',
  },
  infoCard: {
    backgroundColor: theme.bgColor,
    borderRadius: scaledSize(18),
    padding: scaledSize(14),
    marginBottom: scaledSize(16),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaledSize(10),
  },
  infoIcon: {
    marginRight: scaledSize(10),
  },
  infoLabel: {
    fontSize: scaledSize(12),
    color: theme.secondaryTextColor,
    width: scaledSize(70),
  },
  infoValue: {
    fontSize: scaledSize(12),
    fontWeight: '600',
    color: theme.primaryTextColor,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: theme.borderColor,
    marginVertical: 4,
  },
  cardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaledSize(12),
  },
  cardsHeaderText: {
    fontSize: scaledSize(14),
    fontWeight: '600',
    color: theme.primaryTextColor,
    marginLeft: scaledSize(8),
    letterSpacing: .5,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: theme.borderColor,
    marginVertical: scaledSize(20),
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bgColor,
    borderRadius: scaledSize(18),
    padding: scaledSize(12),
    marginBottom: scaledSize(10),
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogoContainer: {
    width: scaledSize(40),
    height: scaledSize(40),
    borderRadius: scaledSize(20),
    backgroundColor: theme.buttonBGColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scaledSize(4),
  },
  bankLogo: {
    width: scaledSize(24),
    height: scaledSize(24),
  },
  cardTextContainer: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.primaryTextColor,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.secondaryTextColor,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
  },
  cardActionButton: {
    width: scaledSize(36),
    height: scaledSize(36),
    borderRadius: scaledSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scaledSize(6),
  },
  addCardButton: {
    height: scaledSize(60),
    borderRadius: scaledSize(16),
    // borderWidth: .5,
    borderColor: theme.themeColor,
    // borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: scaledSize(6),
  },
  addCardButtonText: {
    fontSize: scaledSize(14),
    fontWeight: '600',
    color: theme.themeColor,
    marginLeft: scaledSize(6),
  },
  focusedInput: {
    borderColor: theme.themeColor,
    borderWidth: 1.5,
    elevation: 4
  },
  // New Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.bgColor,
    borderRadius: scaledSize(24),
    paddingHorizontal: scaledSize(22),
    paddingTop: scaledSize(22),
    width: '92%',
    maxHeight: '85%',
    elevation: scaledSize(10),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: scaledSize(10),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaledSize(24),
  },
  headerIconContainer: {
    width: scaledSize(48),
    height: scaledSize(48),
    borderRadius: scaledSize(14),
    backgroundColor: theme.bgContainor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaledSize(12),
  },
  modalSubtitle: {
    fontSize: scaledSize(11),
    color: theme.secondaryTextColor,
    marginTop: 4,
  },
  modalTitle: {
    fontSize: scaledSize(16),
    fontWeight: '700',
    color: theme.primaryTextColor,
  },
  closeButton: {
    position: 'absolute',
    right:scaledSize(18),
    top: scaledSize(18),
    width: scaledSize(28),
    height: scaledSize(28),
    borderRadius: scaledSize(14),
    backgroundColor: theme.buttonBGColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  section: {
    marginBottom: scaledSize(22),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  sectionTitle: {
    fontSize: scaledSize(14),
    fontWeight: '500',
    color: theme.themeColor,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgContainor,
    height: 58,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: mode === 'dark' ? 0.1 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.9,
  },
  textInput: {
    flex: 1,
    fontSize: scaledSize(14),
    color: theme.primaryTextColor,
    padding: 0, // to remove default padding
  },
  dropdownPlaceholder: {
    fontSize: scaledSize(14),
    color: theme.secondaryTextColor,
  },
  dropdownSelectedText: {
    fontSize: scaledSize(14),
    color: theme.primaryTextColor,
  },
  dropdownInputSearch: {
    height: 40,
    fontSize: 16,
    backgroundColor: theme.bgContainor,
    color: theme.primaryTextColor
  },
  dropdownIcon: {
    width: scaledSize(18),
    height: scaledSize(18),
  },
  bankIcon: {
    width:scaledSize(24),
    height: scaledSize(24),
    marginRight: scaledSize(8),
  },
  secureInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgContainor,
    padding: scaledSize(12),
    borderRadius: scaledSize(14),
    marginTop: scaledSize(16),
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  secureInfoText: {
    fontSize: scaledSize(13),
    fontWeight: '500',
    color: theme.primaryTextColor,
  },
  secureInfoSubText: {
    fontSize: scaledSize(12),
    color: theme.secondaryTextColor,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scaledSize(20),
    paddingTop: scaledSize(10),
    paddingBottom: scaledSize(24),
    backgroundColor: theme.bgColor, // to cover content underneath
  },
  saveButton: {
    // backgroundColor: theme.themeColor,
    borderWidth:.5,
    borderColor: theme.themeColor,
    height: scaledSize(44),
    borderRadius: scaledSize(14),
    width:'50%',
    alignSelf:'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.themeColor,
    fontSize: scaledSize(14),
    fontWeight: '600',
  }
})