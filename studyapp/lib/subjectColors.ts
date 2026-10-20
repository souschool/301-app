import type { Subject } from "@/types";

export const subjectConfig: Record<
  Subject,
  {
    label: string;
    bg: string;
    bgLight: string;
    text: string;
    border: string;
    badge: string;
  }
> = {
  国語: {
    label: "国語",
    bg: "bg-orange-500",
    bgLight: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-400",
    badge: "bg-orange-100 text-orange-800",
  },
  数学: {
    label: "数学",
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-800",
  },
  英語: {
    label: "英語",
    bg: "bg-green-500",
    bgLight: "bg-green-50",
    text: "text-green-700",
    border: "border-green-400",
    badge: "bg-green-100 text-green-800",
  },
  理科: {
    label: "理科",
    bg: "bg-purple-500",
    bgLight: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-400",
    badge: "bg-purple-100 text-purple-800",
  },
  社会: {
    label: "社会",
    bg: "bg-yellow-500",
    bgLight: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-400",
    badge: "bg-yellow-100 text-yellow-800",
  },
};
