
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import AsyncStorage from '@react-native-async-storage/async-storage';



export const getBankList = createAsyncThunk('getBankList', async () => {
    const res = await fetch('https://api.jsonsilo.com/public/fb20cc0e-8ad8-4e0d-971b-a4e7cbba310c')


    return res
})


const FileSlice = createSlice({
    name: 'FileSlice',
    initialState: {
        files: [],
        selectedFiles: [],
        filePasswords: [],
        isLoading: false,
        isUserViewedPdf: false,

    },
    //     extraReducers: {


    //         [getBankList.pending]: (state, action) => {
    //             console.log('pending------', action);
    //             state.isLoading = true
    //         },
    //         [getBankList.fulfilled]: (state, action) => {
    //             state.unitOrders = [action.payload]
    //             state.isLoading = false
    //         },

    //         [getBankList.rejected]: (state, action) => {
    //             console.log('rejected-------', action.payload);
    //             state.isLoading = false
    //         },

    //    },

    reducers: {
        updateIsLoadingState: (state, action) => {
            console.log('state', action.payload);

            state.isLoading = action.payload
        },


        updateSelectedPdf: (state, action) => {
            state.files = action.payload
        },
        updateFilesPassword: (state, action) => {
            state.filePasswords = action.payload
        },
        updateSelectedFiles: (state, action) => {
            console.log('updateSelectedFiles', action.payload);
            
            const exists = state.selectedFiles.some(
                item => item.id === action.payload.id
            );

            state.selectedFiles = exists
                ? state.selectedFiles.filter(
                    item => item.id !== action.payload.id
                )
                : [action.payload, ...state.selectedFiles];
        },
        clearSelectedFiles: (state, action) => {
            state.selectedFiles = []
        },

        checkIsUserViewedPdf: (state, action) => {
            console.log('checkIsUserViewedPdf', action.payload);
            state.isUserViewedPdf = action.payload
        },


    },


})

export default FileSlice.reducer
export const { updateIsLoadingState, updateSelectedPdf, updateFilesPassword,
    checkIsUserViewedPdf, updateSelectedFiles, clearSelectedFiles } = FileSlice.actions