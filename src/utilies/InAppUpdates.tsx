import SpInAppUpdates, {
    IAUUpdateKind,
    StartUpdateOptions,
    IAUInstallStatus,
  } from "sp-react-native-in-app-updates";
  import { Platform } from "react-native";
  
  export const checkForUpdate = async () => {
    console.log("checkForUpdate");
    const inAppUpdates = new SpInAppUpdates(
      true// isDebug
    );
    // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
    try {
      await inAppUpdates.checkNeedsUpdate().then((result) => {
        console.log("checkNeedsUpdate======", result);
        
        try {
          if (result.shouldUpdate) {
            let updateOptions: StartUpdateOptions = {};
            if (Platform.OS === "android") {
              // android only, on iOS the user will be promped to go to your app store page
              console.log('Android');
              
              updateOptions = {
                updateType: IAUUpdateKind.IMMEDIATE,
              };
            }
            if (Platform.OS === "ios") {
              updateOptions = {
                title: "Update available",
                message:
                  "There is a new version of the app available on the App Store, do you want to update it?",
                buttonUpgradeText: "Update",
                
                buttonCancelText: "Cancel",
              };
            }
            inAppUpdates.addStatusUpdateListener((downloadStatus) => {
              console.log("download status", downloadStatus);
              if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
                console.log("downloaded");
                inAppUpdates.installUpdate();
                inAppUpdates.removeStatusUpdateListener((finalStatus) => {
                  console.log("final status", finalStatus);
                });
              }
            });
            inAppUpdates.startUpdate(updateOptions).catch((error) => {console.log('error----',error)
            });
          }
        } catch (error) {
          console.log('erorr=2',error);
        }
      });
    } catch (error) {
      console.log('erorr=3',error);
    }
  };