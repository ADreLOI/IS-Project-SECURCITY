// app/+not-found.tsx
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Pagina non trovata" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Questa pagina non esiste.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Torna alla login</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#011126",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  link: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0AA696",
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});
