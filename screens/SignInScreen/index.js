import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import cooplogo from "../../assets/icons/cooplogo.png";
import axios from "axios";
import styles from "./styles";
import { COLORS } from "../../constants/theme";
import Loading from "../../components/Loader";
import { StatusBar } from "expo-status-bar";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import store, { setError, setLoading } from "../../store";
import setUpInterceptor from "../../lib/axios_interceptors";
import { getAccountList } from "../../lib/api-calls/Accounts";
import { useDispatch, useSelector } from "react-redux";
import Modals from "../../components/Modals";

const SignInScreen = ({ navigation }) => {
  const [data, setData] = useState({
    username: "",
    password: "",
    check_textInputChange: false,
    secureTextEntry: true,
    isValidUser: true,
    isValidPassword: true,
  });

  const status = useSelector((state) => state.loading);
  const [ModalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();

  const textInputChange = (val) => {
    if (val.trim().length >= 4) {
      setData({
        ...data,
        username: val,
        check_textInputChange: true,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        username: val,
        check_textInputChange: false,
        isValidUser: false,
      });
    }
  };

  const handlePasswordChange = (val) => {
    if (val.trim().length >= 4) {
      setData({
        ...data,
        password: val,
        isValidPassword: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false,
      });
    }
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const handleValidUser = (val) => {
    if (val.trim().length >= 4) {
      setData({
        ...data,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        isValidUser: false,
      });
    }
  };

  const loginHandle = async () => {
    if ((data.username < 4) | (data.password < 4)) {
      setData({ ...data, isValidUser: false, isValidPassword: false });
    } else {
      try {
        dispatch(setLoading(true));
        const res = await axios.post(`${BASE_URL}/login`, {
          username: data.username,
          password: data.password,
        });
        AsyncStorage.setItem("AuthToken", JSON.stringify(res.data.access_token))
          .then(() => {
            dispatch(setUpInterceptor());
            setLoading(false);
          })
          .catch((error) => {
            console.log("Error saving token:", error);
            dispatch(setLoading(false));
            dispatch(setError(error.message))
            setModalOpen(true);

          });
        navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
      } catch (error) {
        dispatch(setLoading(false));
        dispatch(setError(error.message))
        setModalOpen(true);

        if (error.message === "Network Error") {
          console.log("network error");
        } else {
          console.log(error);
        }
      }
    }
  };

  return (
    <>
      {status.loading ? <Loading msg={"Loading"} /> :
        <View style={styles.container}>
          <StatusBar backgroundColor="#00adef" style="light" />
          <View style={styles.header}>
            <Image source={cooplogo} style={styles.cooplogo} />
          </View>
          <Animatable.View animation="fadeInUpBig" style={styles.footer}>
            <Text style={styles.text_footer}>Username</Text>
            <View style={styles.action}>
              <FontAwesome name="user-o" size={20} />
              <TextInput
                placeholder="Your Username"
                placeholderTextColor="#666666"
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(val) => textInputChange(val)}
                onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
              />
              {data.check_textInputChange ? (
                <Animatable.View animation="bounceIn">
                  <Feather name="check-circle" color="green" size={20} />
                </Animatable.View>
              ) : null}
            </View>
            {data.isValidUser ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>
                  Username must be 4 characters long.
                </Text>
              </Animatable.View>
            )}

            <Text
              style={[
                styles.text_footer,
                {
                  marginTop: 35,
                },
              ]}
            >
              Password
            </Text>
            <View style={styles.action}>
              <Feather name="lock" size={20} />
              <TextInput
                placeholder="Your Password"
                placeholderTextColor="#666666"
                secureTextEntry={data.secureTextEntry ? true : false}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(val) => handlePasswordChange(val)}
              />
              <TouchableOpacity onPress={updateSecureTextEntry}>
                {data.secureTextEntry ? (
                  <Feather name="eye-off" color="grey" size={20} />
                ) : (
                  <Feather name="eye" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>
            {data.isValidPassword ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>
                  Password must be at least 4 characters long.
                </Text>
              </Animatable.View>
            )}

            <TouchableOpacity>
              <Text style={{ color: "#00adef", marginTop: 15 }}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <View style={styles.button}>
              <TouchableOpacity style={styles.signIn} onPress={loginHandle}>
                <LinearGradient
                  colors={["#00a3ef", "#00adef"]}
                  style={styles.signIn}
                >
                  <Text
                    style={[
                      styles.textSign,
                      {
                        color: COLORS.white,
                      },
                    ]}
                  >
                    Sign In
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("SignUpScreen1")}
                style={[styles.signIn, styles.signup]}
              >
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: COLORS.primary,
                    },
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>}
      {!status.loading && Object.keys(status.error).length > 0 && ModalOpen && (
        <Modals
          props={{
            modalType: "error",
            type: "login",
            ModalOpen,
            setModalOpen,
          }}
        />
      )}
    </>
  );
};

export default SignInScreen;
