import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInUp } from "react-native-reanimated";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

export default function TokenGeneratorPage() {
  // Local state variables for inputs and UI flow
  const [adminCode, setAdminCode] = useState(""); // Admin code input
  const [generatedToken, setGeneratedToken] = useState(""); // Stores generated token
  const [errorMessage, setErrorMessage] = useState(""); // Error message shown to user
  const [isGenerating, setIsGenerating] = useState(false); // Indicates loading state
  const [success, setSuccess] = useState(false); // Indicates if a token was successfully generated
  const [showCopied, setShowCopied] = useState(false); // Flag to display 'copied' message
  const [isValidated, setIsValidated] = useState(false); // Tracks if admin code has been validated



  
  // Function to request token generation from the backend
  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setErrorMessage("");
    setGeneratedToken("");

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/comune/genera-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codiceAdmin: adminCode }),
        }
      );

      const data = await response.json();

      if (response.status === 201) {
        setGeneratedToken(data.token); // Display token to user
        setSuccess(true); // Show success box
        setIsValidated(true); // Hide admin code input
      } else {
        setErrorMessage(data.message || "Token generation failed.");
      }
    } catch (error) {
      console.error("Token generation error:", error);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to copy token to clipboard and display temporary message
  const copyToClipboard = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#011126] px-6">
      <Animated.View
        entering={SlideInUp.duration(500)}
        className="w-full max-w-md"
      >
        {/* Title */}
        <Text className="text-white text-4xl font-GothamUltra mb-8 text-center">
          Generate Comune Token
        </Text>

        {/* Error message */}
        {errorMessage !== "" && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Text className="text-red-400 font-GothamBold text-center mb-4">
              {errorMessage}
            </Text>
          </Animated.View>
        )}

        {/* Success box with generated token */}
        {success && (
          <Animated.View
            entering={FadeIn}
            className="bg-[#0A1C2E] p-4 rounded-xl mb-4"
          >
            <Text className="text-white text-center font-GothamBold mb-2">
              Generated Token:
            </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Text className="text-[#0AA696] text-center font-GothamBold text-lg underline">
                {generatedToken}
              </Text>
              <Text className="text-sm text-center text-gray-400">
                Click to copy
              </Text>
            </TouchableOpacity>

            {showCopied && (
              <Text className="text-green-400 text-center font-GothamBold mt-2">
                Copied to clipboard!
              </Text>
            )}
          </Animated.View>
        )}

        {/* Admin code input - shown only if not yet validated */}
        {!isValidated && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Text className="text-white font-GothamBold mb-1">Admin Code</Text>
            <TextInput
              className="border border-[#0AA696] border-[1.5px] rounded-2xl px-4 py-4 mb-6 bg-gray-100 text-gray-800 font-GothamBold"
              placeholder="Enter admin code"
              value={adminCode}
              onChangeText={setAdminCode}
              secureTextEntry
            />
          </Animated.View>
        )}

        {/* Main action button (after validation) */}
        {isValidated && (
          <TouchableOpacity
            className={`rounded-2xl py-4 mb-4 ${
              isGenerating ? "bg-[#066d5e]" : "bg-[#0AA696]"
            }`}
            onPress={handleGenerateToken}
            disabled={isGenerating}
          >
            <Text className="text-white text-center font-GothamBold">
              {isGenerating ? "Generating..." : "Generate New Token"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Initial button (before admin code check) */}
        {!isValidated && (
          <TouchableOpacity
            className={`rounded-2xl py-4 ${
              isGenerating ? "bg-[#066d5e]" : "bg-[#0AA696]"
            }`}
            onPress={handleGenerateToken}
            disabled={isGenerating}
          >
            <Text className="text-white text-center font-GothamBold">
              {isGenerating ? "Verifying..." : "Generate Token"}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}
