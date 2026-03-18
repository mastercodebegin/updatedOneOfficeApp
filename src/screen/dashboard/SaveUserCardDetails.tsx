import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Image, Modal,
  SafeAreaView,
  FlatList, Alert,
  StatusBar
} from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomCloseIcon from '../../component/CustomCloseIcon'
import { capitalizeFirstLetter, generateUniqueNumber, navigateToBack, scaledSize, widthFromPercentage } from '../../utilies/Utilities'
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
import { Dropdown } from 'react-native-element-dropdown'


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
  const getPasswordByIsCap = (isCap: boolean, value: string) => {
    if (isCap == undefined) {
      Alert.alert(
        'Sorry ',
        'we could not generate the password please check user details again',
        [
          {
            text: '',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'Ok', onPress: () => console.log('Yes Pressed') },
        ],
        { cancelable: false }
      )
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
  const deleteCardHandler = async (childIndex,) => {
    // Create a deep copy of the userDetails object at the given parent index
    let arrStr = JSON.stringify(userDetails[parentIndex]);

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
    updatedUserCardDetails[parentIndex] = arr;

    // Set the new state
    setUserDetails(updatedUserCardDetails);
    await AsyncStorage.setItem(asyncStorageKeyName.SAVED_USERS, JSON.stringify(updatedUserCardDetails));
  };

  const addUserDetail = async () => {
    console.log('selectedbank', selectedBank);
    console.log('last', lastName);
    console.log('mobileNumber', mobileNumber);
    console.log('date', selectedDate);
    console.log('bankName', bankName);
    console.log('last4', lastFourDigit);
    if (firstName.length == 0) { alert('please enter first name') }
    else if (lastName.length == 0) { alert('please enter last name') }
    else if (mobileNumber.length < 10) { alert('please enter valid mobile number') }
    else if (selectedDate == null) { alert('please select date') }
    else if (bankName.length == 0) { alert('please select bank') }
    else if (isCustomerIdRequired) {
      if (customerId.length == 0) { alert('please enter customer id') }
    }
    else if (bankName.length == 0) { alert('please select bank') }
    else if (lastFourDigit.length != 4) { alert('please enter card last 4 digit') }
    else {
      const cardDetails = {
        id: generateUniqueNumber(), bankName: bankName, lastFourDigit: lastFourDigit,
        customerId: customerId, ...selectedBank
      };
      const obj = { id: generateUniqueNumber(), firstName: firstName, lastName: lastName, mobileNumber: mobileNumber, dob: selectedDate, cards: [cardDetails] }
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
      alert('please enter first name')
      return false
    }
    if (lastName.length == 0) {
      alert('please enter last name')
      return false
    }
    if (mobileNumber.length < 10) {
      alert('please enter valid mobile number')
      return false

    }
    if (selectedDate == null) {
      alert('please select date')
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
  const renderCards = (item, childIndex) => {
    console.log('renderCards---', item);

    return (

      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: "#eee"
      }}>

        <Image
          source={BANK_LOGOS[item.value.bankName]}
          style={{
            height: scaledSize(24),
            width: scaledSize(24),
            borderRadius: scaledSize(8),
            marginRight: scaledSize(8)
          }}
          resizeMode="contain"
        />

        <View style={{ flex: 1, left: 10 }}>

          <Text style={{
            fontSize: scaledSize(12),
            fontWeight: "500"
          }}>
            {item.bankName}
          </Text>

          <Text style={{
            color: "#777",
            marginTop: 2
          }}>
            Card ending •••• {item.lastFourDigit}
          </Text>

        </View>

        <TouchableOpacity
          onPress={() => editCard(item)}
          style={{ marginRight: 12 }}
        >

          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={COLORS.THEME_COLOR}
          />

        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteCardHandler(childIndex)}
        >

          <MaterialCommunityIcons
            name="delete"
            size={20}
            color="red"
          />

        </TouchableOpacity>

      </View>

    )
  }

  const renderParentItem = ({ item, index }) => {
    return (
      <View
        style={{
          width: "94%",
          alignSelf: "center",
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 16,
          marginVertical: 10,
          borderWidth: 1,
          borderColor: "#E5E7EB"
        }}
      >

        {/* USER HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12
          }}
        >
          <Text
            style={{
              fontSize: scaledSize(14),
              fontWeight: "600",
              letterSpacing: .5,
              color: "#111"
            }}
          >
            {capitalizeFirstLetter(item.firstName)} {item.lastName}
          </Text>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => showEditUserModal(item)}
              style={{ marginRight: 12 }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={COLORS.THEME_COLOR}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteUser(index)}>
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color="red"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* USER INFO BOX */}
        <View
          style={{
            // backgroundColor: "#F8F9FB",
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 18,
            marginBottom: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: "#EFEFEF",
          }}
        >
          {/* LEFT LABELS */}
          <View>
            <Text
              style={{
                color: "#7A7A7A",
                fontSize: 14,
                marginBottom: 10,
              }}
            >
              DOB:
            </Text>

            <Text
              style={{
                color: "#7A7A7A",
                fontSize: 14,
              }}
            >
              Mobile
            </Text>
          </View>

          {/* RIGHT VALUES */}
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 15,
                // fontWeight: "500",
                marginBottom: 10,
                color: "#333",
                letterSpacing: .5
              }}
            >
              {item.dob}
            </Text>

            <Text
              style={{
                fontSize: 15,
                // fontWeight: "500",
                color: "#333",
                letterSpacing: .5
              }}
            >
              {'+91 - ' + item.mobileNumber}
            </Text>
          </View>
        </View>

        {/* CARDS TITLE */}
        <Text
          style={{
            fontSize: scaledSize(12),
            fontWeight: "600",
            marginBottom: scaledSize(10),
            letterSpacing: .5
          }}
        >
          Cards
        </Text>

        {/* CARDS LIST */}
        <FlatList
          data={item.cards}
          renderItem={({ item, index }) => renderCards(item, index)}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />

        {/* ADD CARD BUTTON */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginTop: 12,
            flexDirection: "row",
            justifyContent: "center"
          }}
          onPress={() => {
            // setIsShowCardsModal(true)
            setIsShowAddCardModal(true)
            setSelectedUser(item)
            setParentIndex(index)
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={COLORS.THEME_COLOR}
          />

          <Text
            style={{
              color: COLORS.THEME_COLOR,
              fontSize: 15,
              marginLeft: 4,
              fontWeight: "500"
            }}
          >
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
      alert('Please select a bank');
      return true
    }
    if (filteredCard != undefined) {
      alert('card is already added');
      return true
    }
    else if (lastFourDigit.length != 4) {
      alert('Please enter card Last 4 digit ');
      return true
    }
    else if (selectedBank.value.isCustomerIdRequired && customerId.length == 0) {
      alert('Please enter customer-id');
      return true
    }
    // if(selectedBank)
    const obj = {
      bankName: bankName,
      lastFourDigit: lastFourDigit,
      customerId: customerId,
      id: generateUniqueNumber(),
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
    <Modal visible={isShowAddCardModal} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <View
          style={{
            width: scaledSize(340),
            backgroundColor: "white",
            borderRadius: 14,
            paddingVertical: 20,
            paddingHorizontal: 18,
            elevation: 6,
          }}
        >

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.QuicksandBold,
                fontSize: scaledSize(16),
                letterSpacing: 1,
              }}
            >
              Add Card Details
            </Text>

            <CustomCloseIcon onPress={() => clearState()} />
          </View>

          {/* Bank Dropdown */}
          <View style={{ marginBottom: 15 }}>
            <CustomDropdown
              data={bankList}
              onSelect={(v: any) => onSelectBank(v)}
              value={selectedBank.id}
              placeholder="Select Bank"
              containerStyle={{
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 8,
                height: 48,
                paddingHorizontal: 10,
              }}
              LeftIcon={() =>
                selectedBank.value ? (
                  <Image
                    source={BANK_LOGOS[selectedBank.value.bankName]}
                    style={{ height: 20, width: 20 }}
                  />
                ) : (
                  <CustomVectorIcon
                    iconLibrary="MaterialDesignIcons"
                    iconName="bank"
                    style={{ fontSize: 18, marginRight: 6 }}
                  />
                )
              }
            />
          </View>

          {/* Card Number */}
          <View style={{ marginBottom: scaledSize(15),height:scaledSize(40) }}>
            <CustomInput
              onChangeText={(v) => setLastFourDigit(v)}
              maxLength={4}
              isPhoneKeyBoard
              placeholder="Enter Last 4 Digit Card Number"
            />
          </View>

          {/* Customer Id */}
          {isCustomerIdRequired && (
            <View style={{ marginBottom: 20,height:scaledSize(40)}}>
              <CustomInput
                onChangeText={(v) => setCustomerId(v)}
                placeholder="Enter Customer Id"
              />
            </View>
          )}

          {/* Button */}
          <View style={{height:40,marginTop:scaledSize(10)}}>

          <CustomeButton
            name="Add"
            onPress={() => addCard()}
            buttonStyle={{
              backgroundColor: COLORS.THEME_COLOR,
              height: 48,
              borderRadius: 8,
            }}
            />
            </View>
        </View>
      </View>
    </Modal>
  );
};
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <StatusBar backgroundColor={COLORS.THEME_COLOR} />
      <View style={{ height: scaledSize(50), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>

          <View style={{ height: scaledSize(60), flexDirection: 'row', }}>
            <View style={{
              flex: .1, justifyContent: 'center', alignItems: 'center',
              left: scaledSize(10),
            }}>
              {/* <TouchableOpacity onPress={props?.onPress ? () => props.onPress : () => navigateToBack()}> */}
              {/* <Ionicons name='arrow-back-circle-outline' color={'white'} size={scaledSize(30)} onPress={ props.onPress}/> */}
              <CustomBackIcon onPress={onPress} color='black' size={18} />
              {/* </TouchableOpacity> */}
            </View>
            <View style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{
                fontFamily: Fonts.regular,
                fontSize: scaledSize(12),
                letterSpacing: 1,
              }}>
                Users
              </Text>
            </View>

          </View>
        </View>

      </View>


      <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>

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
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 25,
              alignItems: 'center',
              elevation: 4
            }}>

              {/* Icon */}
              <MaterialCommunityIcons
                name="credit-card-lock-outline"
                size={60}
                color="#0F9D9A"
                style={{ marginBottom: 15 }}
              />

              {/* Title */}
              <Text style={{
                fontSize: scaledSize(18),
                fontFamily: Fonts.bold,
                marginBottom: 10,
                textAlign: 'center'
              }}>
                Credit Card Statement Password
              </Text>

              {/* Description */}
              <Text style={{
                fontSize: scaledSize(12),
                fontFamily: Fonts.regular,
                textAlign: 'flex-start',
                color: '#555',
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: 'center', }}>
          <View style={{
            height: scaledSize(650),
            width: scaledSize(350), backgroundColor: 'white', borderWidth: .5, borderColor: '#d3d3d3',
            alignItems: 'center', borderRadius: scaledSize(10), padding: scaledSize(20)
          }}>

            <View style={{ flexDirection: 'row', height: scaledSize(80) }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Feather name='user' size={scaledSize(40)} color={COLORS.THEME_COLOR} style={{ bottom: scaledSize(20) }} />
                <Text style={{
                  fontFamily: FONTS.QuicksandBold,
                  fontSize: scaledSize(14), letterSpacing: 1,
                }}>
                  Add User Details</Text>

              </View>
              <View style={{ flex: .14, justifyContent: 'center', marginBottom: scaledSize(30) }}>
                <CustomCloseIcon onPress={() => { setIsShowAddUserDetailsModal(false), setBankName('') }} color='black' />
              </View>

            </View>
            <View style={styles.inputView}>
              <CustomInputBox placeholder='Enter First Name' onChangeText={setFirstName}
                CustomIcon={<AntDesign name='user' color={COLORS.THEME_COLOR} size={scaledSize(20)} />}
              />
            </View>
            <View style={styles.inputView}>
              <CustomInputBox placeholder='Enter Last Name' onChangeText={setLastName}
                CustomIcon={<AntDesign name='user' color={COLORS.THEME_COLOR} size={scaledSize(20)} />}
              />
            </View>
            <View style={[styles.inputView,]}>
              <CustomInputBox placeholder='Enter Mobile Number' onChangeText={setMobileNumber}
                isNumberKeyboard={true} maxLength={10}
                CustomIcon={<FontAwesome5 name='mobile' color={COLORS.THEME_COLOR} size={scaledSize(20)} />}
              />
            </View>

            <View style={[styles.inputView, {
              borderBottomWidth: scaledSize(0),
              height: scaledSize(40), borderBottomColor: COLORS.inActiveBorderColor
            }]}>
              <TouchableOpacity style={[{
                bottom: scaledSize(0), borderWidth: .5, borderRadius: scaledSize(10), borderColor: COLORS.THEME_COLOR,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                height: scaledSize(36)
              }]} onPress={() => setIsShowCalendar(true)}>
                <View style={{ flexDirection: 'row', }}>
                  <TouchableOpacity style={{ marginLeft: scaledSize(6), }} onPress={() => setIsShowCalendar(true)}>

                    <AntDesign name='calendar' color={COLORS.THEME_COLOR} size={20} />
                  </TouchableOpacity>

                  <Text style={{ color: COLORS.textColor, marginLeft: scaledSize(16), }}>
                    {selectedDate ? selectedDate : 'Select date'}</Text>
                </View>

                <View>
                  {/* <Text style={{ color:selectedDate?'black': 'gray', marginRight: scaledSize(30), fontWeight: '600' }}>
                    { selectedDate ? selectedDate :'DD-MM-YYYY'}</Text> */}
                </View>


              </TouchableOpacity>

            </View>

            <View style={{
              justifyContent: 'center', alignItems: 'center', height: scaledSize(30),
              marginTop: scaledSize(10), width: widthFromPercentage(84)
            }}>
              <CustomDropdown data={bankList} placeholder='Select bank'
                onSelect={(v) => selectBankOnAddUser(v)}
                value={selectedBank.id}
                LeftIcon={() => selectedBank.value ?
                  <Image source={BANK_LOGOS[selectedBank.value.bankName]} style={{ height: 20, width: 20 }} />
                  :
                  <CustomVectorIcon iconLibrary="MaterialDesignIcons" iconName="bank"
                    style={{ fontSize: scaledSize(14), marginRight: scaledSize(8) }} />
                }
              />
            </View>

            {isCustomerIdRequired && <View style={{ height: scaledSize(50), width: scaledSize(326), marginTop: scaledSize(18) }}>
              <CustomInputBox placeholder='Enter Customer ID'
                onChangeText={setCustomerId}
                CustomIcon={<Entypo name='user' color={COLORS.THEME_COLOR} size={28} />}
              />
            </View>}
            <View style={[styles.inputView, { marginTop: scaledSize(20) }]}>
              <CustomInputBox placeholder=' Last 4 Digit Card Number'
                onChangeText={setLastFourDigit} isNumberKeyboard maxLength={4}
                CustomIcon={<Entypo name='credit-card' color={COLORS.THEME_COLOR} size={28} />}
              />
            </View>
            <View style={{ height: scaledSize(40), width: scaledSize(326), marginTop: scaledSize(30) }}>
              <CustomeButton name='Save' buttonStyle={{ backgroundColor: COLORS.THEME_COLOR, borderRadius: 10 }}
                textStyle={{ color: 'white' }} onPress={() => addUserDetail()} />
            </View>

          </View>
        </View>

      </Modal>
      <Modal visible={isEditUserShowModal} transparent animationType='fade' >

        <View style={{ flex: 1, justifyContent: "center", alignItems: 'center', }}>
          <View style={{
            height: scaledSize(400),
            width: scaledSize(350), backgroundColor: 'white', borderWidth: .2,
            alignItems: 'center', borderRadius: scaledSize(10), padding: 20, paddingTop: 10
          }}>

            <View style={{ flexDirection: 'row', height: scaledSize(80) }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{
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

    </View>
  )
}
const styles = StyleSheet.create({

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
    letterSpacing: 1
  },
  text: {
    fontFamily: FONTS.QuicksandBold,
    fontSize: scaledSize(12),
    letterSpacing: .5
  },
  seperator: {
    backgroundColor: 'black',
    height: 0, marginTop: 10
  },
  userCard: {
    width: "94%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  }
})