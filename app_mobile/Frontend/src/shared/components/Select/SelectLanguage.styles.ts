import { StyleSheet } from "react-native";

export const createStyles = (colors: any) => StyleSheet.create({
  container: { width: "100%", marginVertical: 10 },
  label: { marginBottom: 8, fontSize: 16, fontWeight: "600", color: colors.text },
  selectContainer: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    width: "100%",
    height: 55,
    color: colors.text,
    backgroundColor: colors.card,
  },
});
