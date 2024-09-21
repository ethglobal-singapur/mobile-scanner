import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-reanimated";
import axios from "axios";

const Scan = () => {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const options = { language: "latin" } as any;

  let intervalRef = useRef<any>(null);

  const [time, setTime] = useState(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (time >= 10) {
        return setTime(0);
      }
      setTime((time) => time + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    requestPermission();
  }, []);

  const sendImage = async (data: any) => {
    console.log(data);
    try {
      const res = await axios.post(
        (process.env.EXPO_PUBLIC_BE_URL + "/scan-image") as string,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const jr = JSON.parse(res.data ?? {});
      console.log(jr);
      const d = await axios.put(
        process.env.EXPO_PUBLIC_MRZ_BE_URL + "/add-country-to-user",
        {
          document_number: jr.document_number,
          name: jr.name,
          surname: jr.surname,
          birth_date: jr.birth_date,
          date: Date.now().toString(),
          country: jr.country,
          visitedCountry: {
            name: "singapur",
            date: Date.now().toString(),
            isVisit: true,
          },
        }
      );
      console.log(d);
    } catch (error) {
      console.log(error);
    }
  };

  const ref = useRef<Camera>(null);

  if (!hasPermission) return <Text>No Permission</Text>;
  if (device == null) return <Text>No Camera</Text>;

  return (
    <GestureHandlerRootView>
      <View className="flex-1">
        <SafeAreaView className="flex-1">
          <Camera
            // @ts-ignore
            mode={"recognize"}
            preview={true}
            ref={ref}
            photo={true}
            className="flex-1"
            device={device}
            isActive={hasPermission}
          />
          <View className="    " style={StyleSheet.absoluteFill}>
            <SafeAreaView className="flex-1 py-6">
              <View className="w-[120px] mx-auto flex-1  bg-green-200  opacity-20 rounded-md"></View>
              <View className=" items-center justify-end p-6">
                <TouchableOpacity
                  onPress={() => {
                    ref.current?.takePhoto().then(async (photo) => {
                      const fD = new FormData();
                      // @ts-ignore
                      fD.append("photo", {
                        uri:
                          Platform.OS === "android"
                            ? "file://" + photo.path
                            : photo.path.replace("file://", ""),
                        type: "image/jpeg",
                        name: "image.jpg",
                      });

                      sendImage(fD);
                    });
                  }}
                  className=" w-[64px] rounded-full aspect-square border-[4px] border-white  "
                ></TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
};

export default Scan;
