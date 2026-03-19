// 1. react-native-print
// 2. react-native-signature-capture
// 3. react-native-flatlist-draggable
// 4. https://github.com/NitrogenZLab/react-native-photo-editor

import { file } from "jszip"
import EventBlock from "react-native-calendars/src/timeline/EventBlock"


// File Manager permission

// Go to mainapplication.kt file
// under add package list add below package
// add(PermissionFilePackage()) // Correct Kotlin syntax

// Add in this block
// PackageList(this).packages.apply {
//     Packages that cannot be autolinked yet can be added manually here, for example:
//     add(MyReactNativePackage())
//     add(PermissionFilePackage()) 
// }

// then go to android/app/src/main/java/com/shopax/pdfviewer

// where you will get 2 extra files 
//  ManiActivity.kt
//  MainApplication.kt
//  PermissionFileModule ->this one
//  PermissionFilePackage ->this one

// copy them needs to perform only 2 steps for permission


