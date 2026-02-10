export type CityOption = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export const CITY_OPTIONS: CityOption[] = [
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125 },
  { name: "Chittagong", country: "Bangladesh", lat: 22.3569, lon: 91.7832 },
  { name: "Sylhet", country: "Bangladesh", lat: 24.8949, lon: 91.8687 },
  { name: "Khulna", country: "Bangladesh", lat: 22.8456, lon: 89.5403 },
  { name: "Rajshahi", country: "Bangladesh", lat: 24.3636, lon: 88.6241 },
  { name: "Rangpur", country: "Bangladesh", lat: 25.7439, lon: 89.2752 },
  { name: "Barishal", country: "Bangladesh", lat: 22.7010, lon: 90.3535 }
];
