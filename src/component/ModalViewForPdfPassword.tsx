
import React, { useEffect, useState } from "react";
import {
  View, StyleSheet, TouchableOpacity, Modal,
  TextInput, Text, Image, FlatList, ScrollView,
  KeyboardAvoidingView, SafeAreaView, LogBox, Keyboard,
  Alert,
  StatusBar
} from "react-native";
import { COLORS } from "../utilies/GlobalColors";
import { capitalizeFirstLetter, scaledSize, toastForDeleteFile, } from "../utilies/Utilities";
import { deviceBasedDynamicDimension } from "../utilies/scale";
import { Fonts } from "../assets/fonts/GlobalFonts";
import { Axis, BOB, calendarIcon, clear, eye, eyeClosed, info, } from "../assets/GlobalImages";
import Info from '../assets/images/pdfIcon.png'
import { asyncStorageKeyName, BANK_LOGOS, banksName, BanksObject, } from "../utilies/Constants";
import CustomCalendar from "./CustomCalendar";
import CustomInput from "./CustomInput";
import SvgImageDisplay from "../utilies/SvgImageDisplay";
import SvgUri from "react-native-svg-uri";
import CustomBannerAdd from "./admob/CustomBannerAdd";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioButton } from "react-native-paper";
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import SaveUserCardDetails from "../screen/dashboard/SaveUserCardDetails";
import CustomDropdown from "./CustomDropDown";
import { Input } from "react-native-elements";
import { useToast } from "react-native-toast-notifications";
import CustomLinearGradientView from "./CustomLinearGradientView";
import CustomErrorMsgModal from "./CustomErrorMsgModal";
import CustomVectorIcon from "./CustomVectorIcon";


//local imports
LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews']);

interface myProps {
  visible?: any;
  open?: any;
  close?: any;
  errorRecognize?: any;
  onText?: any;
  num?: any;
  onPressOkay?: any;
  onPressClose?: any;
  errorMessage: string
}



