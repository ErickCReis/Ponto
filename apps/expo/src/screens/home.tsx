import React from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { api } from "../utils/api";

export const HomeScreen = () => {
  return (
    <SafeAreaView className="bg-zinc-700">
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-5xl font-bold text-white">
          Ponto
        </Text>
      </View>
    </SafeAreaView>
  );
};
