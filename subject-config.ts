import { Subject } from "./data-model";

export const SUBJECT_CONFIG: Record<Subject, {
  label: string;
  labelKn: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  mathematics: {
    label: "Mathematics",
    labelKn: "ಗಣಿತ",
    color: "#3B82F6",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  science: {
    label: "Science",
    labelKn: "ವಿಜ್ಞಾನ",
    color: "#22C55E",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  socialScience: {
    label: "Social Science",
    labelKn: "ಸಮಾಜ ವಿಜ್ಞಾನ",
    color: "#F97316",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  kannada: {
    label: "Kannada",
    labelKn: "ಕನ್ನಡ",
    color: "#A855F7",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  english: {
    label: "English",
    labelKn: "ಇಂಗ್ಲಿಷ್",
    color: "#14B8A6",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
  },
};

export const SUBJECTS: Subject[] = ["mathematics", "science", "socialScience", "kannada", "english"];

export const QUOTES = [
  { kn: "ಶ್ರಮ ಎಂದಿಗೂ ವ್ಯರ್ಥವಾಗುವುದಿಲ್ಲ", en: "Hard work is never wasted" },
  { kn: "ಇಂದಿನ ಪ್ರಯತ್ನ ನಾಳಿನ ಯಶಸ್ಸು", en: "Today's effort is tomorrow's success" },
  { kn: "ನಿನ್ನ ಗುರಿ ನಿನ್ನ ಶಕ್ತಿ", en: "Your goal is your strength" },
  { kn: "ಕಷ್ಟಪಟ್ಟು ಓದಿ, ಯಶಸ್ವಿಯಾಗಿ", en: "Study hard, succeed well" },
  { kn: "ಪ್ರತಿ ದಿನ ಒಂದು ಹೆಜ್ಜೆ ಮುಂದೆ", en: "One step forward every day" },
];
