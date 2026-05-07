import moment from "moment"
import { asyncStorageKeyName, DateFormat } from "../utilies/Constants"
import { getLocalData } from "./storageService"
import { Timestamp } from "@react-native-firebase/firestore"

const getDateFromString = (dateStr: string) => {

    const date = new Date(dateStr)
    return date

}


const getDateByMomentFormat = (dateStr?: string | null | undefined, format?: string | null | undefined) => {
    if (dateStr != null && dateStr != undefined) {
        if (format) {
            const date = moment(dateStr).format(format)
            return date
        }
        else {
            const date = moment(dateStr).format(DateFormat.DATE_WITH_MONTH_NAME)
            return date
        }
    }
    else {
        if (format != null && format != undefined) {
            const currentDate = moment().format(format);
            console.log('currentDate-----', currentDate)

            return currentDate
        }
        else {
            const currentDate = moment().format(DateFormat.DDMMYYYY_WITH_HYPEN_SEPERATOR);
            console.log('currentDate-----else', currentDate)
            return currentDate
        }

    }
}

function getMillis(ts: any): number {


    if (ts.updatedAt.seconds) {

        return ts.updatedAt.seconds * 1000 + Math.floor(ts.updatedAt.nanoseconds / 1e6);
    }
    else {
        return ts.updatedAt
    }
}
function getFirebaseTimeStampByMillis(): any {
    const lastsyncTime = getLocalData(asyncStorageKeyName.LAST_SYNC_TIME)
    console.log(' getFirebaseTimeStampByMillis LastsyncTime get:', lastsyncTime);
    console.log('getFirebaseTimeStampByMillis LastsyncTime get:', typeof lastsyncTime);
    const finalLastSyncTime = Number(lastsyncTime);
    const safeTime = isNaN(finalLastSyncTime) ? 0 : finalLastSyncTime;
    console.log('getFirebaseTimeStampByMillis safeTime:', safeTime);
    const time = Timestamp.fromMillis(safeTime);
    console.log('time>>>>', time);
    return time;
}
export const DateHelper = {
    getDateFromString,
    getDateByMomentFormat,
    getMillis,
    getFirebaseTimeStampByMillis
}