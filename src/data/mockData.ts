// src/data/mockData.ts
import type { MovementLog, Product, User } from '../types';

export const initialProducts: Product[] = [
  { id: 1, name: "กล่องพัสดุ Size A", sku: "MWH-04-A-02-01", stock: 150 },
  { id: 2, name: "เทปกาวใส 2 นิ้ว", sku: "MWH-04-A-02-01", stock: 300 },
  { id: 3, name: "บับเบิ้ลกันกระแทก", sku: "MWH-04-A-03-01", stock: 20 },
];

//TODO จำลอง Location ที่จัดเก็บ (เช่น Rack, Zone)
export const locations: string[] = [
  "MWH-04-A-01-01",
  "MWH-04-A-02-01",
  "MWH-04-A-03-01",
  "MWH-04-B-01-01",
  "MWH-04-B-02-01",
  "MWH-04-B-03-01",
  "MWH-04-C-01-01",
  "MWH-04-C-02-01",
  "MWH-04-C-03-01",
  "MWH-04-D-01-01",
  "MWH-04-D-02-01",
  "MWH-04-D-03-01",
  "MWH-04-E-01-01",
  "MWH-04-E-02-01",
  "MWH-04-E-03-01"
];

// จำลองประวัติการทำรายการ
export const initialHistory: MovementLog[] = [
  {
    id: 1,
    type: "IN", // IN = นำเข้า, OUT = นำออก
    productId: 1,
    quantity: 50,
    location: "MWH-04-A-02-01",
    person: "สมชาย",
    timestamp: new Date().toISOString(),
  }
];

export const mockUsers: User[] = [
  { id: 1, username: 'admin', password: 'password', role: 'admin', name: 'แอดมิน' },
  { id: 2, username: 'emp', password: 'password', role: 'employee', name: 'พนักงาน' }
];
