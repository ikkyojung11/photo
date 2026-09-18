import { FilterConfig } from "./colorGrading";

export interface PresetItem {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  config: FilterConfig;
  previewColor: string;
}

export const PRESETS: PresetItem[] = [
  {
    id: "sakura-picnic",
    name: "🌸 벚꽃 피크닉 감성 (타깃 매칭)",
    subtitle: "따스한 햇살, 부드러운 벚꽃 핑크 & 세이지 잔디 톤",
    tag: "추천 원클릭",
    previewColor: "from-pink-400 via-rose-300 to-amber-200",
    config: {
      exposure: 12,
      contrast: -22,
      warmth: 16,
      tint: 9,
      highlights: 28,
      shadows: 36,
      bloom: 35,
      greenMute: 55,
      grain: 8,
      vignette: 10,
    },
  },
  {
    id: "tokyo-pastel",
    name: "🎞️ 도쿄 파스텔 35mm",
    subtitle: "투명하고 맑은 일본 필름 특유의 은은한 감성",
    tag: "필름",
    previewColor: "from-sky-300 via-rose-200 to-emerald-100",
    config: {
      exposure: 15,
      contrast: -18,
      warmth: 6,
      tint: 14,
      highlights: 22,
      shadows: 28,
      bloom: 22,
      greenMute: 42,
      grain: 16,
      vignette: 12,
    },
  },
  {
    id: "golden-spring",
    name: "☀️ 봄날의 골든 선샤인",
    subtitle: "포근한 온기와 화사한 골든 아워의 황금빛",
    tag: "웜톤",
    previewColor: "from-amber-400 via-orange-300 to-yellow-200",
    config: {
      exposure: 14,
      contrast: -10,
      warmth: 28,
      tint: 5,
      highlights: 25,
      shadows: 20,
      bloom: 25,
      greenMute: 45,
      grain: 10,
      vignette: 15,
    },
  },
  {
    id: "dreamy-bloom",
    name: "✨ 몽환 오튼 글로우 (Orton)",
    subtitle: "요정 같은 극적인 빛 번짐과 극강의 부드러움",
    tag: "몽환",
    previewColor: "from-fuchsia-300 via-pink-200 to-purple-200",
    config: {
      exposure: 15,
      contrast: -26,
      warmth: 12,
      tint: 8,
      highlights: 38,
      shadows: 42,
      bloom: 58,
      greenMute: 50,
      grain: 6,
      vignette: 18,
    },
  },
  {
    id: "classic-portra",
    name: "📸 클래식 포트라 400",
    subtitle: "인물 피부톤이 가장 화사하고 자연스러운 필름 룩",
    tag: "인물",
    previewColor: "from-orange-300 via-amber-200 to-stone-300",
    config: {
      exposure: 8,
      contrast: -8,
      warmth: 14,
      tint: 6,
      highlights: 16,
      shadows: 25,
      bloom: 12,
      greenMute: 35,
      grain: 22,
      vignette: 14,
    },
  },
  {
    id: "vintage-sage",
    name: "🌿 빈티지 세이지 무드",
    subtitle: "자연의 초록을 차분하고 고급스럽게 정돈한 감성",
    tag: "내추럴",
    previewColor: "from-emerald-400 via-teal-200 to-amber-100",
    config: {
      exposure: 6,
      contrast: -15,
      warmth: 10,
      tint: -3,
      highlights: 20,
      shadows: 32,
      bloom: 16,
      greenMute: 75,
      grain: 20,
      vignette: 20,
    },
  },
];
