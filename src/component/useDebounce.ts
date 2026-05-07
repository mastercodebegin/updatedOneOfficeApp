import react,{useState,useEffect} from 'react'



const useDebounce=({searchText,delay})=>{
  const [debouncedText,setDebouncedText] = useState('')
useEffect(()=>{

 const time= setTimeout(()=>{
setDebouncedText(searchText) 
  },delay)
  return()=>{
    console.log('component unmount')
    clearTimeout(time)
  }

},[searchText,delay])
return debouncedText
}

export default useDebounce