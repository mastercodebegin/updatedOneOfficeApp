import moment from "moment"
import { DateFormat } from "../utilies/Constants"

 const getDateFromString = (dateStr: string) => {

    const date = new Date(dateStr)
    return date

}


 const getDateByMomentFormat = (dateStr?: string|null|undefined, format?: string|null|undefined) => {
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
            console.log('currentDate-----',currentDate)
            
            return currentDate
        }
        else {
            const currentDate = moment().format(DateFormat.DDMMYYYY_WITH_HYPEN_SEPERATOR);
            console.log('currentDate-----else',currentDate)
            return currentDate
        }

    }
}

function getMillis(ts: any): number {

  console.log('Invalid timestamp format:', ts);
  

  const time =  ts.updatedAt.seconds * 1000 + Math.floor(ts.updatedAt.nanoseconds / 1e6);
  return time;
}
export const DateHelper= {
    getDateFromString,
    getDateByMomentFormat,
    getMillis
}