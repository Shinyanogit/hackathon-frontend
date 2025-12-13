export type CategoryDefinition = {
  label: string;
  slug: string;
  children?: { label: string; slug: string }[];
};

export const categories: CategoryDefinition[] = [
  { label: "すべて", slug: "" },
  {
    label: "ファッション",
    slug: "fashion",
    children: [
      { label: "メンズ", slug: "fashion-men" },
      { label: "レディース", slug: "fashion-women" },
    ],
  },
  { label: "ベビー・キッズ", slug: "baby-kids" },
  { label: "ゲーム・おもちゃ・グッズ", slug: "gaming-goods" },
  { label: "ホビー・楽器・アート", slug: "art-crafts" },
  { label: "チケット", slug: "tickets" },
  { label: "本・雑誌・漫画", slug: "books-magazines-comics" },
  { label: "CD・DVD・ブルーレイ", slug: "cd-dvd-bluray" },
  { label: "スマホ・タブレット・パソコン", slug: "phones-tablets-pcs" },
  { label: "テレビ・オーディオ・カメラ", slug: "tv-audio-camera" },
  { label: "生活家電・空調", slug: "home-appliances" },
  { label: "スポーツ", slug: "sports" },
  { label: "アウトドア・釣り・旅行用品", slug: "outdoor-travel" },
  { label: "コスメ・美容", slug: "beauty-cosmetics" },
  { label: "ダイエット・健康", slug: "health-fitness" },
  { label: "食品・飲料・酒", slug: "food-drink" },
  { label: "キッチン・日用品・その他", slug: "kitchen-daily" },
  { label: "家具・インテリア", slug: "home-interior" },
  { label: "ペット用品", slug: "pets" },
  { label: "DIY・工具", slug: "diy-tools" },
  { label: "フラワー・ガーデニング", slug: "flower-gardening" },
  { label: "ハンドメイド・手芸", slug: "handmade-craft" },
  { label: "車・バイク・自転車", slug: "automotive" },
];
