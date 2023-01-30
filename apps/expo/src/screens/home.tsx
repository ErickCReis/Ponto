import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
