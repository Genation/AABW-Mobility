import type { PostTripAuthor, PostTripPost } from "./types";

export const mockUsers: Record<string, PostTripAuthor> = {
  "nguyen-minh-tuan": {
    id: "nguyen-minh-tuan",
    name: "Nguyễn Minh Tuấn",
    avatar: "/trip-image-1.jpg",
    vehicle: "Honda CR-V 2024",
  },
  "tran-thi-huong": {
    id: "tran-thi-huong",
    name: "Trần Thị Hương",
    avatar: "/trip-image-4.jpg",
    vehicle: "Yamaha Exciter 155",
  },
  "le-van-hung": {
    id: "le-van-hung",
    name: "Lê Văn Hùng",
    avatar: "/trip-image-6.webp",
    vehicle: "Ford Ranger Wildtrak",
  },
};

export const mockPosts: PostTripPost[] = [
  {
    id: "post-1",
    author: mockUsers["nguyen-minh-tuan"],
    title: "Sài Gòn → Đà Lạt: Cung đèo huyền thoại",
    description:
      "Hành trình 320km vượt đèo Bảo Lộc đầy sương mù. Dừng chân ở Bảo Lộc thưởng thức trà, ghé Trạm dừng Madagui ngắm suối. Đà Lạt se lạnh, tuyệt vời!",
    route: {
      start: { name: "TP. Hồ Chí Minh", lat: 10.8231, lng: 106.6297 },
      end: { name: "Đà Lạt", lat: 11.9465, lng: 108.4419 },
      waypoints: [
        { name: "Trạm dừng Madagui", lat: 11.3855, lng: 107.7703 },
        { name: "Bảo Lộc", lat: 11.5346, lng: 107.8064 },
      ],
    },
    stats: {
      totalKm: 320,
      movingTime: "6h 30p",
      avgSpeed: 49,
      fuelUsed: 28,
      totalStops: 4,
    },
    stops: [
      {
        id: "s1-1",
        name: "Trạm dừng Madagui",
        lat: 11.3855,
        lng: 107.7703,
        arrivedAt: "08:30",
        duration: "45 phút",
        note: "Ăn sáng bánh mì, ngắm suối",
        photo: "/trip-image-3.jpg",
      },
      {
        id: "s1-2",
        name: "Đèo Bảo Lộc",
        lat: 11.5086,
        lng: 107.7474,
        arrivedAt: "10:15",
        duration: "20 phút",
        note: "Sương mù dày đặc, chụp ảnh check-in",
      },
      {
        id: "s1-3",
        name: "Quán cà phê Bảo Lộc",
        lat: 11.5346,
        lng: 107.8064,
        arrivedAt: "11:00",
        duration: "1h",
        note: "Thưởng thức trà B'Lao, mua đặc sản",
        photo: "/trip-image-2.jpg",
      },
      {
        id: "s1-4",
        name: "Cây xăng Di Linh",
        lat: 11.5809,
        lng: 108.0734,
        arrivedAt: "13:00",
        duration: "15 phút",
        note: "Đổ xăng, nghỉ ngơi",
      },
    ],
    photos: ["/trip-image-1.jpg", "/trip-image-2.jpg", "/trip-image-3.jpg"],
    coverPhoto: "/trip-image-1.jpg",
    tags: ["#phượt", "#đà_lạt", "#cung_đèo", "#weekend"],
    mood: "Phấn khích",
    socialCounts: { likes: 245, comments: 38, shares: 12 },
    publishedAt: "2026-07-28T14:30:00Z",
    tripDate: "25/07/2026",
  },
  {
    id: "post-2",
    author: mockUsers["tran-thi-huong"],
    title: "Hà Nội → Mộc Châu mùa hoa mận",
    description:
      "190km từ Hà Nội lên Mộc Châu giữa mùa hoa mận trắng. Dừng ở Mai Châu ăn cơm lam, ghé đồi chè trái tim sống ảo. Cao nguyên xanh mướt, không khí trong lành.",
    route: {
      start: { name: "Hà Nội", lat: 21.0278, lng: 105.8342 },
      end: { name: "Mộc Châu", lat: 20.8495, lng: 104.6432 },
      waypoints: [
        { name: "Mai Châu", lat: 20.6646, lng: 105.0887 },
        { name: "Đồi chè trái tim", lat: 20.7748, lng: 104.7237 },
      ],
    },
    stats: {
      totalKm: 190,
      movingTime: "4h 00p",
      avgSpeed: 47,
      fuelUsed: 6.5,
      totalStops: 3,
    },
    stops: [
      {
        id: "s2-1",
        name: "Mai Châu",
        lat: 20.6646,
        lng: 105.0887,
        arrivedAt: "09:00",
        duration: "1h 30p",
        note: "Ăn cơm lam, gà nướng, tham quan bản làng",
        photo: "/trip-image-5.jpeg",
      },
      {
        id: "s2-2",
        name: "Đồi chè trái tim",
        lat: 20.7748,
        lng: 104.7237,
        arrivedAt: "11:30",
        duration: "1h",
        note: "Chụp ảnh hoa mận, uống trà",
      },
      {
        id: "s2-3",
        name: "Thác Dải Yếm",
        lat: 20.8401,
        lng: 104.6405,
        arrivedAt: "13:30",
        duration: "45 phút",
        note: "Ngắm thác, chụp ảnh",
        photo: "/trip-image-4.jpg",
      },
    ],
    photos: ["/trip-image-4.jpg", "/trip-image-5.jpeg"],
    coverPhoto: "/trip-image-4.jpg",
    tags: ["#mộc_châu", "#hoa_mận", "#phượt_bắc", "#cuối_tuần"],
    mood: "Thư giãn",
    socialCounts: { likes: 189, comments: 24, shares: 8 },
    publishedAt: "2026-07-26T09:15:00Z",
    tripDate: "20/07/2026",
  },
  {
    id: "post-3",
    author: mockUsers["le-van-hung"],
    title: "Xuyên Việt: Hà Nội → Sài Gòn 14 ngày",
    description:
      "Hành trình để đời xuyên dọc Việt Nam. Qua 20 tỉnh thành, từ núi rừng Tây Bắc đến đồng bằng miền Tây. 1720km đầy kỷ niệm, gặp gỡ bao con người thú vị.",
    route: {
      start: { name: "Hà Nội", lat: 21.0278, lng: 105.8342 },
      end: { name: "TP. Hồ Chí Minh", lat: 10.8231, lng: 106.6297 },
      waypoints: [
        { name: "Ninh Bình", lat: 20.2493, lng: 105.9745 },
        { name: "Vinh", lat: 18.6796, lng: 105.6813 },
        { name: "Huế", lat: 16.4637, lng: 107.5909 },
        { name: "Đà Nẵng", lat: 16.0544, lng: 108.2022 },
        { name: "Nha Trang", lat: 12.2388, lng: 109.1967 },
      ],
    },
    stats: {
      totalKm: 1720,
      movingTime: "38h 00p",
      avgSpeed: 45,
      fuelUsed: 145,
      totalStops: 20,
    },
    stops: [
      {
        id: "s3-1",
        name: "Ninh Bình - Tam Cốc",
        lat: 20.2149,
        lng: 105.9359,
        arrivedAt: "10:00",
        duration: "3h",
        note: "Đi thuyền Tam Cốc, thăm Hang Múa",
        photo: "/trip-image-7.webp",
      },
      {
        id: "s3-2",
        name: "Huế - Đại Nội",
        lat: 16.4693,
        lng: 107.5777,
        arrivedAt: "08:00",
        duration: "4h",
        note: "Tham quan Đại Nội, ăn cơm hến, bún bò",
        photo: "/trip-image-8.png",
      },
      {
        id: "s3-3",
        name: "Đà Nẵng - Bà Nà Hills",
        lat: 16.0291,
        lng: 108.0308,
        arrivedAt: "09:00",
        duration: "5h",
        note: "Cáp treo Bà Nà, Cầu Vàng, chụp ảnh",
        photo: "/trip-image-6.webp",
      },
      {
        id: "s3-4",
        name: "Nha Trang - Vinpearl",
        lat: 12.2171,
        lng: 109.2035,
        arrivedAt: "10:00",
        duration: "6h",
        note: "Vui chơi Vinpearl Land, tắm biển",
      },
      {
        id: "s3-5",
        name: "Phan Thiết - Mũi Né",
        lat: 10.9342,
        lng: 108.2833,
        arrivedAt: "14:00",
        duration: "2h",
        note: "Đồi cát bay, suối Tiên",
      },
    ],
    photos: [
      "/trip-image-6.webp",
      "/trip-image-7.webp",
      "/trip-image-8.png",
    ],
    coverPhoto: "/trip-image-6.webp",
    tags: ["#xuyên_việt", "#roadtrip", "#việt_nam", "#khám_phá"],
    mood: "Khó quên",
    socialCounts: { likes: 523, comments: 87, shares: 45 },
    publishedAt: "2026-07-22T18:00:00Z",
    tripDate: "08-21/07/2026",
  },
  {
    id: "post-4",
    author: mockUsers["nguyen-minh-tuan"],
    title: "Đà Nẵng → Hội An: Cuối tuần chill",
    description:
      "30km từ Đà Nẵng ra Hội An phố cổ. Dừng Ngũ Hành Sơn khám phá động, ghé làng rau Trà Quế. Tối dạo phố lồng đèn, uống cao lầu. Bình yên đến lạ.",
    route: {
      start: { name: "Đà Nẵng", lat: 16.0544, lng: 108.2022 },
      end: { name: "Hội An", lat: 15.8801, lng: 108.338 },
      waypoints: [
        { name: "Ngũ Hành Sơn", lat: 16.0022, lng: 108.263 },
        { name: "Làng rau Trà Quế", lat: 15.8959, lng: 108.3258 },
      ],
    },
    stats: {
      totalKm: 30,
      movingTime: "45p",
      avgSpeed: 40,
      fuelUsed: 2.5,
      totalStops: 3,
    },
    stops: [
      {
        id: "s4-1",
        name: "Ngũ Hành Sơn",
        lat: 16.0022,
        lng: 108.263,
        arrivedAt: "08:00",
        duration: "2h",
        note: "Tham quan động Huyền Không, chùa Linh Ứng",
        photo: "/trip-image-2.jpg",
      },
      {
        id: "s4-2",
        name: "Làng rau Trà Quế",
        lat: 15.8959,
        lng: 108.3258,
        arrivedAt: "10:30",
        duration: "1h",
        note: "Tham quan vườn rau hữu cơ, uống nước é",
      },
      {
        id: "s4-3",
        name: "Phố cổ Hội An",
        lat: 15.8801,
        lng: 108.338,
        arrivedAt: "12:00",
        duration: "6h",
        note: "Ăn cao lầu, mì Quảng, dạo phố lồng đèn",
        photo: "/trip-image-3.jpg",
      },
    ],
    photos: ["/trip-image-2.jpg", "/trip-image-3.jpg"],
    coverPhoto: "/trip-image-2.jpg",
    tags: ["#hội_an", "#phố_cổ", "#ẩm_thực", "#cuối_tuần"],
    mood: "Bình yên",
    socialCounts: { likes: 156, comments: 19, shares: 5 },
    publishedAt: "2026-07-20T10:00:00Z",
    tripDate: "18/07/2026",
  },
  {
    id: "post-5",
    author: mockUsers["tran-thi-huong"],
    title: "Phan Thiết → Mũi Né: Đón bình minh trên đồi cát",
    description:
      "22km cung đường ven biển đẹp như tranh. Dậy sớm đón bình minh ở đồi cát Mũi Né, ghé Suối Tiên, tắm biển Hàm Tiến. Hải sản tươi ngon, giá bình dân.",
    route: {
      start: { name: "Phan Thiết", lat: 10.9333, lng: 108.1 },
      end: { name: "Mũi Né", lat: 10.9359, lng: 108.2867 },
      waypoints: [
        { name: "Đồi cát bay", lat: 10.9486, lng: 108.3163 },
        { name: "Suối Tiên", lat: 10.9512, lng: 108.2748 },
      ],
    },
    stats: {
      totalKm: 22,
      movingTime: "35p",
      avgSpeed: 38,
      fuelUsed: 1.8,
      totalStops: 3,
    },
    stops: [
      {
        id: "s5-1",
        name: "Đồi cát bay",
        lat: 10.9486,
        lng: 108.3163,
        arrivedAt: "05:30",
        duration: "2h",
        note: "Đón bình minh, trượt cát, chụp ảnh",
        photo: "/trip-image-5.jpeg",
      },
      {
        id: "s5-2",
        name: "Suối Tiên",
        lat: 10.9512,
        lng: 108.2748,
        arrivedAt: "08:00",
        duration: "1h 30p",
        note: "Dạo suối, ngắm thạch nhũ tự nhiên",
        photo: "/trip-image-7.webp",
      },
      {
        id: "s5-3",
        name: "Làng chài Mũi Né",
        lat: 10.9359,
        lng: 108.2867,
        arrivedAt: "10:00",
        duration: "2h",
        note: "Mua hải sản, ăn trưa",
      },
    ],
    photos: ["/trip-image-5.jpeg", "/trip-image-7.webp"],
    coverPhoto: "/trip-image-5.jpeg",
    tags: ["#mũi_né", "#biển", "#bình_minh", "#hải_sản"],
    mood: "Thư giãn",
    socialCounts: { likes: 198, comments: 31, shares: 10 },
    publishedAt: "2026-07-18T06:30:00Z",
    tripDate: "15/07/2026",
  },
  {
    id: "post-6",
    author: mockUsers["le-van-hung"],
    title: "Tây Bắc mùa lúa chín: Mù Cang Chải",
    description:
      "350km chinh phục Tây Bắc mùa lúa chín vàng rực. Qua đèo Khau Phạ hùng vĩ, ngắm ruộng bậc thang La Pán Tẩm, Tú Lệ. Đẹp đến nghẹt thở, xứng đáng từng km.",
    route: {
      start: { name: "Hà Nội", lat: 21.0278, lng: 105.8342 },
      end: { name: "Mù Cang Chải", lat: 21.8369, lng: 104.1466 },
      waypoints: [
        { name: "Nghĩa Lộ", lat: 21.6044, lng: 104.5083 },
        { name: "Đèo Khau Phạ", lat: 21.7318, lng: 104.5697 },
        { name: "Tú Lệ", lat: 21.7504, lng: 104.4435 },
      ],
    },
    stats: {
      totalKm: 350,
      movingTime: "8h 00p",
      avgSpeed: 44,
      fuelUsed: 30,
      totalStops: 5,
    },
    stops: [
      {
        id: "s6-1",
        name: "Nghĩa Lộ",
        lat: 21.6044,
        lng: 104.5083,
        arrivedAt: "10:00",
        duration: "1h",
        note: "Ăn xôi ngũ sắc, thăm bản Thái",
      },
      {
        id: "s6-2",
        name: "Đèo Khau Phạ",
        lat: 21.7318,
        lng: 104.5697,
        arrivedAt: "12:00",
        duration: "30p",
        note: "Ngắm toàn cảnh thung lũng, check-in",
        photo: "/trip-image-8.png",
      },
      {
        id: "s6-3",
        name: "Tú Lệ",
        lat: 21.7504,
        lng: 104.4435,
        arrivedAt: "13:00",
        duration: "1h 30p",
        note: "Ăn trưa cốm Tú Lệ, ngắm ruộng bậc thang",
        photo: "/trip-image-1.jpg",
      },
      {
        id: "s6-4",
        name: "La Pán Tẩm",
        lat: 21.789,
        lng: 104.1831,
        arrivedAt: "15:00",
        duration: "2h",
        note: "Trekking ruộng bậc thang, chụp ảnh hoàng hôn",
      },
      {
        id: "s6-5",
        name: "Mù Cang Chải",
        lat: 21.8369,
        lng: 104.1466,
        arrivedAt: "17:30",
        duration: "—",
        note: "Homestay bản người Mông, đốt lửa trại",
      },
    ],
    photos: ["/trip-image-8.png", "/trip-image-1.jpg"],
    coverPhoto: "/trip-image-8.png",
    tags: ["#tây_bắc", "#mùa_lúa_chín", "#offroad", "#mù_cang_chải"],
    mood: "Phấn khích",
    socialCounts: { likes: 312, comments: 56, shares: 28 },
    publishedAt: "2026-07-15T20:00:00Z",
    tripDate: "10-11/07/2026",
  },
];

