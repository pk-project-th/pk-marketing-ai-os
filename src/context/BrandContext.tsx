"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface BrandItem {
  id: string;
  name: string;
  shortName: string;
  category: "auto" | "shop" | "content" | "personal";
  categoryLabel: string;
  badge: string;
  goldenHour: string;
  bestFormat: string;
  defaultBrief: string;
}

export const ALL_BRANDS: BrandItem[] = [
  {
    id: "mazda-byd",
    name: "Mazda & BYD (ดีลเลอร์ & โปรโมชั่น)",
    shortName: "Mazda & BYD",
    category: "auto",
    categoryLabel: "ยานยนต์",
    badge: "ดีลเลอร์",
    goldenHour: "17:30 - 20:00 (พฤหัส-อาทิตย์)",
    bestFormat: "อัลบั้ม 4 รูป (ปกโปรโมชั่น + ภายนอก + ภายใน + ตารางผ่อน)",
    defaultBrief: "โปรโมชั่นออกรถ Mazda & BYD ประจำเดือน และเปรียบเทียบข้อดีความคุ้มค่ารถยนต์ไฟฟ้ายุคใหม่"
  },
  {
    id: "car-page",
    name: "เพจรถ (ความรู้เรื่องรถ & ข่าวสารยานยนต์)",
    shortName: "เพจสาระรถ",
    category: "auto",
    categoryLabel: "ยานยนต์",
    badge: "สาระรถ",
    goldenHour: "12:00 - 13:30 & 18:30 - 20:30",
    bestFormat: "Infographic / ภาพเดี่ยวชัดเจน + แคปชั่นบอกวิธีแก้ไข",
    defaultBrief: "เทคนิคการตรวจเช็กและดูแลรักษารถยนต์เบื้องต้นที่เจ้าของรถทุกคนควรรู้ พร้อมวิธีประหยัดน้ำมัน"
  },
  {
    id: "pp-fishing",
    name: "PP Fishing (ขายอุปกรณ์ตกปลา & ความรู้หน้าร้าน เชียงราย)",
    shortName: "PP Fishing",
    category: "shop",
    categoryLabel: "ร้านค้า",
    badge: "ตกปลา",
    goldenHour: "06:00 - 07:30 & 17:00 - 19:30",
    bestFormat: "อัลบั้ม 3-4 รูป (ภาพคัน/รอก + แอคชั่นหมายจริง + สเปก + รีวิวปลา)",
    defaultBrief: "แนะนำรอกและคันเบ็ดสำหรับตกปลาหมายธรรมชาติเชียงราย พร้อมเทคนิคเลือกเหยื่อปลอมตกปลาช่อน-ชะโด"
  },
  {
    id: "lanna-lab",
    name: "Lanna Lab Records (ค่ายเพลง & ดนตรีล้านนา)",
    shortName: "Lanna Lab",
    category: "shop",
    categoryLabel: "บันเทิง",
    badge: "ค่ายเพลง",
    goldenHour: "19:00 - 22:00",
    bestFormat: "วิดีโอคลิปสั้น / ภาพปกอัลบั้มบรรยากาศห้องอัดล้านนา",
    defaultBrief: "เบื้องหลังการทำเพลงดนตรีล้านนาร่วมสมัย แรงบันดาลใจจากวัฒนธรรมพื้นบ้านสู่บทเพลงฟังสบาย"
  },
  {
    id: "mr-must-have",
    name: "Mr. Must Have (นายหน้า / ป้ายยาของน่าใช้)",
    shortName: "Mr. Must Have",
    category: "shop",
    categoryLabel: "นายหน้า",
    badge: "นายหน้าป้ายยา",
    goldenHour: "11:30 - 13:00 & 19:30 - 22:00",
    bestFormat: "อัลบั้ม 4 รูป (ภาพ Before/After + ดีเทลใช้งาน + สรุปจุดเด่น + พิกัดตะกร้า)",
    defaultBrief: "ป้ายยา 5 ไอเทมของแต่งโต๊ะทำงานและของใช้ในบ้านที่คุ้มค่าเกินราคา มีแล้วชีวิตสะดวกขึ้น 300%"
  },
  {
    id: "amulets",
    name: "ขายพระเครื่อง (ลงขายพระของพ่อ / พระแท้)",
    shortName: "ขายพระของพ่อ",
    category: "shop",
    categoryLabel: "พระเครื่อง",
    badge: "พระแท้สายเซียน",
    goldenHour: "06:30 - 08:30 & 19:00 - 21:00",
    bestFormat: "อัลบั้ม 4 รูป (หน้าตรงคมชัด + ด้านหลังส่องยันต์ + ขอบข้าง + สรุปราคาบูชา)",
    defaultBrief: "เปิดกรุพระเครื่องสะสมยอดนิยม ชี้ตำหนิจุดสังเกตพระแท้ และประวัติความศักดิ์สิทธิ์ประจำบ้าน"
  },
  {
    id: "second-hand",
    name: "ขายของต่าง ๆ (ของมือสอง & ของไม่ใช้แล้ว)",
    shortName: "ขายของมือสอง",
    category: "shop",
    categoryLabel: "ของมือสอง",
    badge: "ส่งต่อของใช้",
    goldenHour: "12:00 - 14:00 & 18:00 - 21:00",
    bestFormat: "อัลบั้มรูปสภาพจริงรอบด้าน + รูปตำหนิชัดเจน + ราคาแบ่งปัน",
    defaultBrief: "ส่งต่อของใช้มือสองสภาพนางฟ้า ของสะสมและเครื่องใช้ในบ้าน ราคาแบ่งปัน นัดรับหรือส่งด่วนได้"
  },
  {
    id: "books",
    name: "หนังสือ (พัฒนาตนเอง & สรุปข้อคิดดี ๆ)",
    shortName: "สรุปหนังสือ",
    category: "content",
    categoryLabel: "ความรู้",
    badge: "พัฒนาตนเอง",
    goldenHour: "06:30 - 08:00 & 20:30 - 22:30",
    bestFormat: "อัลบั้ม 4-5 สไลด์ (สรุป 3 ข้อคิดเปลี่ยนชีวิต + Quote ประโยคทองคำ)",
    defaultBrief: "สรุป 3 ข้อคิดเปลี่ยนชีวิตจากหนังสือขายดีระดับโลก ที่ช่วยให้เริ่มลงมือทำและเอาชนะความขี้เกียจได้ทันที"
  },
  {
    id: "news",
    name: "ช่องข่าว (ประเด็นร้อน & อัปเดตกระแสประจำวัน)",
    shortName: "ข่าวสารทันกระแส",
    category: "content",
    categoryLabel: "ข่าวสาร",
    badge: "ข่าวไว",
    goldenHour: "07:00 - 08:30 & 12:00 - 13:00 & 17:30 - 19:00",
    bestFormat: "ภาพข่าวพาดหัวสั้นกระชับ สรุปใจความ 3 บรรทัด + แหล่งอ้างอิง",
    defaultBrief: "สรุปเหตุการณ์ข่าวด่วนและประเด็นร้อนประจำวันนี้ วิเคราะห์ผลกระทบที่คนทั่วไปต้องรู้แบบเข้าใจง่าย"
  },
  {
    id: "documentary",
    name: "สารคดี (เรื่องลึกลับ & วิทยาศาสตร์ & ประวัติศาสตร์)",
    shortName: "เรื่องเล่าสารคดี",
    category: "content",
    categoryLabel: "สารคดี",
    badge: "สารคดี",
    goldenHour: "19:30 - 22:30",
    bestFormat: "อัลบั้มเล่าเรื่อง (Story Slide) หรือคลิปเปิดหัวด้วยคำถามชวนสงสัย",
    defaultBrief: "เจาะลึกปริศนาประวัติศาสตร์และเรื่องราวลึกลับที่วิทยาศาสตร์กำลังหาคำตอบ พร้อมภาพบรรยากาศน่าติดตาม"
  },
  {
    id: "tales",
    name: "นิทาน (นิทานสอนใจ & เรื่องเล่าก่อนนอน)",
    shortName: "นิทานสอนใจ",
    category: "content",
    categoryLabel: "นิทาน",
    badge: "นิทาน",
    goldenHour: "20:00 - 22:00",
    bestFormat: "อัลบั้มภาพวาดนิทานอบอุ่น 4 ภาพ พร้อมข้อคิดสอนใจท้ายเรื่อง",
    defaultBrief: "นิทานสอนใจเรื่องสั้นพร้อมข้อคิดอบอุ่นใจ เหมาะสำหรับอ่านก่อนนอนหรือเล่าให้ครอบครัวฟัง"
  },
  {
    id: "cooking",
    name: "ทำอาหาร (สูตร & ขั้นตอนการทำอาหาร)",
    shortName: "ครัวทำอาหาร",
    category: "content",
    categoryLabel: "อาหาร",
    badge: "สูตรเด็ด",
    goldenHour: "11:00 - 12:30 & 16:30 - 18:30",
    bestFormat: "อัลบั้ม 4 รูป (ภาพจานสำเร็จ + วัตถุดิบ + ขั้นตอน + เคล็ดลับรสเด็ด)",
    defaultBrief: "แจกสูตรและเคล็ดลับทำเมนูโปรดให้อร่อยเข้มข้น รสชาติต้นตำรับฉบับโฮมเมด ทำตามได้ทันที"
  },
  {
    id: "football",
    name: "ฟุตบอล (ไฮไลท์ยิงประตู & กีฬา)",
    shortName: "ฟุตบอล & กีฬา",
    category: "content",
    categoryLabel: "กีฬา",
    badge: "คอบอล",
    goldenHour: "07:30 - 09:00 & 18:00 - 20:00",
    bestFormat: "ภาพกราฟิกสถิติ / สรุปประเด็นหลังเกม + แคปชั่นชวนถก",
    defaultBrief: "วิเคราะห์จังหวะยิงประตูสุดสวย และไฮไลต์แมตช์สำคัญประจำสัปดาห์ที่แฟนบอลตัวจริงต้องดู"
  },
  {
    id: "personal",
    name: "แอคเค้าท์ส่วนตัว (Lifestyle & คอนเทนต์ส่วนตัว)",
    shortName: "Lifestyle ส่วนตัว",
    category: "personal",
    categoryLabel: "ส่วนตัว",
    badge: "ส่วนตัว",
    goldenHour: "12:00 - 13:30 & 19:00 - 21:30",
    bestFormat: "ภาพถ่ายมุมมองชีวิตจริง แคปชั่นจริงใจเป็นกันเอง",
    defaultBrief: "บันทึกเรื่องราวชีวิตประจำวัน มุมมองความคิดดีๆ วันทำงาน และการเดินทางท่องเที่ยววันหยุด"
  }
];

interface BrandContextType {
  activeBrand: string; // "ALL" or brand name
  setActiveBrand: (brandName: string) => void;
  selectedBrandData: BrandItem | null;
  brands: BrandItem[];
  campaignName: string;
}

const BrandContext = createContext<BrandContextType>({
  activeBrand: "ALL",
  setActiveBrand: () => {},
  selectedBrandData: null,
  brands: ALL_BRANDS,
  campaignName: "September 2026",
});

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBrand, setActiveBrandState] = useState<string>("ALL");

  useEffect(() => {
    // Load from localStorage if present
    const saved = localStorage.getItem("pk_active_brand");
    if (saved) {
      setActiveBrandState(saved);
    }
  }, []);

  const setActiveBrand = (brandName: string) => {
    setActiveBrandState(brandName);
    localStorage.setItem("pk_active_brand", brandName);
  };

  const selectedBrandData = activeBrand === "ALL" 
    ? null 
    : ALL_BRANDS.find(b => b.name === activeBrand || b.shortName === activeBrand) || null;

  return (
    <BrandContext.Provider
      value={{
        activeBrand,
        setActiveBrand,
        selectedBrandData,
        brands: ALL_BRANDS,
        campaignName: "September 2026",
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);
