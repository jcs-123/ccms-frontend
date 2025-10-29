import { commonapi } from "./commonapi";
import { serverurl } from "./serverurl";

// Add Project
export const addhardwareAPI = async (reqBody) => {
    return await commonapi('POST', `${serverurl}/add-hardware`, reqBody);
};

// Get Project
export const getproject = async () => {
    return await commonapi('GET', `${serverurl}/get-data`);
};

// Update Project
export const updatedataapi = async (id, reqBody) => {
    return await commonapi("PUT", `${serverurl}/update-data/${id}`, reqBody);
};

// Add Complaint
export const addcomplaint = async (reqBody) => {
    return await commonapi('POST', `${serverurl}/add-complaint`, reqBody);
};

// Get Complaints
export const getcomplaint = async () => {
    return await commonapi('GET', `${serverurl}/get-complaint`);
};

// ✅ Assign Complaint (by ticketNo)
export const assignComplaintAPI = async (ticketNo, reqBody) => {
    return await commonapi('PUT', `${serverurl}/assign-complaint/${ticketNo}`, reqBody);
};

// ✅ Update Complaint Remark (by ticketNo)
export const updateRemarkAPI = async (ticketNo, reqBody) => {
    return await commonapi('PUT', `${serverurl}/update-remark/${ticketNo}`, reqBody);
};

  
// ✅ Corrected SPOC APIs using full backend URL

export const addspoc = async (reqBody) => {
    return await commonapi('POST', `${serverurl}/add-spoc`, reqBody);
  };
  
  export const bulkUploadSpocs = async (spocsData) => {
  return await commonapi('POST', `${serverurl}/bulk-add`, { users: spocsData });
};
  export const getSpocUsers = async () => {
    return await commonapi('GET', `${serverurl}/get-spoc-users`);
  };
  
  export const editSpocUser = async (id, updatedData) => {
    return await commonapi('PUT', `${serverurl}/edit-spoc/${id}`, updatedData);
  };
  
  export const deleteSpocUser = async (id) => {
    return await commonapi('DELETE', `${serverurl}/delete-spoc/${id}`);
  };
  

  export const getSingleSpocUser = async (id) => {
    return await commonapi('GET', `${serverurl}/get-spoc-user/${id}`);
  };
  

  //get cc all complaint
//   export const getcccomplaint = async () => {
//     return await commonapi('GET', `${serverurl}/get-cccomplaint`);
// };
