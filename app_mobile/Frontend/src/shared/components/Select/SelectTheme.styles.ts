import { StyleSheet } from "react-native";
import { createTextStyles } from "../../../theme/constants/typography";
import { Radius } from "../../../theme/constants/radius";
import { Spacing } from "../../../theme/constants/spacing";

export const createStyles = (colors: any) => {
  const text = createTextStyles(colors);
  return StyleSheet.create({
    trigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.md },
    triggerLabel: { ...text.bodyMedium, color: colors.text },
    triggerValue: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
    triggerSwatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
    triggerText: { ...text.bodyMedium, color: colors.secondaryText },
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: Spacing.xl },
    container: { borderRadius: Radius.card, padding: Spacing.xl, backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.cardBorder },
    title: { ...text.h3, marginBottom: Spacing.lg, color: colors.textHeading },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
    card: { width: "47%", padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    cardActive: { borderColor: "#D1D5DB", backgroundColor: "#F3F4F6" },
    cardHovered: { borderColor: "#C7D2E0", backgroundColor: "#E8EEF7" },
    swatch: { width: "100%", height: 54, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
    swatchCheck: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#9CA3AF" },
    swatchCheckText: { fontSize: 14, fontWeight: "800", color: "#111827" },
    cardLabel: { ...text.bodyMedium, marginTop: Spacing.sm, textAlign: "center", color: colors.text },
    cardLabelActive: { color: "#111827" },
    cardKey: { ...text.overline, fontSize: 10, textAlign: "center", color: colors.secondaryText },
    cardKeyActive: { color: "#475569" },
    closeButton: { marginTop: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: "center", backgroundColor: colors.input },
    closeText: { ...text.label, color: colors.textHeading },
  });
};
