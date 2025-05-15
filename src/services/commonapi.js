import axios from "axios"

export const commonapi = async (httprequest, url, reqBody) => {
    const reqconfig = {
       method: httprequest, 
       url,
 
       data: reqBody,
       headers: { "Content-Type": "application/json" }
    }
    return await axios(reqconfig).then((result) => {
       return result
    }).catch((err) => {
       return err
    })
 
 }