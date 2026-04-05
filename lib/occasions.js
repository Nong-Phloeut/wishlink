export const occasions = [
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    bg: "#E1F5EE",
    fg: "#085041",
    border: "#5DCAA5",
    accent: "#1D9E75",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    emoji: "💍",
    bg: "#EEEDFE",
    fg: "#26215C",
    border: "#AFA9EC",
    accent: "#7F77DD",
  },
  {
    id: "wedding",
    label: "Wedding",
    emoji: "💒",
    bg: "#FBEAF0",
    fg: "#4B1528",
    border: "#ED93B1",
    accent: "#D4537E",
  },
  {
    id: "newyear",
    label: "New Year",
    emoji: "🎆",
    bg: "#FAEEDA",
    fg: "#412402",
    border: "#EF9F27",
    accent: "#BA7517",
  },
  {
    id: "farewell",
    label: "Farewell",
    emoji: "✈️",
    bg: "#E6F1FB",
    fg: "#042C53",
    border: "#85B7EB",
    accent: "#378ADD",
  },
  {
    id: "custom",
    label: "Custom",
    emoji: "🎉",
    bg: "#F1EFE8",
    fg: "#2C2C2A",
    border: "#B4B2A9",
    accent: "#5F5E5A",
  },
  {
    id: "khmernew year",
    label: "Khmer New Year",
    emoji: "🌺",
    bg: "#FFF7ED",
    border: "#FCD34D",
    accent: "#B45309",
    fg: "#1C0A00",
    khmer: true,
  },
  {
    id: "khmergraduation",
    label: "Graduation",
    emoji: "🎓",
    bg: "#FFFBEB",
    border: "#FDE68A",
    accent: "#D97706",
    fg: "#1C0A00",
    khmer: true,
  },
];

export function getOccasion(id) {
  if (id?.startsWith("custom:")) {
    const [, emoji, label] = id.split(":");
    return {
      id,
      label,
      emoji,
      bg: "#F8F7F4",
      border: "#E5E5E3",
      accent: "#1D9E75",
      fg: "#1A1A1A",
    };
  }
  return occasions.find((o) => o.id === id) || occasions[0];
}
