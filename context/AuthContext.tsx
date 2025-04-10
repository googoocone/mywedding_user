"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (accessToken) {
      axios
        .get("http://localhost:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true, // 쿠키 전송
        })
        .then((res) => {
          if (res.data.code === 200 && res.data.data) {
            setUser(res.data.data);
          }
        })
        .catch((err) => {
          console.error("사용자 정보 조회 에러:", err);
        });
    }
  }, [accessToken]);

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/refresh",
        {},
        { withCredentials: true }
      );
      if (response.data.code === 200 && response.data.data) {
        const newToken = response.data.data.access_token;
        setAccessToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.error("Refresh token 요청 에러:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, user, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
