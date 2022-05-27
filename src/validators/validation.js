const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "object" && Object.keys(value).length===0) return false;
  return true;
};

const isRequestBodyEmpty = function (value) {
  if (Object.keys(value).length > 0) return true;
  else {
    return false;
  }
};

const validString = (String) => {
  if (/^[a-zA-Z]+$/.test(String)) {
    return true;
  } else {
    return false;
  }
};

const validMobileNum = (Mobile) => {
  if (/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(Mobile))
    return true;
  else false;
};

const validEmail = (Email) => {
  if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(Email)) {
    return false;
  } else {
    return true;
  }
};

const validPwd = (Password) => {
  if (
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(
      Password
    )
  ) {
    return true;
  } else {
    return false;
  }
};

const validPinCode = (Pincode) => {
  if (/([1-9]{1}[0-9]{5}|[1-9]{1}[0-9]{3}\\s[0-9]{3})/.test(Pincode)) {
    return false;
  } else {
    return true;
  }
};

const isValidObjectType = (value) => {
  if (typeof value === "object" && Object.keys(value).length > 0) {
    return false;
  } else {
    return true;
  }
};
const isValidSize = (sizes) => {
  return ["S", "XS","M","X", "L","XXL", "XL"].includes(sizes);
}

module.exports = {
  isValid,
  isRequestBodyEmpty,
  validString,
  validMobileNum,
  validEmail,
  validPwd,
  validPinCode,
  isValidObjectType,
  isValidSize
};
