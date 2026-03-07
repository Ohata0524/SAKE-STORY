export interface Sake {
  id: number;           // string から number に統一
  name: string;
  brewery: string;
  prefecture: string | null;
  taste: string | null;
  description: string | null;
  image_url: string | null;
  price: number | null;
  rec_cold: string | null;
  rec_room: string | null;
  rec_hot: string | null;
  pairing_name: string | null;
  pairing_type: string | null;
  official_url: string | null;
  created_at?: string;
}

