//@ts-nocheck
import * as React from 'react';
import { useState, useEffect } from 'react';
// import { Text } from 'react-native';
import RNFS from 'react-native-fs';
import { DocumentDirectoryPath, writeFile, readDir ,readFile} from 'react-native-fs';
import { Text, StyleSheet,
   FlatList, View, TouchableOpacity, Image, SafeAreaView,KeyboardAvoidingView } from 'react-native';
import { scaledSize, widthFromPercentage } from '../utilies/Utilities';
import { PdfIcon, FilterIcon } from '../assets/GlobalImages';
import RootView from './RootView';
import RNFetchBlob from 'rn-fetch-blob';

// import Icon from 'react-native-vector-icons/AntDesign';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';

import { FontAwesomeIcon, } from '@fortawesome/react-native-fontawesome'
// import { faEllipsisVertical,faTimesRectangle} from '@fortawesome/free-solid-svg-icons'
import { IconPack} from '@fortawesome/free-regular-svg-icons'

import CustomMenu from './Menu';
import { Button, Menu, Divider, Provider } from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import {Searchbar} from 'react-native-paper'
import Share from 'react-native-share';


function ReadPhotos({navigation}) {
  const [downloadsFolder, setDownloadsFolder] = useState('');
  const [documentsFolder, setDocumentsFolder] = useState('');
  const [externalDirectory, setExternalDirectory] = useState('');
  const [books, setBooks] = useState([])
  const [pdfData, setPdfData] = useState([]);
  const [filterData, setFilterData] = useState([]);

  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState([{ name: "ImagefileImagefileImagefile.pdf" }, { name: "Imagefile2.pdf" }]);

  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  useEffect(() => {
    readStorage()

  }, []);
  const readStorage = async () => {
    let list2 = [];
    let list = [];
    await RNFS.readDir(RNFS.ExternalStorageDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then(result => {
        result.forEach((item, index) => {
           console.log('if foreach', item.name)
          if (item.name.endsWith('.pdf')) {
            list2.push(item)
          console.log('if',item.name)
          }
          else if (item.isDirectory()) {
            // console.log('isDirectory', item.name)

            RNFS.readDir(item.path)
              .then(result => {
                console.log('result-----',result);
                  result.forEach((item, index) => {
                    // console.log('else if foreach', item.name)
                   if (item.name.endsWith('.pdf')) {
                     list2.push(item)
                     list.push(item)    
                  //  console.log('else if',item.name)
                   }
                })  
              }).catch((error) => {
                console.log('error-----',error)
              })
          }
        });
      })
      .catch(error => {
        console.log(error);
      });
      tempArr=[...list2,...list]
      console.log('tempArr',tempArr);
      console.log('list2',list2);
      console.log('list',list);
      
      setPdfData(list2)
      // setVisible(true)
  };

 const getDate=(item)=>{
  const day=item?.mtime?.getDate()
  const month=item?.mtime?.getMonth()
  const year=item?.mtime?.getFullYear()
  
  return `${day} ${month} ${year}`

  }
  const search=(data)=>{
    console.log('value',data);
    console.log('pdfData--',pdfData);
    const result= pdfData.filter((item)=>item.name.toUpperCase().startsWith(data.toUpperCase()))
    console.log('search-----',result);
    setFilterData(result)
    
  }
  const getFileSize=(size)=>{
     const kb = size/1000
    if(kb>1000)
    {
     const  mb = kb/1000
    //  const mbString=mb.toString
    //  mbString.
       return `${mb} MB`
    }
    else {return `${kb} KB`}

  }



  const onAndroidSharePress = async (url,name) => { 
    RNFetchBlob.fs
    .readFile(url, 'base64')
    .then(async (data) => {
      Share.open({
        filename:name,
        url:'data:application/pdf;base64,' + data
      })
    })
    .catch((err) => {}); }
  const renderItem = ({ item }) => (
    
  
  <View style={styles.mainView}>
      <View style={{ width: widthFromPercentage(14), height: scaledSize(50),justifyContent:'center',alignItems:'center' }}>
        <Image source={PdfIcon} style={styles.icon} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('PdfViewer',{uri:item.path})
  } >
      <View style={[styles.fileNameParentView,{height:40}]}>
        <View style={[styles.fileNameView]}>
          <Text style={{fontSize:16}}>{item?.name}</Text>
        </View>
        <View style={styles.dateAndSizeParentView}>
          <View style={styles.dateView}>
            <Text style={[styles.fontStyle]}>{ getDate(item)}</Text>
          </View>
          <View style={styles.fileSizeView}>
            <Text style={styles.fontStyle}>{getFileSize(item?.size)}</Text>
          </View>
        </View>
      </View>
      </TouchableOpacity>
      <View style={styles.favAndUnfavoriteView}>
        <Text style={styles.fontStyle}>hi</Text>
      </View>
        {/* <TouchableOpacity> */}
      <View style={styles.shareFileView}>

      <CustomMenu Icon={<Icon style={{}} name={'ellipsis-horizontal'}size={20} ></Icon>}
            menuOptionstyle={{padding:13,width:180,height:50}}
            menuOption={[{name:'Delete'},{name:'Share'}]}
            onPress={()=>onAndroidSharePress(item.path,item.name)}
            />
      </View>
            {/* </TouchableOpacity> */}
</View>

    
  )
  const openFile= async ()=>{
    try {
      const res = await DocumentPicker.pickSingle({
        type:DocumentPicker.types.pdf 
      })
console.log('response-----',res);
navigation.navigate('PdfViewer',{uri:res.uri})

      
    } catch (error) {
      
    }

  }



  const [searchQuery, setSearchQuery] = React.useState('');

  const onChangeSearch = query => setSearchQuery(query);
  
      const onIOSSharePress = () => Share.share({ message: 'https://developer.apple.com/', title: 'hello' });



  return (
    <SafeAreaView style={{ flex: 1,backgroundColor:'white' }}>
      <View style={{ flex: .2, flexDirection: 'column' }}>
        <View style={{ height:scaledSize(60), flexDirection: 'row',backgroundColor:'white' }}>
          <View style={{ flex: 1, flexDirection: 'column',alignItems:'flex-start',backgroundColor:'white'}}>
            <Text style={{left:scaledSize(30),top:scaledSize(20),fontSize:scaledSize(22),fontWeight:'500'}}>Photos Viewer</Text>
            {/* <CustomMenu onPress={(item)=>console.log('>>>>>',item)}/> */}
            {/* <CustomMenu Icon={<Icon  name="menu" size={40} onPress={openMenu}></Icon>}/> */}

           </View>
          <View style={{ flex: .6,zIndex:100, flexDirection: 'row',
           alignItems:'center',justifyContent:'space-between',top:6,}}> 
          <TouchableOpacity onPress={()=>openFile()}>
          <Text style={{fontSize:scaledSize(20),fontWeight:'400'}}>Open</Text>
          </TouchableOpacity>

            {/* <CustomMenu Icon={<Icon  name="ellipsis-vertical-outline" size={40} ></Icon>} */}
            <CustomMenu Icon={<Icon  name={'ellipsis-vertical'}size={30} ></Icon>}
            menuOptionstyle={{padding:scaledSize(13),width:scaledSize(180),height:scaledSize(50)}}
             menuOption={[{name:'Share'},{name:'Privacy policy'},{name:'Contact us',color:'red'}]}
             />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent:'center',alignItems:'center', }}>
       <View style={{width:'96%',height:scaledSize(30)}}>
        <Searchbar
      placeholder="Search"
      style={{borderRadius:scaledSize(45),height:scaledSize(45),backgroundColor:'white'}}
      onChangeText={(value)=>search(value)}
      placeholderTextColor="#d5d5d5"
      // value={searchQuery}
      />
      </View>
      </View>
      </View>

      <View style={{flex:.8,backgroundColor:'white'}}>
      {pdfData.length > 0 ? (
        <FlatList data={filterData.length>0?filterData:pdfData} renderItem={renderItem}
        // keyExtractor={(item) => item}
        />
      ) : (
        <>
        {/* { readStorage()} */}
         <Text>No files</Text>
       </>
      )}
         </View>
      {/* <Provider>
      
      <Menu
      
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Icon  name="menu" size={40} onPress={openMenu}></Icon>}>
        <Menu.Item onPress={(e)=>{console.log ('e'),closeMenu()}} title="Item 1" />
        <Menu.Item onPress={(e)=>{console.log ('e'),closeMenu()}} title="Item 2"/>
        {/* <Divider /> */}
        {/* <Menu.Item onPress={(e)=>{console.log ('e'),closeMenu()}} title="Item 3" /> */}
      {/* </Menu> */}
  {/* </Provider> */} 
 

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ///

  loading: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    fontSize: scaledSize(18),
  },
  mainView: {
    height: scaledSize(80),
    width: "100%",
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    // marginTop: .6,
    backgroundColor: '#FFFF'
  },
  icon:{
    height: scaledSize(30), 
    width: scaledSize(30),
    marginLeft:scaledSize(6)
  },
  fileNameParentView: {
    width: widthFromPercentage(66),
    height: scaledSize(40),
    // backgroundColor: 'red',
    flexDirection: "column"
  },

  fileNameView: {
    flex: 1,
    // backgroundColor:'red',
    // height:scaledSize(50),
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  dateAndSizeParentView: {
    flex: 1,
    // backgroundColor: 'tomato',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateView: {
    flex: 1,
    // backgroundColor: 'purple',
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems:'flex-end'

  },
  fileSizeView: {
    flex: 1,
    // backgroundColor: 'orange',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  favAndUnfavoriteView: {
    width: widthFromPercentage(10),
    height: scaledSize(50),
    justifyContent: 'center',
    alignItems: 'center'
  },
  shareFileView: {
    width: widthFromPercentage(10),
    height: scaledSize(50),
    justifyContent: 'center'
  },

  fontStyle: {
    fontSize: scaledSize(12),
    fontWeight: '400',
  }
});
export default ReadPhotos