const ModalView = (props: myProps) => {
  const [visible, setIsvisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [calendar, setCalendar] = useState(false)
  const [value, setValue] = useState('')
  const [steps, setSteps] = useState([])
  const [password, setPassword] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [isPassword, setIsPassword] = useState(false)
  const [isAddUserDetails, setIsAddUserDetails] = useState(false)
  const [isSelectBankDropDownOpen, setIsSelectBankDropDownOpen] = useState(false)
  const [bankName, setBankName] = useState('')
  const [bankDetails, setBankDetails] = useState(null)
  const [name, setName] = useState('')
  // const [lastFourDigit, setLastFourDigit] = useState('')
  const [textColor, setTextColor] = useState('#CC313D')
  const [savedUser, setSavedusers] = useState([])
  const [selectedUser, setSelectedUser] = useState({})
  const [banks, setBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState({})
  const [isShowErrorModal, setIsShowErrorModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const toast = useToast();

  useEffect(() => {
    console.log('getCardsForDropDown', getCardsForDropDown());

    getSavedUsers()


  }, [isAddUserDetails])

  useEffect(() => {
    const res = fetch('https://api.jsonsilo.com/public/fb20cc0e-8ad8-4e0d-971b-a4e7cbba310c').then(res => res.json()).then(res => setBanks(res.data)).catch(err => console.log('err', err))
    console.log();


  }, [])

  const selectUser = (item) => {
    console.log('on select user', item);
    // console.log('bank--',bankDetails);

    setSelectedUser(item.value)
    //generate moment object

  }
  const getSavedUsers = async () => {
    const savedUser = await AsyncStorage.getItem(asyncStorageKeyName.SAVED_USERS)
    console.log('getSavedUsers----', savedUser);
    let users = JSON.parse(savedUser)
    let savedCardsArray = users.reduce((acc, obj) => {

      const tempObj =
      {
        label: capitalizeFirstLetter(obj.firstName) + ' ' + capitalizeFirstLetter(obj.lastName),
        id:obj.id,
        value: obj
      }
      acc.push(tempObj)
      return acc
    }, [])
    console.log('savedCardsArray', JSON.stringify(savedCardsArray));

    setSavedusers(savedCardsArray ? savedCardsArray : [])

  }




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
      props.onText(value.toUpperCase())
      return value.toUpperCase()
    }
    else {
      props.onText(value.toLowerCase())
      return value.toLowerCase()
    }
  }

  function getDateAndMonth(dob: any) {
    // Split the dob string by '/' and extract the day and month
    console.log('dob: ', dob);

    const [day, month] = dob.split('/');

    // Return the formatted day and month as "DD-MM"
    return `${day}${month}`;
  }

  const onSelectBank = (v: any) => {
    console.log('selected bank--', JSON.stringify(v));


    if (selectedUser.id == undefined) {
      alert('Please select user first! ');
      return true
    }
    const { isFirstName4CharAndDobDDMM, isFirstName4CharAndCardLast4Digit,
      isFirstName4CharAndDobDDMMYYYY, isFirstName4CharAndDobYYYY,
      isFirstName4CharAndDobDDMMYY, isDobDDMMYYYYCardLast4Digit, isMobileNumber, isCustomerIdRequired,
      bankName, isCap, } = v.value
    const { firstName, dob } = selectedUser
    setSelectedBank(v)
    const firstFourChars = firstName.substring(0, 4)
    var selectedCard = selectedUser.cards.find((card: any) => card.value.bankName == bankName)
    console.log('selectedUser ', selectedUser);
    console.log('selectedCard ', selectedUser.cards);
    console.log('selectedCard ', selectedCard);
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
    // console.log('v ', v);


    if (isFirstName4CharAndCardLast4Digit) {
      const value = getPasswordByIsCap(isCap, firstFourChars + lastFourDigit)
      console.log(value);
      return value

    }

    else if (isDobDDMMYYYYCardLast4Digit) {
      const [day, month, year] = dob.split('/');
      // const shortYear = year.substring(2, 4);
      const date = day + month + year
      console.log(date);
      const value = getPasswordByIsCap(isCap, date + lastFourDigit,)
      console.log('isDobDDMMYYYYCardLast4Digit============', value);
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

    else if (v.value.isDobDDMM) {
      const [date, month, year] = dob.split('/');
      console.log('month-----', month);
      return getPasswordByIsCap(isCap, date + month,)
    }

    else {
      console.log('else========', v.value);
    }

  }







  const getCardsForDropDown = () => {
    // console.log('selectedUser----------------', selectedUser);

    if (selectedUser.id != undefined) {
      // console.log('selectedUser----------------1', banks);

      return selectedUser.cards
    }

    else {
      //console.log('selectedUser----------------3', bankList);
      // alert('Please select a user');
      return []
    }
    // selectedUser.id?selectedUser.cards:savedUser[0].cards
  }
  const onFocusSelectBank = () => {
    if (savedUser.length == 0) {
      setIsShowErrorModal(true)
      setErrorMsg('Please add user first')
    }
    if (savedUser.length > 0 && selectedUser.id == undefined) {
      setIsShowErrorModal(true)
      setErrorMsg('Please select user first')
    }
    {

    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: .9 }}>


        <StatusBar backgroundColor={COLORS.THEME_COLOR} />

        <Modal visible={props.visible} animationType="fade" transparent>
          <View style={styles.overlay}>

            <View style={styles.modalCard}>

              {/* HEADER */}
              <View style={styles.header}>
                {/* <Text style={styles.headerTitle}>Generate Statement Password</Text> */}
              </View>

              {/* INFO TEXT */}
              <View style={styles.descriptionContainer}>
                <Icon name="information-outline" size={scaledSize(18)} color="gray" style={{ top: scaledSize(6) }} />
                <Text style={styles.descriptionText}>
                  Generate the password for your credit card statement OR enter it manually.
                </Text>
              </View>

              {/* USER SELECT */}
              <View style={styles.userHeader}>
                <Text style={styles.sectionTitle}>
                  {savedUser.length === 0 ? "Add user" : "Select user"}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setIsAddUserDetails(true)
                    setSelectedUser({})
                    // setBankLabel('')
                    setSelectedBank({})
                    props.onText('')
                  }}
                >
                  <Icon name="credit-card-plus" size={22} color={COLORS.THEME_COLOR} />
                </TouchableOpacity>
              </View>

              {/* <FlatList
            data={savedUser}
            renderItem={renderUser}
            style={{ maxHeight: 90 }}
            keyExtractor={(item, index) => index.toString()}
          /> */}

              {/* USERS DROPDOWN */}
              <View style={{ marginTop: 15 }}>
                <CustomDropdown
                  placeholder="Select user"
                  // value={selectedUser ? selectedUser.firstName : ''}
                  LeftIcon={() => <CustomVectorIcon iconLibrary="Feather" iconName="user"
                    style={{ fontSize: scaledSize(14), marginRight: scaledSize(8) }} />}
                  data={savedUser}
                  // onFocuse={() => onFocusSelectBank()}
                  onSelect={(item) => selectUser(item)}

                />
              </View>

              {/* BANK DROPDOWN */}
              <View style={{ marginTop: 15 }}>
                <CustomDropdown
                  placeholder="Select Bank"
                  // value={se}
                  LeftIcon={() => selectedBank.value ?
                    <View style={{width:scaledSize(24)}}>

                    <Image source={BANK_LOGOS[selectedBank.value.bankName]} style={{ height: 20, width: 20,paddingHorizontal:10 }} />
                    </View>

                    :
                     <View style={{width:scaledSize(24)}}>
                    <CustomVectorIcon iconLibrary="MaterialDesignIcons" iconName="bank"
                      style={{ fontSize: scaledSize(14),  }} />
                      </View>
                  }

                  data={getCardsForDropDown()}
                  onFocuse={() => onFocusSelectBank()}
                  onSelect={(bankDetails) => onSelectBank(bankDetails)}
                />
              </View>

              {/* PASSWORD INPUT */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter Password</Text>

                <View style={styles.passwordField}>
                  <TextInput
                    secureTextEntry={!visible}
                    defaultValue={props.errorRecognize}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="ascii-capable"
                    onChangeText={(value) => props.onText(value)}
                    style={styles.passwordInput}
                  />

                  <TouchableOpacity onPress={() => setIsvisible(!visible)}>
                    <Icon
                      name={visible ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {props.num > 1 && props.errorRecognize.length > 0 && (
                  <Text style={styles.errorMessageStyle}>{props.errorMessage}</Text>
                )}
              </View>

              {/* BUTTONS */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={props.onPressClose}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={props.onPressOkay}
                >
                  <Text style={styles.primaryText}>Continue</Text>
                </TouchableOpacity>
              </View>


            </View>

          </View>
        </Modal>

        <Modal visible={isAddUserDetails}>
          <SaveUserCardDetails onPress={() => setIsAddUserDetails(false)} />
        </Modal>

        <CustomErrorMsgModal
          errorMessage={errorMsg}
          onPressClose={() => setIsShowErrorModal(false)}
          isVisible={isShowErrorModal}
        />
      </View>
      <View style={{ flex: .1 }}>
        {/* AD */}
        <View style={{ marginTop: 20 }}>
          <CustomBannerAdd />
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },

  modalCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20
  },

  header: {
    alignItems: "center",
    marginBottom: 10
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222"
  },

  descriptionContainer: {
    flexDirection: "row",
    marginBottom: 20
  },

  descriptionText: {
    marginLeft: 8,
    fontSize: scaledSize(12),
    // color: "#555",
    flex: 1,
    letterSpacing: 1,
    left: scaledSize(4),
    // fontFamily:Fonts.regular,
    lineHeight: scaledSize(16)
  },

  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 15,
    letterSpacing: .5
    // fontWeight: "600"
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333"
  },

  inputContainer: {
    marginTop: scaledSize(15)
  },

  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: scaledSize(8),
    paddingHorizontal: scaledSize(10),
    height: scaledSize(40),
    backgroundColor: "#FAFAFA"
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#000"
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25
  },

  primaryBtn: {
    // backgroundColor: COLORS.THEME_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8
  },

  primaryText: {
    color: COLORS.THEME_COLOR,
    letterSpacing: .5
    // fontWeight: "600"
  },

  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20
  },

  cancelText: {
    color: "#555",
    fontWeight: "500"
  },

  errorMessageStyle: {
    color: "red",
    marginTop: 5
  },


  firstNameInputView:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dobAndCardLabelView: {
    flexDirection: "row", height: scaledSize(40),
    justifyContent: 'flex-start', alignItems: 'flex-end',
    marginTop: scaledSize(20)
  },
  customInputViewCardNumber: {
    marginLeft: scaledSize(30),
    width: scaledSize(150)
  },

  dobAndCardLabelText:
  {
    height: scaledSize(40),
    width: scaledSize(136),
    fontFamily: Fonts.regular
  },
  image: {
    height: scaledSize(30),
    width: scaledSize(50),
    marginLeft: scaledSize(7),
    marginBottom: scaledSize(14)
  }
  ,

  cardContainer: {

    flex: 1,
    flexDirection: "row",
    marginVertical: deviceBasedDynamicDimension(10, true, 1),
    padding: deviceBasedDynamicDimension(15, true, 1),
    borderRadius: deviceBasedDynamicDimension(20, true, 1),
    // backgroundColor: COLORS.white
  },
  passwordHintMainView: {
    flex: 1,
    // width:scaledSize(320),
    backgroundColor: 'white',
    // alignSelf:'center'
  },
  passwordMainView: {
    flex: 1,
    // backgroundColor: 'red',
    // backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    // alignItems: 'center',
  },
  passwordModalMainView: {
    width: scaledSize(334),
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: scaledSize(8),
    // opacity: 0.9,
    height: scaledSize(460),
    // backgroundColor: 'yellow',
    top: 20
  },
  enterPasswordText: {
    margin: scaledSize(10),
    fontSize: scaledSize(14),
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: .5
  },
  enterPasswordView: {
    backgroundColor: '#fff',
    width: '83%',
    alignSelf: 'center',
    margin: scaledSize(10),
    borderRadius: scaledSize(5)
  },
  textInput: {
    marginLeft: scaledSize(5),
    borderRadius: scaledSize(5),
    fontSize: scaledSize(16),
    padding: scaledSize(5),
    paddingLeft: scaledSize(10),
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    color: 'black',
  },
  okAndCancelButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  cancelButton: {
    opacity: 1,
    // backgroundColor: "#54c0e8",
    borderRadius: deviceBasedDynamicDimension(3, true, 1),
    justifyContent: "center",
    height: deviceBasedDynamicDimension(50, false, 1),
    paddingHorizontal: deviceBasedDynamicDimension(2, true, 1),
    //  marginRight:  deviceBasedDynamicDimension(10, true, 1),
  },
  cancelButtonText: {
    margin: scaledSize(10),
    fontSize: scaledSize(12),
    textAlign: 'center',
    fontFamily: Fonts.PTSerifBold,
    letterSpacing: .5,
    color: "black"
  },
  okButton: {
    // backgroundColor: "#e31d93",
    borderRadius: deviceBasedDynamicDimension(3, true, 1),
    justifyContent: "center",
    height: deviceBasedDynamicDimension(50, false, 1),
    paddingHorizontal: deviceBasedDynamicDimension(0, true, 1),
  },
  okButtonText: {
    margin: scaledSize(10),
    fontSize: scaledSize(14),
    letterSpacing: .5,
    fontFamily: Fonts.PTSerifBold,
    textAlign: 'center',
  },
  errorMessageStyle: {
    textAlign: 'center',
    color: 'red',
    fontFamily: Fonts.regular
  },
  stepText: {
    marginLeft: scaledSize(10),
    fontFamily: Fonts.regular, fontSize:
      scaledSize(12),
  },
  infoIcon: {
    height: scaledSize(16),
    width: scaledSize(16),
    marginTop: scaledSize(2)
  },
  yourPasswordIs: {
    marginLeft: scaledSize(10),
    fontFamily: Fonts.regular,
    fontSize: scaledSize(14),
  },
  passwordText: {
    marginLeft: scaledSize(10),
    fontFamily: Fonts.PTSerifBold,
    fontSize: scaledSize(14),
    color: '#317773'
  },
  generatePasswordHeading:
  {
    fontFamily: Fonts.PTSerifBold,
    left: scaledSize(10),
    width: scaledSize(290)
  },
  bankDropDown: {
    paddingTop: scaledSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    height: scaledSize(70),
  },
  firstName:
  {
    height: scaledSize(30),
    fontFamily: Fonts.regular
  }


});



export default ModalView;
