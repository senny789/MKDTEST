import React, { useReducer } from "react";
import { useNavigate } from "react-router";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      //TODO
      localStorage.setItem("role", String(action.payload.role));
      localStorage.setItem("token", String(action.payload.token));
      console.log("lol");
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        role: action.payload.role,
      };
    case "REFRESH":
      return {
        ...state,
        isAuthenticated: true,
      };
    case "LOGOUT":
      localStorage.clear();

      return {
        isAuthenticated: false,
        token: null,
        role: null,
        user: null,
      };
    default:
      return state;
  }
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage) => {
  const role = localStorage.getItem("role");

  if (errorMessage === "TOKEN_EXPIRED") {
    dispatch({
      type: "LOGOUT",
    });
    window.location.href = "/" + role + "/login";
  }
};
const checkToken = async () => {
  const isValid = await sdk.check("admin");
  return isValid;
};
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    //TODO

    if (!checkToken()) {
      tokenExpireError();
    } else {
      dispatch({ type: "REFRESH" });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
