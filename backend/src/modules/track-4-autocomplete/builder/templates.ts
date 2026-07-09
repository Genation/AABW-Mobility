const ATTR_MAP: Record<string, string[]> = {
  'hoc': ['phù hợp học tập', 'có thể học bài'],
  'hoc bai': ['phù hợp học tập'],
  'hoc tap': ['phù hợp học tập'],
  'wifi': ['có Wi-Fi', 'có WiFi'],
  '24': ['mở cửa 24/7'],
  '24h': ['mở cửa 24/7'],
  '24/7': ['mở cửa 24/7'],
  'tre em': ['phù hợp cho trẻ em'],
  'yen tinh': ['yên tĩnh'],
  'lam viec': ['làm việc', 'có Wi-Fi'],
  'khu': ['mở cửa khuya'],
  'khuya': ['mở cửa khuya'],
  'song ao': ['đẹp để check-in'],
  'dep song ao': ['đẹp để check-in'],
  'dep': ['đẹp'],
  'ngon': ['ngon'],
  'check': ['địa điểm check-in đẹp'],
  'check in': ['địa điểm check-in đẹp'],
  'tren duong': ['trên đường đi'],
  'gan day': ['gần đây'],
  'gan nhat': ['gần nhất'],
  'mo cua khuya': ['mở cửa khuya'],
};

const CAT_MAP: Record<string, string[]> = {
  'cafe': ['Quán cà phê', 'Cà phê'],
  'ca phe': ['Quán cà phê', 'Cà phê'],
  'quan cafe': ['Quán cà phê'],
  'quan an': ['Quán ăn', 'Nhà hàng'],
  'quan': ['Quán'],
  'nha hang': ['Nhà hàng'],
  'an': ['Quán ăn'],
  'phong gym': ['Phòng gym'],
  'gym': ['Phòng gym', 'Phòng tập gym'],
  'khach san': ['Khách sạn'],
  'hotel': ['Khách sạn'],
  'tra sua': ['Trà sữa'],
  'rooftop': ['Rooftop', 'Quán bar rooftop'],
  'spa': ['Spa'],
  'sieu thi': ['Siêu thị'],
  'cay xang': ['Cây xăng'],
  'tram xang': ['Trạm xăng'],
  'benh vien': ['Bệnh viện'],
  'atm': ['ATM'],
  'gan': ['Gần'],
  'ho guom': ['Hồ Gươm'],
  'quan nuong': ['Quán nướng'],
  'quan cafe hoc': ['Quán cà phê phù hợp học tập'],
};

export function generateSuggestions(
  category?: string,
  attribute?: string,
  location?: string,
): string[] {
  const results: string[] = [];

  const cats = category ? (CAT_MAP[category.toLowerCase()] || [category]) : [];
  const attrs = attribute ? (ATTR_MAP[attribute.toLowerCase()] || [attribute]) : [];

  for (const cat of cats) {
    for (const attr of attrs) {
      results.push(`${cat} ${attr}`);
    }
  }
  for (const cat of cats) {
    results.push(`${cat} gần đây`);
    if (location) results.push(`${cat} ${location}`);
  }

  if (location && cats.length) {
    results.push(...cats.map(c => `${location} ${c}`));
  }

  return [...new Set(results)];
}

export function generateBrandSuggestions(brand: string): string[] {
  return [
    `${brand} gần đây`,
    `${brand} gần nhất`,
    brand,
  ];
}

export function generateNavigationSuggestions(target: string): string[] {
  return [
    `Chỉ đường đến ${target}`,
    `Đường đến ${target}`,
  ];
}

export function generateAddressSuggestion(street: string, district: string, city: string): string {
  return `${street}, ${district}, ${city}`;
}
