import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

const Index = () => {
  return (
    <SafeAreaView className="bg-zinc-700">
      <Stack.Screen options={{ title: "Home" }} />
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-5xl font-bold text-white">
          Ponto
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;
