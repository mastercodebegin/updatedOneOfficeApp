import moment from "moment"
import { DateFormat } from "../utilies/Constants"

export const getDateFromString = (dateStr: string) => {

    const date = new Date(dateStr)
    return date

}


export const getDateByMomentFormat = (dateStr: string|null|undefined, format?: string|null|undefined) => {
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