import {configureStore} from '@reduxjs/toolkit'
import RootReducer from './RootReducer';
import thunkMiddleware from 'redux-thunk'



const Store=configureStore({

    devTools: true,
    reducer:RootReducer,
   // middleware: [thunkMiddleware],


    
})
export default Store