import React from 'react';
import { TouchableOpacity, Image, Text } from 'react-native';

interface CustomButtonProps {
  title: string;
  imageSource: any;
  onPress: () => void;
}

const CustomButton = ({ title, imageSource, onPress }: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mt-5 flex-row items-center justify-center bg-[#0AA696] py-4 rounded-3xl"
    >
      <Image
        source={imageSource}
        className="w-6 h-6 mr-3"
        resizeMode="contain"
      />
      <Text className="text-center text-white font-GothamBold">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
