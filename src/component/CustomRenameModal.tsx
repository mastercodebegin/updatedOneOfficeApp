import { View, Text,Modal, StyleSheet,TouchableOpacity ,TextInput} from 'react-native'
import React,{useMemo, useState} from 'react'
import { Theme } from '../screen/theme/ThemeConfig';
import LinearGradient from 'react-native-linear-gradient';
import { scaledSize } from '../utilies/Utilities';
import { useTheme } from '../screen/theme/useTheme';
interface S{
    isVisible:boolean
    onSubmit:Function
    onCancel:Function
    onChangeText:Function
    value:string
    heading?:string
    subHeading?:string
    placeholder?:string
    submitBtnTitle?:string
}
export default function CustomRenameModal(props:S) {
    const {isVisible=false,
        onSubmit=()=>{},
        onCancel=()=>{},
        onChangeText=()=>{},
        heading='Rename',
        subHeading='Enter a new  name',
        value='',
        placeholder='Enter value',
        submitBtnTitle='Rename'
} = props
const [tagName,setTagName]= useState('')
const {theme,mode} = useTheme()

//   const styles = () => {
//     return createStyles(theme, mode)
//   }
  const styles = useMemo(() => {
    return createStyles(theme, mode)
  }, [theme])
     const renderRenameTagModal = () => {
        return (
          <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={() =>
              onCancel()
            }>
    
            <View style={styles.modalOverlay}>
    
              <View style={styles.modalContainer}>
    
                {/* Header */}
                <Text style={styles.modalTitle}>
                  {heading} 
                </Text>
    
                <Text style={styles.modalSubtitle}>
                  {subHeading}
                </Text>
    
                {/* Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    defaultValue={value}
                    onChangeText={(v)=>onChangeText(v)}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    style={styles.modalInput}
                  />
                </View>
    
                {/* Buttons */}
                <View style={styles.modalButtonRow}>
    
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.cancelButton}
                    onPress={() =>
                      onCancel()
                    }>
    
                    <Text style={styles.cancelText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
    
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.renameButton}
                    onPress={() => onSubmit()}>
    
                    <LinearGradient
                      colors={[
                        theme.themeSecondaryColor,
                        theme.themeColor,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}>
    
                      <Text style={styles.renameText}>
                        {submitBtnTitle}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        );
      };
  return (
    <View>
     {renderRenameTagModal()}
    </View>
  )
}

const createStyles = (theme:Theme,mode:string)=>StyleSheet.create({
modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.45)',

    justifyContent: 'center',

    paddingHorizontal: scaledSize(20),
  },

  modalContainer: {
    borderRadius: scaledSize(20),

    padding: scaledSize(20),

    backgroundColor: theme.bgColor,

    borderWidth: 1,

    borderColor: theme.borderColor,
  },

  modalTitle: {
    fontSize: scaledSize(20),

    fontWeight: '800',

    color: theme.primaryTextColor,
  },

  modalSubtitle: {
    marginTop: scaledSize(6),

    fontSize: scaledSize(12),
    letterSpacing:.5,

    color: '#8B93A7',
  },

  inputContainer: {
    height: scaledSize(50),

    borderRadius: scaledSize(14),

    marginTop: scaledSize(20),

    backgroundColor: theme.buttonBGColor,

    borderWidth: 1,

    borderColor: theme.borderColor,

    justifyContent: 'center',

    paddingHorizontal: scaledSize(12),
  },

  modalInput: {
    fontSize: scaledSize(12),

    color: theme.primaryTextColor,

    padding: 0,
  },

  modalButtonRow: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginTop: scaledSize(24),
  },

  cancelButton: {
    height: scaledSize(46),

    paddingHorizontal: scaledSize(18),

    borderRadius: scaledSize(12),

    backgroundColor: theme.buttonBGColor,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: scaledSize(10),
  },

  cancelText: {
    fontSize: scaledSize(12),

    fontWeight: '700',

    color: theme.primaryTextColor,
  },

  renameButton: {
    borderRadius: scaledSize(12),

    overflow: 'hidden',
  },

  gradientButton: {
    height: scaledSize(46),

    paddingHorizontal: scaledSize(20),

    justifyContent: 'center',

    alignItems: 'center',
  },

  renameText: {
    fontSize: scaledSize(12),

    fontWeight: '800',

    color: theme.buttonTextColor,
  },

  // ************* tag btn ****************
  addTagButton: {
    height: scaledSize(40),
    paddingHorizontal: scaledSize(14),

    borderRadius: scaledSize(12),

    // borderWidth: 1.5,

    // borderStyle: 'dashed',

    borderColor: theme.themeColor,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',


  },
})