export const allTags = [...new Set(mockPosts.flatMap((p) => p.tags))];

const COVER_POOL = [
  "/trip-image-1.jpg",
  "/trip-image-2.jpg",
  "/trip-image-3.jpg",
  "/trip-image-4.jpg",
  "/trip-image-5.jpeg",
  "/trip-image-6.webp",
  "/trip-image-7.webp",
  "/trip-image-8.png",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function generateInfiniteFeed(count: number = 60): PostTripPost[] {
  const posts: PostTripPost[] = [];

  for (let i = 0; i < count; i++) {
    const template = mockPosts[i % mockPosts.length];
    const variation = Math.floor(i / mockPosts.length);

    posts.push({
      ...template,
      id: `post-gen-${i}`,
      author: {
        ...template.author,
        id: `${template.author.id}-${i}`,
      },
      title: variation > 0
        ? `${template.title} (Phần ${variation + 1})`
        : template.title,
      coverPhoto: randomPick(COVER_POOL),
      photos: [randomPick(COVER_POOL), randomPick(COVER_POOL)],
      stats: {
        ...template.stats,
        totalKm: template.stats.totalKm + randomInt(-20, 30),
        totalStops: Math.max(2, template.stats.totalStops + randomInt(-1, 2)),
      },
      stops: template.stops.map((s, si) => ({
        ...s,
        id: `s-gen-${i}-${si}`,
      })),
      socialCounts: {
        likes: template.socialCounts.likes + randomInt(-50, 100),
        comments: template.socialCounts.comments + randomInt(-10, 20),
        shares: template.socialCounts.shares + randomInt(-5, 10),
      },
      publishedAt: daysAgo(randomInt(0, 30 * (variation + 1))),
      tripDate: template.tripDate,
    });
  }

  return posts;
}

export function convertTripPlanToPostForm(tripPlan: {
  name: string;
  startLocation: { name: string } | null;
  endLocation: { name: string } | null;
  tracks: unknown[];
}) {
  return {
    title: tripPlan.name,
    route: {
      start: { name: tripPlan.startLocation?.name ?? "", lat: 10.8231, lng: 106.6297 },
      end: { name: tripPlan.endLocation?.name ?? "", lat: 10.8231, lng: 106.6297 },
      waypoints: [] as { name: string; lat: number; lng: number }[],
    },
  };
}
