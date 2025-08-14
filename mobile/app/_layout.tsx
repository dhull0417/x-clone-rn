import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";

const queryClient = new QueryClient();

// Stack allows for easy navigation of previous pages by swiping right or left like a stack of pages
export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="(auth)" options={{headerShown: false}}/>
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
