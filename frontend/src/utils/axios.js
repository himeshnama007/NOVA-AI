import axios from "axios";

const api =       //baseurl ki jagah api use kr ske 
axios.create({

 baseURL:
 import.meta.env.VITE_SERVER_URL,

 withCredentials:true

});

export default api;    //api ko har jagah use krne ke liye export kr rhe he