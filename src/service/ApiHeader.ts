import AsyncStorage from "@react-native-async-storage/async-storage"
import { asyncStorageKeyName } from "../../src/utilies/Constants"
import { getLocalData } from "../../src/utilies/storageService"

export const ApiHeader=async()=>{
const token = getLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN)


return token?{
 Authorization: `Bearer ${token.replace(/"/g, '')}`, // clean token
}:{}
}