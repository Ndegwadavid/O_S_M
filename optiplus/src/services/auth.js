// src/services/auth.js
const credentials = {
    reception: {
      username: 'optiplus',
      password: 'optiplusMoiAvenue'
    },
    examination: {
      username: 'optiplus',
      password: 'optiplusMoiAvenue'
    },
    admin: {
      username: 'admin',
      password: 'adminMoiAvenue'
    }
  };
  
  export const validateCredentials = (username, password, department) => {
    const deptCredentials = credentials[department];
    
    if (!deptCredentials) {
      return false;
    }
  
    return deptCredentials.username === username && 
           deptCredentials.password === password;
  };