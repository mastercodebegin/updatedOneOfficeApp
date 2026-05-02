
import React from 'react'
import Axios from 'axios'
import { ApiHeader } from './ApiHeader'
// import { header } from '../../helper/Header'

const UrlConstants = {
    BASE_URL: ''
}
const getRequestMethod = async (requestUrl: any) => {
    const headers = await ApiHeader();

    try {
        const response = await Axios({
            method: 'get',
            headers: headers,
            url: UrlConstants.BASE_URL + requestUrl,
        });

        console.log('response======', response.data);

        return response?.data;
    } catch (error) {
        // Axios error object contains response data in error.response
        if (error.response) {
            console.log('error--------------', error.response.data.message);
            // const dispatch = useDispatch()
            //  dispatch(ShowErrorModal(error.response.data.message))
            CutomToastFail(error.response.data.message)
            throw new Error(error.response.data.message); // Throwing error to trigger rejection
        } else {
            console.log('error--------------', error.message);
            throw new Error(error.response.data.message); // Throwing error to trigger rejection
        }
    }
}

const getRequestMethodWithParam = async (requestParam: any, requestUrl: any) => {
    const headers = await ApiHeader();

    try {
        const response = await Axios({
            method: 'get',
            headers: headers,
            params: requestParam,
            url: UrlConstants.BASE_URL + requestUrl,
        });

        return response?.data;
    } catch (error) {
        // Axios error object contains response data in error.response
        if (error.response) {
            console.log('error common service--------------', error.response.data.message);
            // const dispatch = useDispatch()
            //  dispatch(ShowErrorModal(error.response.data.message))
            CutomToastFail(error.response.data.message)
            throw new Error(error.response.data.message); // Throwing error to trigger rejection
        } else {
            console.log('error common service else--------------', error.message);
            throw new Error(error.response.data.message); // Throwing error to trigger rejection
        }
    }
}

const deleteRequestMethodWithParam = async (requestData: any, requestUrl: any) => {
    console.log('deleteRequestMethodWithParam url----', UrlConstants.BASE_URL + requestUrl)
    console.log('gdeleteRequestMethodWithParama-----', requestData)

    const response = await Axios({
        method: 'delete',
        url: UrlConstants.BASE_URL + requestUrl,
        headers: {
            "jwtToken": UrlConstants.TOKEN,

        },
        params: requestData
    }
    ).catch(error => error);

    return response


}

const postRequestMethod = async (requestData: any, accessToken: string) => {
    const headers = await ApiHeader();
    console.log('postRequestMethod requestData=====', requestData);


    try {
        const response = await Axios.post(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            requestData, // ✅ must be FormData
            {
                headers: {
                    Authorization: `Bearer ${accessToken.replace(/"/g, '')}`,
                    
                },
            },
            

        );

        return response?.data;
    }
    catch (error: any) {
        console.log('error>>>>>>>>>>>>', error);

        if (error.response) {
            console.log('error--------------', error.response.data?.message);

            throw {
                code: error.response.status,
                message: error.response.data?.message,
            };
        } else {
            console.log('error--------------', error.message);

            throw {
                code: 0,
                message: error.message,
            };
        }
    };
}





// export const putRequestMethodWithBodyAndParam = async ({ requestBody, requestUrl, requestParam }: PutRequestOptions) => {
//     console.log("Put method-----",requestParam)

//     const  response = await Axios({
//         method:'put',
//         params:requestParam,
//         data:requestBody,
//         url:UrlConstants.BASE_URL+requestUrl,  
//         headers:{'jwtToken':UrlConstants.TTOKEN}
//     }).catch(error=>error.response.status!==200?error.response.data:null);
//     console.log('url-----------',);

//     return response.data

// }
export const CommonApiService = {
    getRequestMethod,
    getRequestMethodWithParam,
    deleteRequestMethodWithParam,
    postRequestMethod,

}