import {
  cleanCaptionText,
  extractCleanSpokenScript,
  safeThaiTruncate,
  extractCleanTopic
} from "@/lib/caption-helper";
import { callGemini } from "./gemini";
import { callChatGPT } from "./chatgpt";
import { callGroq } from "./groq";
import { ContentIdea, MediaBlueprint, MusicPromptData } from "@/types";
import { db } from "@/lib/db";
import { buildDefaultMediaBlueprint } from "@/lib/media-blueprint-helper";

export { buildDefaultMediaBlueprint };

export interface FailoverMeta {
  isFailover: boolean;
  failoverReason?: string;
  providerUsed?: string;
  modelUsed?: string;
}

let lastFailoverMeta: FailoverMeta = {
  isFailover: false
};

export function getLastFailoverMeta(): FailoverMeta {
  return lastFailoverMeta;
}

export interface IdeaGenerationInput {
  briefText?: string;
  brief?: string;
  brand?: string;
  brand_name?: string;
  product?: string;
  campaign?: string;
  target_audience?: string;
  objective?: string;
  platform?: string;
  content_pillar?: string;
  tone?: string;
  topic?: string;
  count?: number;
  aiEngine?: "groq" | "chatgpt" | "gemini";
  preferredMediaType?: "ALL" | "IMAGE" | "VIDEO";
  imageCountMode?: "auto" | "1" | "2" | "3" | "4" | "carousel";
  videoLayoutMode?: string;
  is_series?: boolean;
  series_topic?: string;
  customPrompt?: string;
}

export function getDomainExpertPersona(brandName: string, briefText: string, isVideo: boolean = false) {
  const text = (brandName + " " + briefText).toLowerCase();

  const isTemple =
    text.includes("วัด") ||
    text.includes("ทำบุญ") ||
    text.includes("ไหว้พระ") ||
    text.includes("สายมู") ||
    text.includes("พระธาตุ") ||
    text.includes("พุทธ") ||
    text.includes("ธรรมะ") ||
    text.includes("วิหาร") ||
    text.includes("โบราณสถาน");

  if (isTemple) {
    return {
      persona: "ครีเอเตอร์สายท่องเที่ยวเชิงวัฒนธรรม วัดวาอาราม & สายมูท้องถิ่น (Temple & Cultural Explorer)",
      voiceTone: "อบอุ่น สงบ เล่าเรื่องสนุกเหมือนเพื่อนพาไหว้พระฮีลใจและชมศิลปะล้านนาแท้ แนะนำจุดขอพรที่ถูกต้อง เคล็ดลับการเดินทาง และมุมสงบที่คนส่วนใหญ่ไม่รู้ ใช้ภาษาพูดเป็นธรรมชาติ 100% ไร้กลิ่นอาย AI",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 เปิดด้วย Hook สะกดใจ พาหลีกหนีความวุ่นวาย เล่าจุดเด่นของวัด บรรยากาศสงบ และเคล็ดลับการไหว้พระขอพร"
        : "ต้องระบุชื่อวัดจริงและจุดสำคัญชัดเจน เช่น 'วัดที่ 1: วัดอุโมงค์ สวนพุทธธรรม ลอดอุโมงค์โบราณ 700 ปี...', 'วัดที่ 2: วัดผาลาด วัดลับกลางป่าริมลำธารน้ำตก...', 'วัดที่ 3: วัดพระสิงห์ วิหารลายคำ พระพุทธสิหิงค์...'",
      recommendedCount: 4,
      recommendedFormat: isVideo
        ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (Reels/TikTok/Shorts)"
        : "อัลบั้ม 4 รูป (ภาพปกซุ้มประตู/เจดีย์, บรรยากาศสงบวัดที่ 1, สถาปัตยกรรมล้านนาวัดที่ 2, จุดขอพรศักดิ์สิทธิ์วัดที่ 3)"
    };
  }

  const isGraduation =
    text.includes("รับปริญญา") ||
    text.includes("ชุดครุย") ||
    text.includes("บัณฑิต");

  if (isGraduation) {
    return {
      persona: "ช่างภาพสายพอร์ตเทรต & คอนเทนต์ครีเอเตอร์รับปริญญานอกรอบมือโปร",
      voiceTone: "สดใส อบอุ่น เป็นกันเอง ให้ทริคโพสท่า มุมกล้อง การจับจังหวะกับตากล้องหรือเพื่อน และคุมโทนรูปให้ออกมาเป็นธรรมชาติที่สุด",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 เปิดด้วย Hook แก้ปัญหาท่าโพสหรือแจกพิกัดถ่ายรูปชุดครุย เล่าทริคถ่ายจริงอย่างลื่นไหล"
        : "ระบุพิกัดและทริคโพสท่าชัดเจน เช่น การเดินแคนดิด แสงช่วงบ่าย 4 โมงเย็น",
      recommendedCount: 4,
      recommendedFormat: isVideo
        ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (ทริคถ่ายรูปรับปริญญา)"
        : "อัลบั้ม 4 รูป (ภาพเปิดมุมกว้าง, ช็อตแคนดิดเดินคุย, โคลสอัพดีเทลชุดครุย/ดอกไม้, ช็อตจบอบอุ่น)"
    };
  }
  
  if (
    text.includes("เชียงใหม่") ||
    text.includes("คาเฟ่") ||
    text.includes("cafe") ||
    text.includes("ท่องเที่ยว") ||
    text.includes("เที่ยว") ||
    text.includes("พิกัด") ||
    text.includes("ถ่ายรูป") ||
    text.includes("เช็คอิน") ||
    text.includes("travel") ||
    text.includes("โรงแรม") ||
    text.includes("ที่พัก") ||
    text.includes("ร้านกาแฟ")
  ) {
    return {
      persona: "Travel Influencer & ช่างภาพสายคอนเทนต์ท่องเที่ยวระดับมืออาชีพ (Local Insider & Explorer)",
      voiceTone: "มีสไตล์ รู้จริง พูดคุยเป็นกันเองเหมือนเพื่อนสนิทบอกพิกัดลับ แนะนำมุมถ่ายรูปซิกเนเจอร์ที่ไม่เหมือนใคร คุมโทนภาพ แนะนำจุดเช็คอิน และแสงช่วงเวลาที่ถ่ายแล้วสวยเป๊ะ ใช้ภาษาพูดสไตล์ครีเอเตอร์ตัวจริง",
      visualRule: isVideo 
        ? "ต้องเป็นบทพูดคลิปวิดีโอ 9:16 ที่พูดเปิดด้วย Hook สะกดคนดู เล่าพิกัดและทริคจริงอย่างลื่นไหล ไม่ใช้คำทางการ"
        : "ต้องระบุชื่อสถานที่จริงและมุมถ่ายรูปเจาะจงให้เห็นชัดในแคปชั่น เช่น โลเคชันไฮไลต์ แสงช่วงเวลาแนะนำ และทริคการถ่ายรูปจริง",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (Reels/TikTok/Shorts)" : "อัลบั้ม 4 รูป (ภาพปกคุมโทนสวยงาม, จุดเช็คอินที่ 1, จุดเช็คอินที่ 2, จุดเช็คอินที่ 3 พร้อมเทคนิคตั้งกล้อง)"
    };
  }

  if (text.includes("พระเครื่อง") || text.includes("พระของพ่อ") || text.includes("พระแท้") || text.includes("สมเด็จ") || text.includes("เครื่องราง")) {
    return {
      persona: "เซียนพระสายอนุรักษ์ & นักสะสมพระเครื่องแท้สากล (สไตล์ 'ขายพระของพ่อ')",
      voiceTone: "สุขุม น่าเลื่อมใส ให้ความรู้ลึกซึ้ง พูดถึงพิมพ์ทรง มวลสาร คราบกรุ รอยตัดขอบ การส่องกล้อง และความแท้เป็นธรรมชาติ ไม่พูดกว้างๆ ลอยๆ แต่ชี้ให้เห็นจุดสังเกตจริง",
      visualRule: isVideo
        ? "บทพูดวิดีโอคลิป 9:16 ส่องกล้องขยาย 10x-20x ชี้จุดตายพิมพ์ทรงและมวลสารแท้ธรรมชาติ"
        : "แคปชั่นต้องชี้ชวนมองภาพในโพสต์โดยตรง เช่น 'ส่ององค์พระในภาพแรก...', 'ซูมดูมวลสารและรอยจารึกในภาพที่ 2...', 'พลิกชมด้านหลังและความแห้งธรรมชาติในภาพที่ 3...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 ส่องกล้องเจาะลึก" : "อัลบั้มภาพ 4 รูป (หน้าตรง 1:1, ด้านหลัง 1:1, ซูมมวลสาร/ขอบข้าง 1:1, ตลับ/สรุปราคา 1:1)"
    };
  }

  if (text.includes("mazda") || text.includes("byd") || text.includes("ดีลเลอร์") || text.includes("รถ") || text.includes("ยานยนต์") || text.includes("ev")) {
    return {
      persona: "กูรูยานยนต์ & ที่ปรึกษาการขับขี่รถยนต์ไฟฟ้าและดีลเลอร์ผู้เชี่ยวชาญ",
      voiceTone: "มืออาชีพ มั่นใจ ทันสมัย อธิบายฟีลลิ่งการขับขี่ แรงบิด อัตราเร่ง ระบบความปลอดภัย ระยะทางต่อการชาร์จ และแคมเปญดาวน์-ผ่อนที่คุ้มที่สุด",
      visualRule: isVideo
        ? "บทพูดวิดีโอคลิป 9:16 พรีวิวสมรรถนะจริงขณะขับขี่และฟังก์ชันค็อกพิทล้ำสมัย"
        : "แคปชั่นต้องเชื่อมโยงกับรูปภาพรถ เช่น 'มองเส้นสายดีไซน์สปอร์ตในรูปแรก...', 'ค็อกพิทและฟังก์ชันล้ำสมัยในภาพถัดไป...', 'ตารางแคมเปญออกรถในภาพสุดท้าย...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (พรีวิวสมรรถนะ & ดีไซน์)" : "อัลบั้ม 4 รูป (ภาพรวมหน้ารถ, ภายในค็อกพิท, ดีเทลแม็กซ์/ไฟหน้า, ตารางโปรโมชั่น)"
    };
  }

  if (text.includes("fishing") || text.includes("ตกปลา") || text.includes("รอก") || text.includes("คันเบ็ด") || text.includes("เหยื่อ")) {
    return {
      persona: "ไต๋ตกปลามือโปร & ผู้เชี่ยวชาญอุปกรณ์ตกปลาหน้าร้านเชียงราย (PP Fishing)",
      voiceTone: "เป็นกันเอง สไตล์พี่น้องนักตกปลา มีประสบการณ์หมายธรรมชาติแม่น้ำกก เขื่อน และบ่อตกปลา พูดถึงบาลานซ์คัน แอ็กชันเหยื่อ การงัดปลาช่อน-ชะโดไม่ให้หลุด",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 สาธิตแอ็กชันคันเบ็ดและลีลาการกรอรอกจับปลาหมายธรรมชาติ"
        : "แคปชั่นต้องชี้ชวนดูคัน/รอก/เหยื่อในภาพ เช่น 'สังเกตบาลานซ์คันและความเนียนของสปูลในภาพแรก...', 'องศาแอ็กชันตอนดัดคันในภาพที่ 2...'",
      recommendedCount: 3,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (แอ็กชันอุปกรณ์ตกปลา)" : "อัลบั้ม 3-4 รูป (อุปกรณ์หลัก, จุดเด่นสปูล/ไกด์, แอ็กชันใช้งานจริง)"
    };
  }

  if (text.includes("mr. must have") || text.includes("must have") || text.includes("ป้ายยา") || text.includes("นายหน้า")) {
    return {
      persona: "คิวเรเตอร์สายป้ายยา & นักทดลองของใช้จริง (Mr. Must Have)",
      voiceTone: "กวนๆ สนุก ช่างสังเกต เปิดด้วย Pain Point ในชีวิตประจำวัน รีวิวข้อดี-ข้อจำกัดแบบจริงใจ ทำไมถึงเป็นของที่ต้องมีติดบ้าน",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 แกะกล่องทดลองใช้งานจริง ฟาดด้วยผลลัพธ์ Before vs After"
        : "แคปชั่นต้องชี้ฟังก์ชันที่เห็นในรูป เช่น 'ดูขนาดจริงเทียบกับโต๊ะทำงานในรูปนี้...', 'ฟังก์ชันปุ่มกดที่ทำให้ชีวิตง่ายขึ้นในภาพที่ 2...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (รีวิวทดลองใช้จริง)" : "อัลบั้ม 4 รูป (ภาพเปิดปัญหา, ภาพแกดเจ็ตจริง, ภาพตอนใช้งานจริง, ภาพสรุปความคุ้มค่า)"
    };
  }

  if (text.includes("lanna") || text.includes("เพลง") || text.includes("ดนตรี") || text.includes("ค่ายเพลง")) {
    return {
      persona: "มิวสิคโปรดิวเซอร์ & ครีเอทีฟดนตรีล้านนาร่วมสมัย (Lanna Lab Records)",
      voiceTone: "ละเมียดละไม มีอารมณ์ศิลปิน ลึกซึ้ง เล่าเรื่องราวเบื้องหลังเสียงสะล้อซอซึงที่ผสมผสานกับโมเดิร์นบีท",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 ถ่ายทอดเบื้องหลังการสร้างสรรค์เมโลดี้และแรงบันดาลใจ"
        : "แคปชั่นต้องสื่ออารมณ์ภาพ เช่น 'ภาพบรรยากาศในห้องอัด...', 'สัมผัสความอบอุ่นผ่านท่วงทำนองในคลิปนี้...'",
      recommendedCount: 3,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 พร้อมซาวด์เดโม" : "ภาพคัฟเวอร์อาร์ต 1:1 พร้อมข้อความเนื้อเพลง"
    };
  }

  if (text.includes("หนังสือ") || text.includes("atomic habits") || text.includes("คำคม") || text.includes("พัฒนาตนเอง")) {
    return {
      persona: "นักสรุปหนังสือ & ผู้เชี่ยวชาญจิตวิทยาพัฒนาตนเองระดับสากล",
      voiceTone: "เฉียบคม สร้างแรงบันดาลใจ สรุปประเด็นซับซ้อนให้เข้าใจง่ายและนำไปลงมือทำได้ทันที",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 สรุปกฎทองหรือเทคนิคเปลี่ยนชีวิตภายใน 30 วินาที"
        : "แคปชั่นต้องชี้ชวนดูสรุปการ์ดความรู้ทีละภาพ เช่น 'ดูการ์ดสรุปกฎข้อที่ 1 ในรูปแรก...', 'บันทึกภาพการ์ดชุดนี้ไว้อ่านทบทวน...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (สรุปไวรัล 30 วิ)" : "อัลบั้มการ์ดความรู้ 4-5 รูป (หน้าปกสรุป, บทเรียนหลัก 3 ข้อ, บทสรุป Action Plan)"
    };
  }

  if (text.includes("อาหาร") || text.includes("ทำอาหาร") || text.includes("สูตร")) {
    return {
      persona: "เชฟผู้เชี่ยวชาญอาหารต้นตำรับ & ผู้สอนทำอาหารสไตล์โฮมเมด",
      voiceTone: "อบอุ่น ชวนหิว ละเอียด ชี้เคล็ดลับและเทคนิคกระทะที่คนทั่วไปมักพลาด",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 เสิร์ฟเทคนิคกระทะไฟแรงและเสียงฉ่าชวนน้ำลายสอ"
        : "แคปชั่นต้องชี้ชวนดูหน้าตาอาหาร 'ดูความฉ่ำของเนื้อในภาพแรก...', 'ขั้นตอนการคลุกเคล้าในภาพที่ 2...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (สูตรลัดทำอาหารชวนหิว)" : "อัลบั้มสเต็ป 4 รูป (ภาพสำเร็จชวนหิว, วัตถุดิบ, ขั้นตอนสำคัญ, จานพร้อมเสิร์ฟ)"
    };
  }

  if (text.includes("ฟุตบอล") || text.includes("ไฮไลท์") || text.includes("ยิงประตู")) {
    return {
      persona: "กูรูวิเคราะห์ฟุตบอล & นักพากย์ไฮไลต์กีฬา",
      voiceTone: "ดุเดือด เร้าใจ มีข้อมูลสถิติ เจาะลึกแท็กติกและจังหวะตัดสินเกม",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 พากย์จังหวะยิงประตูและวิเคราะห์แท็กติกเกมสุดเดือด"
        : "แคปชั่นต้องชี้นำช็อตการยิง 'ดูมุมยิงลูกนี้ในภาพ...', 'จังหวะวิ่งตัดแนวรับในภาพที่ 2...'",
      recommendedCount: 3,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (ไฮไลต์ช็อตตัดสินเกม)" : "ภาพ Snapshot 16:9 พร้อมกราฟิกสถิติ"
    };
  }

  if (text.includes("สารคดี") || text.includes("ประวัติศาสตร์") || text.includes("สัตว์")) {
    return {
      persona: "นักสำรวจประวัติศาสตร์ & ผู้บรรยายสารคดีระดับโลก",
      voiceTone: "น่าค้นหา มีมนต์ขลัง ถ่ายทอดความลึกลับและข้อเท็จจริงชวนทึ่ง",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 เล่าปริศนาลึกลับและข้อเท็จจริงชวนขนลุก"
        : "แคปชั่นต้องอิงภาพ 'มองโบราณสถานในภาพนี้...', 'สังเกตพฤติกรรมสัตว์ในภาพถ่ายมุมพิเศษ...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (สารคดีเรื่องเล่าลึกลับ)" : "อัลบั้มภาพสารคดี 4 รูป"
    };
  }

  if (text.includes("นิทาน")) {
    return {
      persona: "นักเล่านิทานสร้างสรรค์ & ผู้เชี่ยวชาญเสริมสร้างจินตนาการเด็ก",
      voiceTone: "นุ่มนวล อบอุ่น มีคำสอนแทรกอย่างแนบเนียน ชวนพ่อแม่และเด็กร่วมคิด",
      visualRule: isVideo
        ? "บทพูดคลิป 9:16 เล่านิทานด้วยน้ำเสียงอบอุ่นและทิ้งท้ายข้อคิดสอนใจ"
        : "แคปชั่นชวนมองภาพวาดนิทาน 'ดูภาพเจ้ากระต่ายน้อย...', 'เปิดภาพถัดไปเพื่อดูจุดจบของเรื่อง...'",
      recommendedCount: 4,
      recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (นิทานภาพเคลื่อนไหว)" : "อัลบั้มภาพการ์ตูนนิทาน 4 รูป (ภาพเปิดตัวละคร, เกิดปัญหา, ร่วมมือแก้ไข, สรุปบทเรียน)"
    };
  }

  // Default Expert Persona
  return {
    persona: "ที่ปรึกษาการตลาด & คอนเทนต์ครีเอเตอร์มืออาชีพเฉพาะด้าน",
    voiceTone: "เชี่ยวชาญ เป็นมิตร น่าเชื่อถือ สรุปประเด็นชัดเจนและกระตุ้นการมีส่วนร่วม",
    visualRule: isVideo ? "บทพูดคลิป 9:16 เปิดด้วย Hook ดึงดูดและสรุปประเด็นกระชับ" : "แคปชั่นต้องชี้ชวนมองภาพในโพสต์โดยตรง",
    recommendedCount: 3,
    recommendedFormat: isVideo ? "วิดีโอคลิปสั้นแนวตั้ง 9:16 (Story & Spoken Video)" : "อัลบั้ม 3-4 รูป หรือภาพเดี่ยวพร้อมกราฟิกข้อความ"
  };
}

export function buildMusicPrompt(title: string, brandName: string, brief: string = ""): MusicPromptData {
  const cleanTitle = title.replace(/^\[EP\.\s*\d+\]\s*/i, "").replace(/#/g, "").trim();
  const hasUserLyrics = brief && (brief.includes("\n") || brief.includes("[") || brief.includes("ท่อน") || brief.includes("ร้องว่า") || brief.length > 50);
  const userLyricsStructure = hasUserLyrics ? brief.trim() : "";

  const isTempleTopic = 
    title.includes("วัด") || 
    brief.includes("วัด") || 
    title.includes("ไหว้พระ") || 
    brief.includes("ไหว้พระ") || 
    title.includes("ทำบุญ") || 
    brief.includes("ทำบุญ") || 
    title.includes("สายมู") || 
    brief.includes("สายมู");

  if (isTempleTopic) {
    const songTitle = `${safeThaiTruncate(cleanTitle, 30)} (Peaceful Temple BGM)`;
    return {
      song_title: songTitle,
      genre_style: "Peaceful Meditation Acoustic, Lanna Bamboo Flute & Seung, Ambient Mountain Wind Chimes, Serene Folk",
      instruments: "Khlui (ขลุ่ยผิวไม้ไผ่), Seung (ซึงไม้สัก), Temple Wind Chimes (ระฆังลม), Soft Acoustic Guitar, Flowing Stream Nature Ambient",
      lyrics_structure: userLyricsStructure || `[Intro: เสียงระฆังลมกังวานแผ่วเบา คลอเสียงสายน้ำไหลและขลุ่ยผิวไม้ไผ่]
[Melody: ท่วงทำนองซึงล้านนานุ่มละมุน ผ่อนคลาย สร้างความสงบและสมาธิ]
[Refrain: สายลมพัดผ่านแมกไม้ เสียงกระดิ่งใต้วิหาร สะท้อนความร่มเย็นในจิตใจ]
[Outro: เสียงดนตรีค่อยๆ จางลง ทิ้งไว้เพียงความสงบงามและพลังบวก]`,
      full_prompt: `Peaceful Lanna traditional acoustic instrumental, serene meditation Thai bamboo flute Khlui and teakwood Seung plucking, gentle temple wind chimes, soft acoustic guitar chords, relaxing atmospheric mountain nature sounds, peaceful mindful temple ambience, crystal clear studio recording, 68 BPM.`
    };
  }

  const isFoodTopic =
    title.includes("อาหาร") ||
    brief.includes("อาหาร") ||
    title.includes("ทำอาหาร") ||
    brief.includes("ทำอาหาร") ||
    title.includes("สูตร") ||
    brief.includes("สูตร") ||
    title.includes("เมนู") ||
    brief.includes("เมนู");

  if (isFoodTopic) {
    const songTitle = `${safeThaiTruncate(cleanTitle, 30)} (Kitchen Chill BGM)`;
    return {
      song_title: songTitle,
      genre_style: "Cozy Acoustic Folk Pop, Cheerful Upbeat Kitchen BGM, Wholesome Lo-Fi Chill Hop",
      instruments: "Acoustic Nylon Guitar, Bright Ukulele Strum, Warm Upright Bass, Playful Glockenspiel, Gentle Shaker Rhythms",
      lyrics_structure: userLyricsStructure || `[Intro: ท่วงทำนองกีตาร์โปร่งและอูคูเลเล่สดใส อบอุ่น ฟีลเข้าครัวทำอาหารยามเช้า]
[Melody: จังหวะโยกตัวเบาๆ ชวนให้รู้สึกเพลิดเพลินและผ่อนคลายกับทุกขั้นตอนการทำอาหาร]
[Refrain: เสียงเครื่องเคาะจังหวะสนุกสนาน เสริมความน่าทานและความสุขในมื้อพิเศษ]
[Outro: ทำนองดนตรีอบอุ่นค่อยๆ คลายลง พอดีกับช่วงจัดจานเสิร์ฟความอร่อย]`,
      full_prompt: `Warm cheerful upbeat acoustic folk instrumental, uplifting acoustic guitar plucking, joyful subtle ukulele and glockenspiel accents, relaxing lo-fi percussion, cozy kitchen cooking vlog background music, crystal clear studio mix, 105 BPM.`
    };
  }

  const isLannaOrMusic = 
    brandName.toLowerCase().includes("lanna") || 
    brandName.includes("เพลง") || 
    brandName.includes("ดนตรี") || 
    brief.includes("เพลง") || 
    brief.includes("ดนตรี") || 
    brief.includes("ท่อน") || 
    brief.includes("เนื้อเพลง") || 
    brief.toLowerCase().includes("lanna");

  if (isLannaOrMusic) {
    const songTitle = `${safeThaiTruncate(cleanTitle, 30)} (Lanna Chill)`;
    return {
      song_title: songTitle,
      genre_style: "Lanna Contemporary Folk, Chill Lo-Fi Beats, Acoustic Northern Thai, Ambient Instrumental",
      instruments: "Salo (สะล้อ 2 สาย), Seung (ซึงไม้สัก), Khlui (ขลุ่ยผิวไม้ไผ่), Acoustic Nylon Guitar, Lo-Fi Warm Vinyl Beats, Sub Bass 808",
      lyrics_structure: userLyricsStructure || `[Intro: ท่วงทำนองขลุ่ยผิวและซึงบรรเลงแผ่วเบา คลอเสียงธรรมชาติยามเช้า]
[Verse 1: สายลมพัดผ่านขุนเขา แดดอุ่นทอดเงาบนผืนเวียง เสียงสะล้อลอยล่องตามสายหมอก]
[Chorus: เสน่ห์แห่งล้านนาที่ตราตรึง ดนตรีขับกล่อมดวงใจให้สงบงาม ท่วงทำนองแห่งความหวังและศรัทธา]
[Verse 2: จังหวะ Lo-Fi นุ่มละมุน ผสานเสียงซึงสอดประสาน สัมผัสความอบอุ่นของบ้านเกิด]
[Bridge: ขลุ่ยและสะล้อประชันทำนองหวานซึ้ง กังวานไพเราะจับใจ]
[Outro: ทำนองดนตรีค่อยๆ คลายลง ทิ้งไว้เพียงเสียงธรรมชาติอันสงบงาม]`,
      full_prompt: `Lanna contemporary folk fusion lo-fi instrumental, relaxing Northern Thai traditional acoustic instruments featuring Salo, Seung, and Khlui bamboo flute melody, warm acoustic guitar plucking, subtle lo-fi vinyl warmth, smooth chill hop beats, peaceful atmospheric mountain vibe, high fidelity studio production, 82 BPM.`
    };
  }

  const songTitle = `${safeThaiTruncate(cleanTitle, 30)} (Viral BGM)`;
  return {
    song_title: songTitle,
    genre_style: "Modern Upbeat Commercial BGM, Energetic Indie Pop Lo-Fi, Motivational Cinematic Acoustic",
    instruments: "Catchy Acoustic Guitar Pluck, Bright Inspiring Piano, Warm Synth Bass, Crisp Drums, Rhythmic Hand Claps",
    lyrics_structure: userLyricsStructure || `[Intro: ท่วงทำนองกีตาร์โปร่งริทึ่มดึงดูดความสนใจใน 3 วินาทีแรก]
[Build-up: เพิ่มจังหวะกลองและเปียโนสว่างสดใส สร้างพลังบวกและแรงบันดาลใจ]
[Hook / Climax: จังหวะเต็มรูปแบบ อารมณ์พุ่งทะยาน ชวนให้อยากลงมือทำและติดตามจนจบ]
[Outro: ดนตรีเฟดลงอย่างราบรื่น พอดีกับช่วง Call To Action ท้ายคลิป]`,
    full_prompt: `Upbeat modern commercial background music, energetic acoustic guitar riff, bright motivating piano chords, bouncy synth bassline, punchy modern beats and hand claps, perfect tempo for viral TikTok reels and YouTube shorts, clear audio mastering, 118 BPM.`
  };
}

/**
 * Builds a comprehensive, professional cinematography master prompt for high-end AI video generators.
 * Incorporates Camera/Lens, Lighting Setup, Insert/B-Roll Cutaways, and Production Color Science.
 */
export function generateCinematicVideoPrompt(title: string, brandName: string, brief: string, hookText: string): string {
  const combined = `${brandName} ${title} ${brief}`.toLowerCase();
  const safeTitle = safeThaiTruncate(title, 40);
  const safeHook = safeThaiTruncate(hookText, 35);

  if (
    combined.includes("อาหาร") ||
    combined.includes("ทำอาหาร") ||
    combined.includes("สูตร") ||
    combined.includes("เมนู") ||
    combined.includes("ครัว") ||
    combined.includes("เชฟ") ||
    combined.includes("กิน") ||
    combined.includes("ของหวาน") ||
    combined.includes("เบเกอรี่")
  ) {
    return `Master commercial culinary cinematography 9:16 vertical video representing ${safeTitle}. Camera & Lens: Smooth motorized gimbal push-in from 45-degree angle transitioning into extreme macro 50mm f/1.8 close-up with shallow depth of field, 60fps high-speed capture. Lighting: Warm 3200K side key lighting with softbox diffusion, glowing back rim light highlighting steam and moisture droplets against dark rustic slate. Insert B-Roll Cutaway: Macro shot of sizzling ingredients tossed in hot wok with flame flares, rich savory sauce bubbling, fluid sauce drizzling, crisp sound texture, fresh fragrant green herbs sprinkled in slow motion. Production & Color: Shot on ARRI Alexa Mini LF, high dynamic range, mouthwatering photorealistic culinary color science, hyper-realistic 4K resolution. Typography: Subtle clean modern Thai typography overlay stating: "${safeHook}".`;
  }

  if (
    combined.includes("วัด") ||
    combined.includes("ทำบุญ") ||
    combined.includes("ไหว้พระ") ||
    combined.includes("สายมู") ||
    combined.includes("พระธาตุ") ||
    combined.includes("พุทธ")
  ) {
    return `Master cultural cinematography 9:16 vertical video representing ${safeTitle}. Camera & Lens: Handheld fluid gimbal forward glide at eye level, low-angle looking up at ancient Lanna pagoda and teakwood pavilion, prime 50mm f/1.4 lens bokeh, 60fps smooth playback. Lighting: Gentle morning golden hour rays (08:30 AM) filtering through misty mountain trees, soft atmospheric volumetric light beams, warm golden candle glow. Insert B-Roll Cutaway: Macro shot of ancient teakwood woodcarvings, green moss on weathered 700-year-old brickwork, delicate brass wind chimes swaying in gentle breeze, fragrant incense smoke swirling gracefully. Production & Color: Shot on ARRI Alexa 4K, organic 35mm film grain, meditative calm color grade, hyper-realistic spiritual depth. Typography: Elegant minimal Thai title overlay stating: "${safeHook}".`;
  }

  if (
    combined.includes("เชียงใหม่") ||
    combined.includes("เที่ยว") ||
    combined.includes("คาเฟ่") ||
    combined.includes("ถ่ายรูป") ||
    combined.includes("travel")
  ) {
    return `Elite travel and lifestyle commercial cinematography 9:16 vertical video representing ${safeTitle}. Camera & Lens: Handheld smooth gimbal tracking shot walking alongside traveler, 35mm and 50mm f/1.8 prime lenses with creamy organic bokeh, subtle natural whip-pan transitions, 60fps slow-motion capture. Lighting: Warm afternoon golden hour sunlight (16:30 PM), soft window daylight diffusion, natural sun flare glowing through tree leaves. Insert B-Roll Cutaway: Macro close-up of artisan pour-over coffee dripping, ice clinking in refreshing glass, footsteps on rustic stone path, wind blowing through linen clothing. Production & Color: Kodak Portra 400 color science, pastel filmic highlights, master commercial grading, 4K resolution. Typography: Modern aesthetic Thai typography stating: "${safeHook}".`;
  }

  if (
    combined.includes("รถ") ||
    combined.includes("mazda") ||
    combined.includes("byd") ||
    combined.includes("ev") ||
    combined.includes("ยานยนต์")
  ) {
    return `High-octane automotive commercial cinematography 9:16 vertical video representing ${safeTitle}. Camera & Lens: Low-angle dynamic tracking car rig shot gliding inches above asphalt, motorized crane sweep from bold front grille to sleek aerodynamic roofline, high frame rate 120fps motion. Lighting: Sunset golden hour reflections cascading across sculpted metallic curves, vibrant LED sequential headlight flares, dramatic cockpit interior ambient cyan glow. Insert B-Roll Cutaway: Macro close-up of spinning diamond-cut alloy wheels, brake caliper detail, finger touching high-resolution OLED digital interface, leather seat stitching. Production & Color: Shot on ARRI Alexa LF, anamorphic lens flares, high-contrast commercial color grade, hyper-realistic reflections. Typography: Bold futuristic Thai typography stating: "${safeHook}".`;
  }

  // Default commercial master prompt
  return `Master commercial cinematography 9:16 vertical video representing ${safeTitle}. Camera & Lens: Motorized 3-axis gimbal push-in, 50mm f/1.8 prime lens, beautiful shallow depth of field, slow-motion 60fps high-speed capture. Lighting: Professional three-point studio lighting, warm 3200K key light, soft diffused rim light separating subject from background, atmospheric volumetric glow. Insert B-Roll Cutaway: High-speed macro cutaway shots of tactile texture details, liquid droplets or rising vapor, authentic hands interacting smoothly. Production & Color: ARRI Alexa 4K film look, master commercial color grading, fine film grain, photorealistic 8K fidelity. Typography: Bold modern Thai typography overlay stating: "${safeHook}".`;
}

export function buildDomainFallbackIdeas(
  input: IdeaGenerationInput,
  domainSpec: any,
  count: number
): ContentIdea[] {
  const brief = (input.briefText || input.brief || input.topic || "คอนเทนต์พิเศษ").trim();
  const brandName = (input.brand_name || input.brand || "เพจหลัก").trim();
  const isSeries = !!input.is_series;
  const preferredMedia = input.preferredMediaType || "ALL";
  const isAllVideo = preferredMedia === "VIDEO";
  const isAllImage = preferredMedia === "IMAGE";
  const isVideo = isAllVideo;
  const combined = `${brandName} ${brief}`.toLowerCase();

  // Extract clean topic and dish/subject
  const cleanTopic = extractCleanTopic(brief);
  const safeTopic25 = safeThaiTruncate(cleanTopic, 25);
  const safeTopic30 = safeThaiTruncate(cleanTopic, 30);
  const cleanDish = cleanTopic
    .replace(/^(ขั้นตอนการทำ|วิธีทำ|แจกสูตร|สอนทำ|เมนู|สูตรลับ|สูตรเด็ด|สูตร|ทริคการทำ|ทริค|วิธี)\s*/i, "")
    .trim() || cleanTopic;
  const safeDish25 = safeThaiTruncate(cleanDish, 25);

  const isTemple =
    combined.includes("วัด") ||
    combined.includes("ทำบุญ") ||
    combined.includes("ไหว้พระ") ||
    combined.includes("สายมู") ||
    combined.includes("พระธาตุ") ||
    combined.includes("พุทธ") ||
    combined.includes("ธรรมะ") ||
    combined.includes("วิหาร") ||
    combined.includes("โบราณสถาน");

  const isGraduation =
    combined.includes("รับปริญญา") ||
    combined.includes("ชุดครุย") ||
    combined.includes("บัณฑิต");

  const isTravel =
    combined.includes("เชียงใหม่") ||
    combined.includes("คาเฟ่") ||
    combined.includes("cafe") ||
    combined.includes("เที่ยว") ||
    combined.includes("ท่องเที่ยว") ||
    combined.includes("พิกัด") ||
    combined.includes("ถ่ายรูป") ||
    combined.includes("เช็คอิน") ||
    combined.includes("travel") ||
    combined.includes("โรงแรม") ||
    combined.includes("ที่พัก");

  const isCar =
    combined.includes("mazda") ||
    combined.includes("byd") ||
    combined.includes("รถ") ||
    combined.includes("ev") ||
    combined.includes("ยานยนต์") ||
    combined.includes("ดีลเลอร์");

  const isFood =
    combined.includes("อาหาร") ||
    combined.includes("ทำอาหาร") ||
    combined.includes("สูตร") ||
    combined.includes("เมนู") ||
    combined.includes("ครัว") ||
    combined.includes("เชฟ") ||
    combined.includes("กิน") ||
    combined.includes("ของหวาน") ||
    combined.includes("เบเกอรี่") ||
    combined.includes("ขนม") ||
    combined.includes("รสชาติ") ||
    combined.includes("กะเพรา") ||
    combined.includes("ผัด") ||
    combined.includes("ต้ม") ||
    combined.includes("ทอด") ||
    combined.includes("แกง") ||
    combined.includes("ยำ") ||
    combined.includes("หมู") ||
    combined.includes("ไก่") ||
    combined.includes("เนื้อ") ||
    combined.includes("ปลา") ||
    combined.includes("กุ้ง") ||
    combined.includes("ข้าว") ||
    combined.includes("จาน") ||
    combined.includes("ขั้นตอนการทำ") ||
    combined.includes("วิธีทำ") ||
    combined.includes("cooking");

  let angles: Array<{
    title: string;
    hook: string;
    concept: string;
    spokenScript: string;
    postCaption: string;
    hashtags: string[];
    visualAngle: string;
    realPhotoTip: string;
  }> = [];

  if (isFood) {
    angles = [
      {
        title: isVideo
          ? `แจกสูตรลับ ${cleanDish} ให้อร่อยเข้มข้น รสชาติต้นตำรับฉบับโฮมเมด ทำตามได้ทันที`
          : `เปิดสูตรลับวิธีทำ ${cleanDish} ให้อร่อยเข้มข้น รสชาติต้นตำรับ ขั้นตอนง่าย ทำตามได้ทันที`,
        hook: `ใครชอบกิน ${cleanDish} ทำเองแล้วไม่เหมือนร้าน? เซฟคลิปนี้ด่วน แจกสูตรเด็ดเคล็ดลับกระทะที่ร้านอาหารไม่เคยบอก!`,
        concept: `แจกสูตรและขั้นตอนการทำ ${cleanDish} ให้อร่อยเข้มข้น กลมกล่อมถึงเครื่อง เคล็ดลับการคุมไฟและจังหวะลงเครื่องปรุงที่ทำให้รสชาติต้นตำรับเป๊ะ`,
        spokenScript: `ใครอยากทำ ${cleanDish} ให้อร่อยเข้มข้นเหมือนนั่งกินที่ร้านดัง ฟังสูตรลับ 30 วินาทีนี้เลยครับ! เริ่มจากตั้งกระทะให้ร้อนจัด ใส่น้ำมันพืชเล็กน้อย พอน้ำมันเริ่มเดือดให้ลงพริกกระเทียมเจียวจนเหลืองหอม จากนั้นใส่เนื้อสัตว์ลงไปผัดด้วยไฟแรงเร็วๆ เพื่อล็อกความชุ่มฉ่ำไม่ให้เนื้อแห้ง ปรุงรสด้วยซอสสูตรลับ แล้วสะบัดกระทะให้เข้ากัน ปิดไฟตักเสิร์ฟได้เลย ใครชอบทำอาหารหรือชอบกิน ${cleanDish} เซฟคลิปนี้ไว้ลองทำตามวันหยุดนี้น้า หรือแท็กเพื่อนสายกินมาดูด้วยกันครับ!`,
        postCaption: `แจกสูตรลับวิธีทำ ${cleanDish} ให้อร่อยเข้มข้น รสชาติต้นตำรับฉบับโฮมเมด ทำตามได้ทันที 🍳🔥

ไม่ต้องง้อร้านดังอีกต่อไป ทำกินเองที่บ้านง่ายๆ แต่ได้รสชาติระดับภัตตาคาร เคล็ดลับอยู่ที่การคุมไฟแรงเพื่อล็อกความชุ่มฉ่ำของเนื้อสัตว์ และสัดส่วนเครื่องปรุงที่กลมกล่อมลงตัว

📌 สัดส่วนและขั้นตอนสำคัญในการทำ ${cleanDish}:
• ผัดด้วยไฟแรงสะบัดกระทะให้หอมกลิ่นคั่วกระทะ (Wok Hei)
• ล็อกความฉ่ำของเนื้อสัตว์ ไม่ผัดนานจนเนื้อแข็ง
• ปรุงรสด้วยซอสเคี่ยวสูตรกลมกล่อมถึงเครื่อง

บันทึกโพสต์นี้ไว้เปิดดูตอนเข้าครัววันหยุด หรือแท็กคนข้างๆ ให้ทำให้กินได้เลยน้า! 🤍`,
        hashtags: [`#${cleanDish.replace(/\s+/g, "")}`, "#แจกสูตรอาหาร", "#ทำอาหารกินเอง", "#เมนูง่ายๆ", "#สูตรเด็ด", "#ห้องครัวtiktok", "#foodie"],
        visualAngle: `Motorized Gimbal 45° Push-in ดิ่งเข้าหาหน้ากระทะ ${cleanDish} เลนส์ 50mm f/1.8 สลับมาโครความฉ่ำของเนื้อสัตว์`,
        realPhotoTip: "ถ่าย 4K 60fps เปิดคลิปด้วยช็อตกระทะร้อนๆ ตอนควันพวยพุ่งและเปลวไฟสะบัดเบาๆ หยุดคนดูใน 3 วินาทีแรก"
      },
      {
        title: `3 ทริคลับเตรียมวัตถุดิบและคุมไฟ ทำ ${cleanDish} ยังไงให้หอมกลิ่นกระทะ ไม่แฉะและรสชาติเข้มข้น`,
        hook: `ทำ ${cleanDish} ทีไรแฉะ ไม่หอมกลิ่นกระทะ? เซฟคลิปนี้ด่วน 3 ทริคนี้เปลี่ยนชีวิตในครัว!`,
        concept: `แก้ปัญหาทำ ${cleanDish} แล้วเนื้อสัตว์เหนียวหรือผัดแล้วแฉะ ด้วย 3 เทคนิคครัวมือโปรที่ทำตามได้ทันที`,
        spokenScript: `ใครเจอปัญหาทำ ${cleanDish} แล้วน้ำนอง ผักเหี่ยว หรือเนื้อสัตว์เหนียวแข็ง เซฟคลิปนี้ไว้เลย 3 ทริคนี้ช่วยได้ทันที! ทริคแรก ซับเนื้อสัตว์ให้แห้งสนิทก่อนลงกระทะ เพื่อให้เกิดผิวเกรียมหอม ทริคที่สอง อย่าใส่ผักลงไปพร้อมกัน ให้ลงผักเนื้อแข็งก่อน แล้วเร่งไฟแรงตอนลงผักใบ และทริคสุดท้าย คลุกเคล้าเครื่องปรุงล่วงหน้าในถ้วยเล็ก พอเทลงกระทะร้อนๆ กลิ่นหอมจะฟุ้งทันทีโดยไม่ต้องผัดนาน ลองเอาไปปรับใช้กับการทำ ${cleanDish} ดูนะครับ รับรองอร่อยขึ้นเป็นกอง!`,
        postCaption: `รวม 3 ทริคเด็ดก้นครัว ทำ ${cleanDish} ยังไงให้หอมกลิ่นกระทะ วัตถุดิบฉ่ำกรอบไม่แฉะ! 🔪✨

ใครชอบเข้าครัวทำ ${cleanDish} แล้วเจอปัญหาน้ำนองหรือเนื้อสัตว์แข็งกระด้าง ลองเอา 3 เทคนิคนี้ไปใช้ดูครับ:

1. ซับเนื้อให้แห้งสนิทก่อนผัด เพื่อให้เกิดปฏิกิริยา Maillard ผิวเกรียมหอม
2. เรียงลำดับผักตามความสุก ผักเนื้อแข็งลงก่อน ผักใบลงท้ายสุดด้วยไฟแรง
3. ผสมซอสปรุงรสในถ้วยไว้ล่วงหน้า เทราดขอบกระทะร้อนๆ เพิ่มกลิ่นหอมชวนหิว

เซฟโพสต์นี้ไว้เป็นคัมภีร์ติดครัวได้เลยน้า! 🍲`,
        hashtags: [`#${cleanDish.replace(/\s+/g, "")}`, "#ทริคทำอาหาร", "#เคล็ดลับก้นครัว", "#ทำอาหาร", "#สอนทำอาหาร", "#เข้าครัวกับtiktok"],
        visualAngle: "Top-down 90° flat lay สลับ low-angle tracking push-in โฟกัสการหั่นวัตถุดิบและไฟกระทะ",
        realPhotoTip: "ถ่ายช่วงแสงสว่างชัดเจน แสงธรรมชาติหรือไฟสตูดิโอ 5600K ให้ผักและเนื้อสัตว์ดูสดฉ่ำน่าทาน"
      },
      {
        title: `เปิดขั้นตอนทำ ${cleanDish} เมนูด่วน 15 นาที อร่อยอิ่มท้อง วัตถุดิบน้อย ขั้นตอนง่าย ฉบับคนเวลาน้อย`,
        hook: `กลับบ้านมาเหนื่อยๆ แต่อยากกิน ${cleanDish} ใน 15 นาที ทำตามขั้นตอนนี้ได้เลย ง่ายและฟินมาก!`,
        concept: `สูตรและขั้นตอนทำ ${cleanDish} จานด่วนที่ใช้วัตถุดิบน้อยหาง่ายในตู้เย็น ปรุงเสร็จภายใน 15 นาที รสชาติกลมกล่อมถูกปากทั้งบ้าน`,
        spokenScript: `เลิกงานกลับมาหิวๆ ไม่อยากสั่งเดลิเวอรี่ให้รอนาน เมนู ${cleanDish} นี้ตอบโจทย์สุด ทำเสร็จใน 15 นาที อร่อยฟินมาก! ขั้นตอนแรก นำวัตถุดิบในตู้เย็นมาหั่นเตรียมไว้ แค่ 3 อย่างเท่านั้น ขั้นตอนที่สอง ตั้งกระทะไฟกลาง ผัดเครื่องให้ส่งกลิ่นหอม แล้วปรุงรสตามชอบ ไม่ต้องมีเทคนิคซับซ้อน และขั้นตอนสุดท้าย ตักราดข้าวสวยร้อนๆ กินคู่กับไข่ดาวกรอบๆ บอกเลยว่าฟินลืมเหนื่อย ใครเวลาน้อยแต่อยากกิน ${cleanDish} อร่อยๆ เซฟคลิปนี้ไว้ทำตามเย็นนี้นะครับ!`,
        postCaption: `แจกขั้นตอนทำ ${cleanDish} เมนูด่วน 15 นาที อร่อยฟินประหยัดเวลา ฉบับคนเวลาน้อย! ⏱️🍳

หลังจากวันเหนื่อยๆ แค่มีวัตถุดิบติดตู้เย็น 3-4 อย่าง ก็เนรมิต ${cleanDish} แสนอร่อยได้ง่ายๆ ทานคู่กับข้าวสวยร้อนๆ เข้ากันที่สุด

📌 สรุปขั้นตอนง่ายๆ:
• เตรียมวัตถุดิบ 5 นาที
• ผัดปรุงรสไฟกลาง 8 นาที
• เสิร์ฟพร้อมเครื่องเคียง 2 นาที

เซฟเก็บไว้เป็นเมนูคู่ใจวันขี้เกียจได้เลยครับ! 🤍`,
        hashtags: [`#${cleanDish.replace(/\s+/g, "")}`, "#เมนูด่วน", "#อาหารจานเดียว", "#เมนูเด็กหอ", "#ทำง่ายอร่อยด้วย", "#กินอะไรดี"],
        visualAngle: "Intimate handheld camera movement พร้อม rack focus จากวัตถุดิบสู่จานพร้อมเสิร์ฟควันกรุ่น",
        realPhotoTip: "ถ่ายแสงหน้าต่างเช้าหรือบ่ายสี่โมง ใช้ช้อนตักไข่แดงเยิ้มๆ ให้เห็นความน่าทาน"
      },
      {
        title: `POV: ทำ ${cleanDish} คลายหิวรอบดึก เสียงกระทะฉ่ากับกลิ่นหอมฟุ้ง ฮีลใจได้ดีที่สุด`,
        hook: `POV: สี่ทุ่มแล้วท้องร้อง... ลุกขึ้นมาเปิดตู้เย็นทำ ${cleanDish} เสียงฉ่าในกระทะคือฮีลใจสุดๆ!`,
        concept: `ถ่ายทอดมู้ดอบอุ่นสไตล์ ASMR Cooking ยามค่ำคืน เสียงผัด ${cleanDish} เสียงทอด และความสุขจากการได้ทำของอร่อยกินเอง`,
        spokenScript: `POV: มีใครเป็นเหมือนกันไหมครับ ดึกๆ ทีไรความหิวไม่เคยปรานี ลุกขึ้นมาเปิดครัวทำ ${cleanDish} ร้อนๆ ได้ยินเสียงน้ำมันเดือดเบาๆ ในกระทะ กลิ่นหอมของพริกกระเทียมลอยแตะจมูก บางทีความสุขของวันก็ง่ายๆ แค่การได้ทำ ${cleanDish} จานโปรดกินเองแบบไม่ต้องเร่งรีบ ทานอาหารให้อร่อยและพักผ่อนให้เต็มที่นะครับทุกคน!`,
        postCaption: `บางครั้ง การบำบัดความเหนื่อยล้าที่ดีที่สุด คือมื้ออร่อยรอบดึก ${cleanDish} ที่ทำด้วยตัวเอง 🌙🍜

ได้ยินเสียงกระทะฉ่า ได้กลิ่นหอมอุ่นๆ ในครัว แค่นี้ก็พร้อมทิ้งความเครียดของวันแล้วครับ

ใครหิวรอบดึกเหมือนกัน มาคอมเมนต์บอกเมนูโปรดกันได้น้าา 🤍`,
        hashtags: [`#${cleanDish.replace(/\s+/g, "")}`, "#asmrcooking", "#มื้อดึก", "#ทำอาหารรอบดึก", "#ความสุขง่ายๆ", "#ฮีลใจ", "#reelsอาหาร"],
        visualAngle: `First-person POV แสงโคมไฟทังสเตนอบอุ่นตอนกลางคืน โฟกัสเสียงฉ่า ${cleanDish} และควันหอมกรุ่น`,
        realPhotoTip: "ใช้โหมด 60fps สโลว์โมชัน บันทึกเสียงทอด/ผัดสดๆ ให้เสียง Ambient ชัดเจน"
      }
    ];
  } else if (isTemple) {
    angles = [
      {
        title: isVideo
          ? "3 วัดลับเชียงใหม่ที่คนไม่ค่อยรู้ แต่ไปแล้วใจสงบมาก ฟีลหลุดไปอยู่อีกโลก"
          : "เปิดพิกัด 3 วัดลับกลางป่าเชียงใหม่ สถาปัตยกรรมล้านนาสวยสะกดใจ ได้ความสงบเต็มร้อย",
        hook: "แก... ถ้าเหนื่อยจากงาน อยากหาที่สงบฮีลใจในเชียงใหม่ เซฟ 3 วัดนี้ไว้ด่วน!",
        concept: "แนะนำวัดสงบกลางป่าและอุโมงค์โบราณในเชียงใหม่ที่มีธรรมชาติโอบล้อม ช่วยบำบัดจิตใจและได้สัมผัสศิลปะล้านนาแท้",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): แก... ถ้าเหนื่อยจากงาน อยากหาที่สงบฮีลใจในเชียงใหม่ เซฟ 3 วัดนี้ไว้ด่วน!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): จุดแรกคือ 'วัดอุโมงค์ สวนพุทธธรรม' เดินลอดอุโมงค์อิฐโบราณอายุ 700 ปี เย็นสงบและขลังมาก จุดที่สองต้องขึ้นมา 'วัดผาลาด' วัดลับกลางป่าริมน้ำตกบนดอยสุเทพ นั่งฟังเสียงน้ำไหลพร้อมชมวิหารศิลปะล้านนาผสมพม่า และจุดที่สาม 'วัดร่ำเปิง' บรรยากาศร่มรื่นใต้ร่มไม้ เหมาะกับการมานั่งสมาธิและปรับคลื่นพลังงานใจสุดๆ
⏱️ 0:25 - 0:30 (Call to action): ใครอยากแวะมาฮีลใจ เซฟคลิปนี้ไว้เลย หรือส่งต่อให้เพื่อนที่กำลังเหนื่อยได้เลยน้าา`,
        postCaption: `แจกพิกัด 3 วัดลับกลางป่าในเชียงใหม่ที่ไปแล้วใจสงบที่สุด 🌿🕊️
ไม่ต้องเบียดเสียดกับใคร ได้สัมผัสธรรมชาติและความสงบแท้จริง

📍 พิกัดในคลิป:
1. วัดอุโมงค์ สวนพุทธธรรม (หลัง มช.) - ลอดอุโมงค์โบราณ 700 ปี สัมผัสความเงียบสงบใต้ผืนดิน
2. วัดผาลาด สกทาคามี (ดอยสุเทพ) - วัดโบราณซ่อนตัวกลางป่าริมน้ำตก เสียงสายน้ำฮีลใจสุดๆ
3. วัดร่ำเปิง ตโปทาราม (คันคลอง) - ร่มรื่นใต้แมกไม้ใหญ่ ศูนย์ปฏิบัติธรรมที่ให้พลังบวกเต็มเปี่ยม

เซฟเก็บไว้ในลิสต์ทริปเชียงใหม่รอบหน้าได้เลยน้า หรือแท็กเพื่อนสายบุญสายธรรมชาติเลย! 🤍`,
        hashtags: ["#วัดเชียงใหม่", "#เที่ยวเชียงใหม่", "#วัดผาลาด", "#วัดอุโมงค์", "#ฮีลใจ", "#สายบุญ", "#ไหว้พระเชียงใหม่"],
        visualAngle: "Slow Pan ริมลำธารและอุโมงค์โบราณ แสงแดดเช้าส่องผ่านแมกไม้เขียวชอุ่ม",
        realPhotoTip: "ถ่ายช่วง 08:00 - 10:00 น. แสงเช้าจะส่องลอดใบไม้ลงมาที่ผนังอุโมงค์ สวยสงบโดยไม่ต้องแต่งรูป"
      },
      {
        title: "เปิดพิกัด 3 วัดดังเชียงใหม่ ขอพรเรื่องงาน เงิน สุขภาพ ให้ปังรับปีนี้",
        hook: "มาเชียงใหม่ทั้งที อย่าเพิ่งกลับถ้ายังไม่ได้แวะขอพร 3 วัดศักดิ์สิทธิ์นี้!",
        concept: "เจาะลึกจุดไหว้พระขอพรศักดิ์สิทธิ์คู่บ้านคู่เมืองเชียงใหม่ แนะนำเคล็ดลับการไหว้ขอพรแต่ละด้านให้สำเร็จผล",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): มาเชียงใหม่ทั้งที อย่าเพิ่งกลับถ้ายังไม่ได้แวะขอพร 3 วัดศักดิ์สิทธิ์นี้!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): จุดแรกอยากขอการงานมั่นคง เสริมบารมี ให้มาที่ 'วัดเจดีย์หลวง' ไหว้เสาอินทขิลหลักเมืองเชียงใหม่ จุดที่สองเรื่องความสำเร็จทันใจ ต้องขึ้นไป 'วัดพระธาตุดอยคำ' ขอพรหลวงพ่อทันใจด้วยพวงมาลัยมะลิ และจุดที่สาม เสริมสิริมงคล เมตตามหานิยม ต้องมาที่ 'วัดพระสิงห์' สักการะพระพุทธสิหิงค์และชมวิหารลายคำสุดวิจิตร
⏱️ 0:25 - 0:30 (Call to action): ใครอยากรับพลังบวกและเฮงตลอดปี เซฟคลิปนี้ไว้ตามรอยเลย ขอให้สมปรารถนาทุกคนนะครับ!`,
        postCaption: `รวม 3 พิกัดวัดศักดิ์สิทธิ์คู่เมืองเชียงใหม่ ขอพรอะไร ไหว้จุดไหนให้สัมฤทธิ์ผล ✨🙏

📌 ไฮไลต์และเคล็ดลับการขอพร:
• วัดเจดีย์หลวงวรวิหาร - เสริมความมั่นคงในชีวิต การงาน หนุนดวงชะตาด้วยการกราบเสาอินทขิล
• วัดพระธาตุดอยคำ - หลวงพ่อทันใจ เด่นเรื่องโชคลาภ การเงินสำเร็จดั่งใจนึก นำพวงมาลัยมะลิมาถวาย
• วัดพระสิงห์วรมหาวิหาร - พระอารามหลวง เสริมบารมีและเมตตามหานิยม วิหารลายคำงดงามระดับมาสเตอร์พีซ

กดเซฟโพสต์นี้ไว้เป็นคู่มือไหว้พระเชียงใหม่ได้เลยครับ สาธุร่วมกันน้า! 💫`,
        hashtags: ["#ไหว้พระเชียงใหม่", "#สายมูเชียงใหม่", "#หลวงพ่อทันใจ", "#วัดเจดีย์หลวง", "#วัดพระสิงห์", "#เสริมดวง"],
        visualAngle: "Medium Shot องค์พระประธานและเสาอินทขิล แสงเทียนและควันธูปพริ้วไหว",
        realPhotoTip: "สำรวมและปิดเสียงชัตเตอร์ ใช้เลนส์ 2x ถ่ายระยะห่าง ไม่เปิดแฟลชเพื่อเคารพสถานที่"
      },
      {
        title: "แจกรูท 1 วัน ไหว้พระ 5 วัดรอบคูเมืองเชียงใหม่ เดินทางง่าย อิ่มบุญอิ่มใจในวันเดียว",
        hook: "มีเวลาแค่ 1 วันในเชียงใหม่ ทำบุญไหว้พระที่ไหนได้ครบจบและเดินทางง่ายที่สุด? แจกรูทนี้เลย!",
        concept: "แพลนวันเดย์ทริปเส้นทางไหว้พระรอบคูเมืองเชียงใหม่ จัดลำดับการเดินทางตามจริง ประหยัดเวลา เดินหรือนั่งรถแดงตามรอยได้สบาย",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): มีเวลาแค่วันเดียวในเชียงใหม่ อยากไหว้พระให้ครบ 5 วัด รูทนี้ตอบโจทย์สุด เซฟไว้เลย!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): เริ่มเก้าโมงเช้าที่ 'วัดพระสิงห์' ชมวิหารลายคำศิลปะล้านนาแท้ เดินต่อมา 10 นาทีถึง 'วัดเจดีย์หลวง' ชมเจดีย์โบราณสุดอลังการ พักเที่ยงกินข้าวซอยแถวนั้น แล้วบ่ายโมงแวะ 'วัดพันเตา' วิหารไม้สักทองทั้งหลัง ต่อด้วย 'วัดเชียงมั่น' วัดแรกของเมืองเชียงใหม่ ปิดท้ายสี่โมงเย็นที่ 'วัดโลกโมฬี' เจดีย์ทรงปราสาทแสงเย็นสวยสะกดตา
⏱️ 0:25 - 0:30 (Call to action): รูทนี้เดินทางง่ายมาก จะนั่งรถแดงหรือปั่นจักรยานก็ได้ เซฟไว้ลุยเลยน้าา!`,
        postCaption: `แจกแพลน 1 วัน รูทไหว้พระ 5 วัดรอบคูเมืองเชียงใหม่ อิ่มบุญอิ่มใจแบบไม่เหนื่อย 🛕✨

🕒 ตารางรูทแนะนำ:
• 09:00 น. - วัดพระสิงห์วรมหาวิหาร (กราบพระพุทธสิหิงค์ เสริมสิริมงคล)
• 10:30 น. - วัดเจดีย์หลวงวรวิหาร (ชมเจดีย์โบราณและสักการะเสาหลักเมือง)
• 13:00 น. - วัดพันเตา (วิหารหอคำไม้สักทองโบราณ ศิลปะเชียงแสน)
• 14:30 น. - วัดเชียงมั่น (วัดแห่งแรกของเมืองเชียงใหม่)
• 16:00 น. - วัดโลกโมฬี (เจดีย์ทรงปราสาท ถ่ายรูปแสงเย็นสวยมาก)

บันทึกโพสต์นี้ไว้จัดทริป หรือแชร์ชวนเพื่อนๆ มาทำบุญด้วยกันได้เลยครับ! 💛`,
        hashtags: ["#แพลนเที่ยวเชียงใหม่", "#ไหว้พระ9วัด", "#คูเมืองเชียงใหม่", "#รีวิวเชียงใหม่", "#วันเดย์ทริป"],
        visualAngle: "Montage 5 วัดรอบคูเมือง รวดเร็ว กระชับ เห็นเอกลักษณ์แต่ละวัดชัดเจน",
        realPhotoTip: "เช่ารถแดงเหมาวันหรือปั่นจักรยานรอบคูเมือง พกหมวกและร่ม แสงช่วง 16:00 น. ที่วัดโลกโมฬีสวยที่สุด"
      },
      {
        title: "POV: วันที่รู้สึกเหนื่อยล้า แล้วได้มานั่งฟังเสียงระฆังลมที่วัดผาลาด เชียงใหม่",
        hook: "POV: เมื่อโลกข้างนอกมันวุ่นวาย ลองพาตัวเองมานั่งเงียบๆ ในวัดกลางป่าเชียงใหม่ แล้วคุณจะรู้ว่าความสงบมีจริง...",
        concept: "ถ่ายทอดบรรยากาศความเงียบสงบ เสียงกระดิ่งลม เสียงลำธาร และความงดงามของสถาปัตยกรรมโบราณที่ช่วยชาร์จพลังชีวิต",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): POV: เมื่อชีวิตต้องการพักผ่อน ลองพาใจมานั่งเงียบๆ ที่วัดกลางป่าแห่งนี้ดูนะ...
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ทันทีที่ก้าวเท้าเข้ามาที่วัดผาลาด เสียงความวุ่นวายข้างนอกหายไปหมด เหลือแค่เสียงสายน้ำตกที่ไหลเอื่อยๆ เสียงระฆังลมกังวานแผ่วเบา และกลิ่นไอชื้นของดินและมอสเขียวบนซากอิฐโบราณ บางทีการชาร์จแบตที่ดีที่สุด อาจไม่ใช่การไปเที่ยวให้เหนื่อย แต่คือการได้นั่งมองธรรมชาติอย่างมีสติ
⏱️ 0:25 - 0:30 (Call to action): ขอให้คลิปนี้เป็นพลังใจดีๆ ให้ทุกคนที่กำลังเหนื่อยนะครับ แวะมาสูดลมหายใจด้วยกันนะ`,
        postCaption: `บางครั้ง สิ่งที่เราต้องการมากที่สุด อาจเป็นแค่ที่ที่เงียบสงบ ให้ใจได้หยุดพัก 🍃🌧️
วัดผาลาด (สกทาคามี) วัดโบราณกลางป่าริมดอยสุเทพ เชียงใหม่
ที่นี่มีทั้งเสียงสายน้ำตก เสียงระฆังลม และความร่มเย็นของศิลปะล้านนาโบราณ

ถ้าเหนื่อยจากเรื่องราวรอบตัว ลองหาเวลาแวะมาสัมผัสความสงบที่นี่ดูนะครับ 🤍`,
        hashtags: ["#วัดผาลาด", "#เที่ยวเชียงใหม่", "#ฮีลใจ", "#ธรรมชาติบำบัด", "#ความสงบ", "#reels"],
        visualAngle: "First-person POV นั่งมองสายน้ำตกและระฆังลมพัดไหวช้าๆ",
        realPhotoTip: "บันทึกเสียงธรรมชาติ (Ambient sound) เสียงน้ำตกและเสียงลมสดๆ เพื่อความสมจริง"
      }
    ];
  } else if (isGraduation) {
    angles = [
      {
        title: isVideo
          ? "3 พิกัดลับถ่ายรูปเชียงใหม่ฟีลสวิสฯ ในชุดครุย ได้รูปฉ่ำไม่ซ้ำใคร"
          : "เปิดพิกัด 3 มุมถ่ายรูปรับปริญญาเชียงใหม่ฟีลต่างประเทศ แสงสวยปังไม่ต้องบินไกล",
        hook: "แก... อย่าเพิ่งไปถ่ายรูปรับปริญญาที่เชียงใหม่ ถ้ายังไม่รู้ 3 พิกัดนี้!",
        concept: "แนะนำพิกัดลับและมุมถ่ายรูปซิกเนเจอร์ฟีลยุโรปในเชียงใหม่ ให้ภาพออกมาสวยสะกดตาและไม่ซ้ำใคร",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): แก... อย่าเพิ่งไปถ่ายรูปรับปริญญาที่เชียงใหม่ ถ้ายังไม่รู้ 3 พิกัดนี้!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): จุดแรกเลยคือ Fleur Cafe แม่ริม ตรงซุ้มกุหลาบอังกฤษ แสงบ่าย 4 โมงเย็นคือฟีลเจ้าหญิงมาก จุดที่สองต้องไป Cypress Lanes หางดง ทิวต้นสนยาวเหมือนอยู่ยุโรป มุมต่ำเดินคุยกันได้มู้ดธรรมชาติสุดๆ และจุดสุดท้ายคือ Fern Forest Cafe โซนสวนมอส โทนเขียวละมุน ขับชุดครุยให้เด่นขึ้นมาทันที
⏱️ 0:25 - 0:30 (Call to action): เซฟคลิปนี้ไว้เลยนะ หรือแท็กเพื่อนแท็กตากล้องใต้เมนต์ให้พาไปถ่ายเลยน้าา`,
        postCaption: `แจกพิกัดลับถ่ายรูปนอกรอบรับปริญญาที่เชียงใหม่ 📸✨
ไม่ต้องไปแย่งมุมกับใคร ได้รูปฟีลต่างประเทศแน่นอน

📍 พิกัดในคลิป:
1. Fleur Cafe & Eatery (แม่ริม) - มุมสวนกุหลาบอังกฤษ แสงบ่ายสี่ครึ่งคือที่สุด
2. Cypress Lanes (หางดง) - ทิวสนยุโรป ถ่ายยังไงก็รอด
3. Fern Forest Cafe (คูเมือง) - สวนมอสเขียวฉ่ำ มู้ดอบอุ่นสบายตา

เซฟเก็บไว้ในลิสต์ด่วนๆ หรือแท็กตากล้องคู่ใจให้พาไปน้า! 🤍`,
        hashtags: ["#รับปริญญาเชียงใหม่", "#พิกัดถ่ายรูป", "#เที่ยวเชียงใหม่", "#นอกรอบรับปริญญา", "#คาเฟ่เชียงใหม่", "#reelsนำเทรนด์"],
        visualAngle: "Dynamic Gimbal Push-in เดินเข้าสู่ซุ้มกุหลาบและทิวสน แสง Golden Hour ลอดผ่านกิ่งไม้",
        realPhotoTip: "ถ่ายช่วงเวลา 16:00 - 17:15 น. ย้อนแสงนิดๆ ให้ผมมีประกายทอง ใช้เลนส์ 2x ถอย 5 ก้าว"
      },
      {
        title: "3 ทริคโพสท่าถ่ายรูปชุดครุย ถ่ายยังไงก็ไม่เกร็ง ภาพออกมาธรรมชาติสุดๆ",
        hook: "เตือนไว้ก่อน! ถ้าไม่อยากได้รูปรับปริญญาแข็งทื่อ ให้จำ 3 ทริคนี้ไว้!",
        concept: "แก้ปัญหาคนถ่ายรูปแล้วเกร็ง โพสไม่เป็น ด้วย 3 เทคนิคง่ายๆ ที่ทำให้รูปออกมาเป็นธรรมชาติที่สุด",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): ใครถ่ายรูปแล้วชอบเกร็ง ท่าไม่ธรรมชาติ เซฟคลิปนี้ดูด่วน!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ทริคแรก อย่ามองกล้องตรงๆ ให้แกล้งเดินคุยแล้วหันมาสบตากล้อง ขยับตัวไปเรื่อยๆ จะได้รูปแคนดิดที่ไม่แข็ง ทริคที่สอง ให้คนถ่ายเปิดโหมดพอร์ตเทรต 2x แล้วถอยหลังออกไป 5 ก้าว จะได้หน้าชัดหลังเบลอสวยมาก และทริคสุดท้าย ย่อตัวลงนิดนึง กดมุมเสยช้อนขึ้นเบาๆ ขาจะดูเรียวยาวขึ้นทันทีโดยไม่ต้องพึ่งแอป
⏱️ 0:25 - 0:30 (Call to action): ลองเอาไปใช้ดูน้า รับรองได้รูปโปรไฟล์ใหม่สวยเป๊ะแน่นอน เซฟไว้เลย!`,
        postCaption: `หมดปัญหาไปถ่ายรูปรับปริญญาแล้วได้แต่รูปเกร็งๆ ท่าทึ่มๆ! 🤍
รวม 3 ทริคง่ายๆ ที่ทำให้รูปชุดครุยออกมาเป็นธรรมชาติที่สุด

✨ 3 ทริคกดเซฟไว้เลย:
• แกล้งเดินคุย ได้จังหวะเผลอที่น่ารัก
• เปิดเลนส์ 2x ถอย 5 ก้าว ละลายหลังเนียนตา
• คนถ่ายย่อตัวมุมช้อน ขาเรียวยาวไม่ตัน

ส่งคลิปนี้ให้ตากล้องซ้อมมือด่วนเลยยย 👇`,
        hashtags: ["#ทริคถ่ายรูป", "#รับปริญญานอกรอบ", "#ไอเดียถ่ายรูป", "#tiktokพาเที่ยว", "#ฟีด"],
        visualAngle: "Medium Shot ติดตามการเดิน แคนดิดเป็นธรรมชาติ",
        realPhotoTip: "ให้กดชัตเตอร์รัวแบบ Burst Mode ขณะเดิน อย่าหยุดนิ่งเพื่อให้ได้จังหวะการเคลื่อนไหวจริง"
      },
      {
        title: "แจกแพลน 1 วัน ตะลุยถ่ายรูปรับปริญญารอบเชียงใหม่ งบคนละ 500 บาท!",
        hook: "ตะลุยถ่ายรูปชุดครุยทั่วเชียงใหม่ใน 1 วัน ได้รูปเกิน 300 ใบ งบหลักร้อยมีจริง!",
        concept: "แพลนวันเดย์ทริปถ่ายรูปรับปริญญาเช้าจรดเย็น คุมงบอยู่ เดินทางสะดวก และได้จุดแลนด์มาร์กครบถ้วน",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): แพลน 1 วัน ตะลุยถ่ายรูปรับปริญญาเชียงใหม่ ได้รูปเกิน 300 ใบ หมดงบหลักร้อยมีอยู่จริง!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): เริ่มแปดโมงครึ่งที่อ่างแก้ว มช. อากาศกำลังเย็น แดดไม่ร้อน ถ่ายฟีลเกาหลีริมอ่างน้ำ สิบเอ็ดโมงแวะเติมพลังที่ร้านข้าวซอย ต่อด้วยบ่ายสองไปคาเฟ่ Pluto แสงส่องบันไดโค้งมินิมอลมาก ปิดท้ายสี่โมงครึ่งที่สวนสนแม่แตง แสงเย็นลอดกิ่งสนคือสวยสุด ค่าน้ำมันหารเพื่อนตกคนละไม่กี่ร้อยเอง
⏱️ 0:25 - 0:30 (Call to action): ใครมีแพลนไปเชียงใหม่ เซฟคลิปนี้ไว้ตามรอยได้เลยน้า คุ้มมาก!`,
        postCaption: `แจกแพลน 1 วันเต็ม ตะลุยถ่ายรูปรับปริญญารอบเชียงใหม่แบบคุมงบอยู่! 🚗💨

🕒 ตารางเวลาแนะนำ:
• 08:30 น. - อ่างแก้ว มช. (รับแสงเช้า ฟีลเกาหลี)
• 11:30 น. - แวะกินข้าวซอย พักร้อน
• 14:00 น. - คาเฟ่ Pluto มู้ดอวกาศเท่ๆ
• 16:30 น. - สวนสนแม่แตง แสง Golden hour ฉ่ำๆ

ได้รูปกลับมาเป็นร้อยใบในงบประหยัด เซฟเก็บไว้เลยน้า! ✨`,
        hashtags: ["#แพลนเที่ยวเชียงใหม่", "#รับปริญญาเชียงใหม่", "#เที่ยวเชียงใหม่", "#รีวิวเชียงใหม่", "#คาเฟ่เชียงใหม่"],
        visualAngle: "Montage สลับฉาก 4 สถานที่อย่างกระชับ ตามลำดับเวลาเช้าจรดค่ำ",
        realPhotoTip: "เตรียมน้ำดื่มและพัดลมพกพาไปด้วย ถ่ายกลางแจ้งช่วงเช้ากับเย็น กลางวันเน้นหลบในคาเฟ่ติดแอร์"
      },
      {
        title: "POV: เก็บภาพความทรงจำวันรับปริญญานอกรอบที่เชียงใหม่ อบอุ่นหัวใจที่สุด",
        hook: "POV: เมื่อวันสำคัญในชีวิต ได้มาบันทึกความทรงจำที่เชียงใหม่กับคนที่รัก...",
        concept: "ถ่ายทอดเบื้องหลังความสุขของการฉลองความสำเร็จกับเพื่อนและครอบครัว เรียล อบอุ่น ชวนยิ้มตาม",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): POV: เมื่อมาถ่ายรูปรับปริญญาที่เชียงใหม่ ความรู้สึกในวันสำเร็จ...
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): เริ่มตั้งแต่เช้าวิ่งหลบแดด ซื้อชานมมาปลอบใจตอนเริ่มเหนื่อย แต่พอยกกล้องขึ้นมาแล้วเห็นรอยยิ้มแห่งความสำเร็จ บอกเลยว่าหายเหนื่อยเป็นปลิดทิ้ง รูปออกมาน่ารักทุกใบเพราะความรู้สึกมันเรียลจริงๆ ขอบคุณทุกคนที่เติบโตมาด้วยกันนะ
⏱️ 0:25 - 0:30 (Call to action): ใครมีโมเมนต์น่ารักแบบนี้ แวะมาแชร์ในคอมเมนต์ได้น้า ยินดีกับบัณฑิตทุกคนด้วยครับ!`,
        postCaption: `บันทึกอีกหนึ่งความทรงจำสำคัญในชีวิต 🎓🤍
การได้มาบันทึกภาพและร่วมยินดีที่เชียงใหม่คือช่วงเวลาที่พิเศษมาก
ถึงจะเหนื่อยและร้อน แต่รูปที่ได้กับรอยยิ้มทำให้ทุกอย่างคุ้มค่าจริงๆ

ยินดีกับบัณฑิตใหม่คนเก่งทุกคนน้าา! 🎉✨`,
        hashtags: ["#วันรับปริญญา", "#รับปริญญานอกรอบ", "#ความทรงจำ", "#เที่ยวเชียงใหม่", "#reels"],
        visualAngle: "First-person POV สลับช็อตหันมองยิ้มและเบื้องหลังยินดีด้วยกัน",
        realPhotoTip: "ถ่ายช่วงเวลาก่อนและหลังกดชัตเตอร์ เช่น จังหวะแกล้งกัน ปัดผม หรือหัวเราะ จะได้อารมณ์เรียลที่สุด"
      }
    ];
  } else if (isTravel) {
    angles = [
      {
        title: isVideo
          ? "3 พิกัดลับถ่ายรูปเชียงใหม่ฟีลต่างประเทศ แสงสวยปังไม่ต้องบินไกล"
          : "เปิดพิกัด 3 มุมถ่ายรูปเชียงใหม่ฟีลต่างประเทศ แสงสวยปังไม่ต้องบินไกล",
        hook: "แก... มาเชียงใหม่รอบนี้ ถ้ายังไม่รู้ 3 พิกัดนี้ถือว่าพลาดมาก!",
        concept: "แนะนำพิกัดลับและมุมถ่ายรูปซิกเนเจอร์ฟีลยุโรปในเชียงใหม่ ให้ภาพออกมาสวยสะกดตาและไม่ซ้ำใคร",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): แก... มาเชียงใหม่รอบนี้ ถ้ายังไม่รู้ 3 พิกัดนี้ถือว่าพลาดมาก!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): จุดแรกเลยคือ Fleur Cafe แม่ริม ซุ้มสวนกุหลาบอังกฤษ แสงบ่าย 4 โมงเย็นคือฟีลยุโรปมาก จุดที่สองต้องไป Cypress Lanes หางดง ทิวต้นสนยาว ถ่ายมุมต่ำได้มู้ดธรรมชาติสุดๆ และจุดสุดท้ายคือ Fern Forest Cafe โซนสวนมอส โทนเขียวละมุน สบายตาสุดๆ
⏱️ 0:25 - 0:30 (Call to action): เซฟคลิปนี้ไว้เลยนะ หรือแท็กเพื่อนใต้เมนต์ให้พาไปเช็คอินเลยน้าา`,
        postCaption: `แจกพิกัดลับมุมถ่ายรูปฟีลต่างประเทศในเชียงใหม่ 📸✨
ไม่ต้องบินไปไกล ได้รูปสวยคลาสสิกแน่นอน

📍 พิกัดในคลิป:
1. Fleur Cafe & Eatery (แม่ริม) - มุมสวนกุหลาบอังกฤษ แสงบ่ายสี่ครึ่งคือที่สุด
2. Cypress Lanes (หางดง) - ทิวสนยุโรป บรรยากาศเงียบสงบ
3. Fern Forest Cafe (คูเมือง) - สวนมอสเขียวฉ่ำ มู้ดอบอุ่นสบายตา

เซฟเก็บไว้ในลิสต์ทริปต่อไปได้เลยน้า! 🤍`,
        hashtags: ["#เที่ยวเชียงใหม่", "#พิกัดถ่ายรูป", "#รีวิวเชียงใหม่", "#คาเฟ่เชียงใหม่", "#reelsนำเทรนด์"],
        visualAngle: "Dynamic Gimbal Push-in เดินเข้าสู่ซุ้มกุหลาบและทิวสน แสง Golden Hour ลอดผ่านกิ่งไม้",
        realPhotoTip: "ถ่ายช่วงเวลา 16:00 - 17:15 น. ย้อนแสงนิดๆ ให้ผมมีประกายทอง ใช้เลนส์ 2x ถอย 5 ก้าว"
      },
      {
        title: "3 เทคนิคถ่ายรูปเช็คอินเชียงใหม่ให้ได้รูปสวยปัง ไม่ต้องพึ่งฟิลเตอร์",
        hook: "ไปเที่ยวเชียงใหม่ทั้งที ถ่ายรูปยังไงให้ดูมีสไตล์และแสงสวยเป๊ะ? จำ 3 ข้อนี้ไว้!",
        concept: "แชร์เทคนิคการจับแสงและมุมกล้องของครีเอเตอร์สายเที่ยว ถ่ายง่าย ได้รูปสวยทันที",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): ใครไปเที่ยวเชียงใหม่แล้วถ่ายรูปไม่สวย เซฟคลิปนี้ดูด่วน 3 ทริคนี้ช่วยได้!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ทริคแรก เลือกช่วงเวลา Golden Hour สี่โมงครึ่งถึงห้าโมงครึ่ง แดดจะไม่แรงและให้โทนอบอุ่น ทริคที่สอง เปิดเลนส์พอร์ตเทรต 2x แล้วถอยหลังออกมา 5 ก้าว เพื่อให้ฉากหลังละลายเนียนตา และทริคสุดท้าย หาโฟร์กราวด์ธรรมชาติ เช่น กิ่งไม้หรือใบเฟิร์นมาบังหน้าเลนส์นิดๆ เพิ่มมิติให้ภาพดูแพง
⏱️ 0:25 - 0:30 (Call to action): ลองเอาไปใช้ในทริปหน้าดูน้า เซฟคลิปนี้ไว้ได้เลยครับ!`,
        postCaption: `รวม 3 เทคนิคถ่ายรูปเช็คอินเชียงใหม่ให้สวยเป๊ะแบบไม่ต้องง้อแอปแต่งรูป! 📸✨

✨ 3 ทริคแนะนำ:
• แสง Golden Hour 16:30 - 17:30 น. ละมุนที่สุด
• ใช้ระยะเลนส์ 2x ละลายหลังคมชัด
• เล่นโฟร์กราวด์ธรรมชาติ เพิ่มมิติให้ภาพ

เซฟโพสต์นี้ไว้เปิดดูตอนออกทริปได้เลยน้า! 👇`,
        hashtags: ["#ทริคถ่ายรูป", "#เที่ยวเชียงใหม่", "#ไอเดียถ่ายรูป", "#คาเฟ่เชียงใหม่"],
        visualAngle: "Medium Shot สาธิตมุมมองการถ่ายเทียบ Before & After",
        realPhotoTip: "เช็ดหน้าเลนส์ให้สะอาดก่อนถ่าย และล็อกค่าแสง (AE/AF Lock) ที่จุดใบหน้า"
      },
      {
        title: "แจกแพลน 1 วัน ตะลุยเที่ยวเชียงใหม่ เช้าจรดค่ำ งบคนละ 500 บาท!",
        hook: "มีเวลา 1 วันในเชียงใหม่ เที่ยวที่ไหนได้บ้างแบบคุ้มสุด งบหลักร้อยมีอยู่จริง!",
        concept: "แพลนวันเดย์ทริปเที่ยวเชียงใหม่แบบคุมงบ เดินทางสะดวก ได้ทั้งธรรมชาติ อาหารอร่อย และคาเฟ่",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): แพลน 1 วัน ตะลุยเที่ยวเชียงใหม่ ได้รูปเกิน 200 ใบ งบคนละ 500 บาทมีจริง!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): เริ่มแปดโมงครึ่งที่อ่างแก้ว มช. สูดอากาศบริสุทธิ์ริมอ่างน้ำ สิบเอ็ดโมงแวะกินข้าวซอยร้านเด็ด บ่ายสองไปจิบกาแฟที่คาเฟ่สไตล์มินิมอล Pluto และปิดท้ายสี่โมงครึ่งชมพระอาทิตย์ตกดินที่ดอยสุเทพ ค่าน้ำมันและค่ากินรวมแล้วหารกันไม่กี่ร้อยเอง
⏱️ 0:25 - 0:30 (Call to action): ใครมีแพลนไปเชียงใหม่ เซฟคลิปนี้ไว้ตามรอยได้เลยน้า คุ้มมาก!`,
        postCaption: `แจกแพลน 1 วันเต็ม ตะลุยเที่ยวเชียงใหม่แบบคุมงบอยู่! 🚗💨

🕒 ตารางเวลาแนะนำ:
• 08:30 น. - อ่างแก้ว มช. (รับลมเช้า ฟีลธรรมชาติ)
• 11:30 น. - ข้าวซอยรสเด็ด เติมพลังมื้อเที่ยง
• 14:00 น. - คาเฟ่ Pluto จิบกาแฟคูลๆ
• 16:30 น. - จุดชมวิวดอยสุเทพ พระอาทิตย์ตกดิน

เซฟเก็บไว้ในลิสต์เที่ยวเชียงใหม่ได้เลยน้า! ✨`,
        hashtags: ["#แพลนเที่ยวเชียงใหม่", "#เที่ยวเชียงใหม่", "#รีวิวเชียงใหม่", "#วันเดย์ทริป"],
        visualAngle: "Montage สลับ 4 สถานที่ตามลำดับเวลาเช้าจรดค่ำ",
        realPhotoTip: "เตรียมน้ำดื่มและวางแผนเส้นทางหลีกเลี่ยงช่วงรถติดในคูเมือง"
      },
      {
        title: "POV: 1 วันช้าๆ ในเชียงใหม่ หลีกหนีความวุ่นวายมาสูดอากาศบริสุทธิ์",
        hook: "POV: เมื่อคุณตัดสินใจทิ้งความเครียด แล้วนั่งรถไฟมาใช้ชีวิตช้าๆ ที่เชียงใหม่...",
        concept: "Vlog การเดินทางแบบ Slow Life ดื่มด่ำกับธรรมชาติ คาเฟ่ และวิถีชีวิตเมืองเหนืออย่างแท้จริง",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): POV: เมื่อตัดสินใจพักผ่อน แล้วพาตัวเองมาใช้ชีวิตช้าๆ ที่เชียงใหม่...
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ตื่นเช้ามาจิบกาแฟอุ่นๆ นั่งมองหมอกบางๆ ลอยผ่านยอดดอย ปั่นจักรยานเลียบถนนคูเมือง แวะคุยกับผู้คนท้องถิ่น และนั่งมองพระอาทิตย์ค่อยๆ ลับขอบฟ้า การได้หยุดพักและปล่อยให้เวลาเดินช้าลง มันช่วยเติมพลังให้เราได้ดีจริงๆ
⏱️ 0:25 - 0:30 (Call to action): หวังว่าคลิปนี้จะช่วยให้ทุกคนผ่อนคลายนะ แวะมาแชร์เมืองโปรดในคอมเมนต์ได้เลย!`,
        postCaption: `บางครั้งการเดินทางที่ดีที่สุด คือการปล่อยให้ชีวิตเดินช้าลง 🌿☕
เชียงใหม่ในวันที่ไม่ต้องเร่งรีบ มีเสน่ห์และอบอุ่นเสมอ

ส่งคลิปนี้ให้ตัวเองและคนที่อยากชวนไปพักผ่อนด้วยกันน้า 🤍`,
        hashtags: ["#slowlife", "#เที่ยวเชียงใหม่", "#ความสุข", "#พักผ่อน", "#reels"],
        visualAngle: "Cinematic Slow Motion แสงแดดยามเช้าและไอหมอกธรรมชาติ",
        realPhotoTip: "ใช้โหมด 60fps แล้วสโลว์ 0.5x บันทึกเสียงบรรยากาศธรรมชาติสดๆ"
      }
    ];
  } else if (isCar) {
    angles = [
      {
        title: "ลองขับตัวจริงแล้วฟีลลิ่งเปลี่ยน! พรีวิวการขับขี่ อัตราเร่งและช่วงล่าง",
        hook: "อย่าเพิ่งตัดสินใจซื้อรถ ถ้ายังไม่ได้ยินเสียงอัตราเร่งและฟีลลิ่งคันนี้!",
        concept: "เจาะลึกฟีลลิ่งการขับขี่ อัตราเร่ง แรงบิด และความนุ่มหนึบของช่วงล่างในการขับขี่จริง",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): อย่าเพิ่งตัดสินใจซื้อรถ ถ้ายังไม่ได้ยินเสียงอัตราเร่งและฟีลลิ่งคันนี้!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): วันนี้พามาลองขับจริงบนถนน กดคันเร่งปุ๊บแรงบิดมาทันทีหลังติดเบาะ พวงมาลัยแม่นยำเข้าโค้งมั่นใจมาก ระบบกันสะเทือนซับแรงกระแทกได้นุ่มนวล เงียบและสบายทั้งคนขับคนนั่ง
⏱️ 0:25 - 0:30 (Call to action): ใครอยากสัมผัสตัวจริง แวะมาทดลองขับได้เลยวันนี้ หรือทักแชทสอบถามคิวได้เลยครับ!`,
        postCaption: `พรีวิวฟีลลิ่งการขับขี่จริง สัมผัสสมรรถนะที่ตอบโจทย์ทุกการเดินทาง 🚗⚡
ทั้งอัตราเร่งที่สั่งได้ดั่งใจ และช่วงล่างที่นุ่มแน่นเข้าโค้งคมกริบ

📌 ไฮไลต์การขับขี่:
• อัตราเร่งตอบสนองทันที ไม่รอรอบ
• ห้องโดยสารเก็บเสียงเงียบสนิท
• ระบบช่วยเหลือการขับขี่ครบครัน มั่นใจทุกเส้นทาง

สนใจทดลองขับหรือปรึกษาข้อเสนอพิเศษ ทักแชทได้ทันทีครับ!`,
        hashtags: ["#รีวิวรถยนต์", "#ทดลองขับ", "#รถยนต์ไฟฟ้า", "#ดีลเลอร์", "#โปรโมชั่นรถ"],
        visualAngle: "Tracking shot ภายนอกรถขณะแล่นบนถนน พร้อมคัตสลับหน้าปัดความเร็ว",
        realPhotoTip: "ถ่ายช็อตหน้ารถเฉียง 45 องศา เปิดไฟ Daylight เพิ่มความดุดัน"
      },
      {
        title: "5 ฟังก์ชันลับในค็อกพิทที่หลายคนไม่รู้ กดปุ่มเดียวชีวิตง่ายขึ้นเยอะ",
        hook: "ใช้รถมาตั้งนาน เพิ่งรู้ว่าปุ่มนี้มีฟังก์ชันซ่อนอยู่แบบนี้ด้วย?!",
        concept: "แชร์เทคนิคการใช้งานฟังก์ชันอัจฉริยะในห้องโดยสารที่ช่วยเพิ่มความสะดวกสบายและปลอดภัย",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): ขับรถมาตั้งนาน รู้ไหมว่าปุ่มนี้กดค้างไว้แล้วทำแบบนี้ได้ด้วย!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ฟังก์ชันแรก แค่กดปุ่มเปิดแอร์ล่วงหน้าผ่านมือถือก่อนขึ้นรถ หมดปัญหาเบาะร้อน ทริคที่สอง ระบบ Auto Hold ที่ไม่ต้องเหยียบเบรกค้างตอนรถติดไฟแดง และยังมีโหมดสั่งการด้วยเสียงภาษาไทยที่ตอบสนองเร็วมาก
⏱️ 0:25 - 0:30 (Call to action): ชอบฟังก์ชันไหนที่สุด คอมเมนต์บอกกันหน่อยน้า เซฟไว้ลองใช้ดู!`,
        postCaption: `รวม 5 ฟังก์ชันลับในรถที่คุณอาจไม่เคยรู้มาก่อน! 💡✨
ช่วยให้การขับขี่ในชีวิตประจำวันง่ายและสะดวกขึ้นเป็นเท่าตัว

กดเซฟไว้ลองเปิดใช้งานในรถของคุณดูได้เลยครับ!`,
        hashtags: ["#ทริครถยนต์", "#สาระยานยนต์", "#เทคโนโลยีรถยนต์", "#ฟังก์ชันรถ"],
        visualAngle: "Close-up หน้าจอกลางและปุ่มควบคุมคอนโซลกลาง ชัดเจน เห็นฟังก์ชันทำงาน",
        realPhotoTip: "โฟกัสที่ปุ่มควบคุมและหน้าจอดิจิทัล คุมแสงในห้องโดยสารไม่ให้สะท้อนเงา"
      },
      {
        title: "คำนวณให้ดูจะๆ! ค่าไฟ vs ค่าน้ำมันต่อเดือน ขับไปทำงานประหยัดไปกี่บาท",
        hook: "เปลี่ยนมาใช้ EV เดือนนึงประหยัดเงินในกระเป๋าไปได้เท่าไหร่? กางตัวเลขให้ดูเลย!",
        concept: "เปรียบเทียบค่าใช้จ่ายจริงระหว่างพลังงานไฟฟ้าและน้ำมัน แสดงความคุ้มค่าแบบตรงไปตรงมา",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): เปลี่ยนมาใช้รถไฟฟ้า ประหยัดเงินในกระเป๋าได้เดือนละกี่บาท? กางตัวเลขจริงให้ดูเลย!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ขับไปกลับทำงานวันละ 40 กิโลฯ ค่าน้ำมันเฉลี่ยตกเดือนละ 4,500 บาท แต่ถ้าเป็นรถไฟฟ้าชาร์จที่บ้านช่วงมิเตอร์ TOU เสียค่าไฟแค่เดือนละ 700 บาท ประหยัดไปเกือบ 4,000 บาทต่อเดือน ปีนึงประหยัดเงินได้เกือบครึ่งแสน!
⏱️ 0:25 - 0:30 (Call to action): ใครกำลังเล็งอยู่ ทักมาขอตารางคำนวณค่างวดและค่าประหยัดได้เลยนะครับ!`,
        postCaption: `กางตัวเลขค่าใช้จ่ายจริง ค่าไฟ vs ค่าน้ำมัน 📊⚡
ความคุ้มค่าที่จับต้องได้ในระยะยาวสำหรับคนใช้รถเดินทางทุกวัน

สนใจคำนวณค่างวดหรือสอบถามแคมเปญ ทักแชทได้ตลอดเวลาครับ!`,
        hashtags: ["#รถไฟฟ้า", "#ประหยัดน้ำมัน", "#เปรียบเทียบรถ", "#ตารางผ่อนรถ"],
        visualAngle: "Medium Shot ยืนคู่กับตู้ชาร์จและหัวชาร์จไฟ พร้อมแสดงกราฟิกตัวเลขตัวโต",
        realPhotoTip: "ถ่ายช่วงที่เสียบหัวชาร์จเข้ากับตัวรถ เห็นไฟสถานะวิ่งชัดเจน"
      },
      {
        title: "1 วันเต็มกับ Road Trip ขับเที่ยวสบายไร้กังวล แวะชาร์จที่ไหนบ้างมาดู",
        hook: "ขับรถทางไกล 400 กิโลฯ เมื่อยไหม? แวะชาร์จที่ไหนบ้าง คลิปนี้มีคำตอบ!",
        concept: "Vlog การเดินทางท่องเที่ยวทางไกล โชว์ความนุ่มสบายของเบาะและการวางแผนจุดชาร์จ",
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): ขับรถทางไกล 400 กิโลฯ เมื่อยไหม ชาร์จที่ไหนบ้าง มาดู Road Trip วันนี้กัน!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ออกเดินทางตั้งแต่เช้า เปิดระบบช่วยขับ Cruise Control คุมระยะห่างให้อัตโนมัติ สบายมาก แวะพักกินกาแฟ 25 นาที ชาร์จไฟเพิ่มจาก 30% เป็น 80% พร้อมลุยต่อ สบายใจไร้กังวลเรื่องระยะทาง
⏱️ 0:25 - 0:30 (Call to action): ใครชอบทริปขับรถเที่ยวแบบนี้ กดติดตามไว้เลยนะ เดี๋ยวมีทริปต่อไปมาฝาก!`,
        postCaption: `เก็บบรรยากาศ Road Trip 1 วันเต็ม 400 กิโลฯ 🛣️🌄
พิสูจน์แล้วว่าเดินทางไกลสบาย นุ่ม เงียบ และจัดการการชาร์จได้ง่ายกว่าที่คิด

พร้อมให้คุณออกไปเปิดประสบการณ์ใหม่ได้ทุกวัน!`,
        hashtags: ["#roadtrip", "#ขับรถเที่ยว", "#ท่องเที่ยว", "#รีวิวการเดินทาง"],
        visualAngle: "Scenic Wide Shot รถแล่นผ่านวิวภูเขาและจุดแวะพักริมทาง",
        realPhotoTip: "ถ่ายช็อตตัวรถพร้อมวิวทิวทัศน์ด้านหลัง แสงแดดอุ่นๆ ขับมิติสีรถ"
      }
    ];
  } else {
    // Default / General Lifestyle / Knowledge / Shop
    const cleanTopic = extractCleanTopic(brief);
    const safeTopic25 = safeThaiTruncate(cleanTopic, 25);
    const safeTopic30 = safeThaiTruncate(cleanTopic, 30);
    angles = [
      {
        title: isVideo ? `3 ไฮไลต์ที่คุณอาจยังไม่เคยรู้เกี่ยวกับ ${safeTopic25}` : `เปิดมุมมองใหม่: ${safeTopic30}`,
        hook: `รู้หรือไม่? เรื่อง ${safeTopic25} มีจุดสำคัญที่คนส่วนใหญ่มองข้าม!`,
        concept: `เปิดประเด็นน่าสนใจ เจาะลึกมุมมองใหม่เกี่ยวกับ ${cleanTopic}`,
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): รู้หรือไม่? เรื่องนี้มีจุดสำคัญที่หลายคนไม่เคยรู้มาก่อน!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ${cleanTopic} ถ้าเข้าใจหลักการนี้แล้ว ทุกอย่างจะง่ายขึ้นทันที เริ่มจากการโฟกัสที่จุดสำคัญ จุดที่สองคือการจัดการเวลา และจุดสุดท้ายคือผลลัพธ์ที่จับต้องได้จริง
⏱️ 0:25 - 0:30 (Call to action): เซฟคลิปนี้ไว้ทบทวนได้เลยนะ หรือคอมเมนต์พูดคุยกันได้เลยครับ!`,
        postCaption: `สรุปประเด็นน่าสนใจที่คุณไม่ควรพลาด ✨
${cleanTopic}

บันทึกโพสต์นี้ไว้เปิดดูซ้ำ หรือแชร์ให้เพื่อนๆ ได้เลยน้า! 🤍`,
        hashtags: ["#สาระดีๆ", "#พัฒนาตนเอง", "#เรื่องน่ารู้", "#แชร์ต่อได้นะ"],
        visualAngle: "Medium Shot คลีนๆ ระดับสายตา แสงธรรมชาติสบายตา",
        realPhotoTip: "จัดแสงนุ่มจากหน้าต่าง โทนสีมินิมอลสบายตา"
      },
      {
        title: `3 ทริคง่ายๆ จัดการ ${safeTopic25} ให้เห็นผลเร็วที่สุด`,
        hook: `ใครกำลังเจอปัญหานี้อยู่ เซฟคลิปนี้ไว้เลย 3 ข้อง่ายๆ ทำตามได้ทันที!`,
        concept: `แก้ปัญหาด้วยเทคนิคที่นำไปปรับใช้ได้จริงแบบ Actionable Steps`,
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): ใครกำลังเจอปัญหานี้ เซฟคลิปนี้ด่วน 3 ทริคนี้ช่วยได้แน่นอน!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ขั้นตอนแรก เริ่มต้นจากสิ่งเล็กๆ ที่ทำได้ทันที ขั้นตอนที่สอง ปรับสภาพแวดล้อมให้เอื้ออำนวย และขั้นตอนที่สาม วัดผลลัพธ์ทุกสัปดาห์ ไม่ซับซ้อนแต่ได้ผลลัพธ์ชัดเจน
⏱️ 0:25 - 0:30 (Call to action): ลองเอาไปทำตามดูน้า ติดขัดตรงไหนคอมเมนต์ถามได้เลย!`,
        postCaption: `หมดปัญหาทำเท่าไหร่ก็ไม่คืบหน้า! รวม 3 ทริคทำตามง่ายที่เห็นผลจริง 📌
ลองนำไปปรับใช้ดูนะครับ รับรองว่าชีวิตง่ายขึ้นแน่นอน!`,
        hashtags: ["#ทริคดีๆ", "#ฮาวทู", "#บอกต่อ", "#tiktokความรู้"],
        visualAngle: "Close-up แสดงขั้นตอนการลงมือทำทีละสเต็ป",
        realPhotoTip: "ถ่ายภาพมุม Flatlay ให้เห็นอุปกรณ์หรือขั้นตอนอย่างเป็นระเบียบ"
      },
      {
        title: `สรุป Checklist สำคัญของ ${safeTopic25} ฉบับเข้าใจง่ายใน 1 นาที`,
        hook: `แจก Action Plan สรุปให้ครบ จบในคลิปเดียว ไม่ต้องลองผิดลองถูก!`,
        concept: `สรุปประเด็นสำคัญเป็นเช็กลิสต์ที่คุ้มค่าและนำไปใช้ได้ทันที`,
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): แจกสรุป Checklist ครบ จบในคลิปเดียว เซฟเก็บไว้ดูได้เลย!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): 3 ข้อที่ต้องเช็กก่อนลงมือทำ ข้อแรกคือความพร้อมของทรัพยากร ข้อที่สองคือเป้าหมายที่ชัดเจน และข้อที่สามคือการลงมือทำอย่างสม่ำเสมอ ทำตามนี้ไม่หลงทางแน่นอน
⏱️ 0:25 - 0:30 (Call to action): เซฟเก็บไว้เช็กตัวเอง หรือแท็กเพื่อนมาดูด้วยกันนะ!`,
        postCaption: `สรุป Action Plan Checklist สำคัญ 📋✨
ไม่ต้องเสียเวลาลองผิดลองถูก นำไปปรับใช้ได้ทันทีครับ!`,
        hashtags: ["#สรุปให้ฟัง", "#เช็กลิสต์", "#ความรู้", "#productivity"],
        visualAngle: "การ์ดข้อความกราฟิกสะอาดตา อ่านง่าย เว้นวรรคสวยงาม",
        realPhotoTip: "ใช้พื้นหลังสีคลีน ตัวอักษรสีเข้มตัดกันชัดเจน"
      },
      {
        title: `POV: ประสบการณ์จริงกับ ${safeTopic25} ที่อยากมาเล่าให้ฟัง`,
        hook: `จากคนที่ไม่เคยเข้าใจเรื่องนี้ จนกระทั่งได้มาลองทำด้วยตัวเอง...`,
        concept: `เล่าเรื่องราวจากประสบการณ์จริงแบบจริงใจ เป็นมิตร และเข้าถึงง่าย`,
        spokenScript: `🎬 บทพูดคลิป (0-30 วินาที):
⏱️ 0:00 - 0:03 (Hook เปิดคลิป): POV: เมื่อได้มาลองทำเรื่องนี้ด้วยตัวเอง บอกเลยว่าความคิดเปลี่ยนไปเลย!
⏱️ 0:03 - 0:25 (เนื้อเรื่องจริง): ตอนแรกคิดว่ายากและคงทำไม่ได้ แต่พอได้เริ่มลงมือทำทีละนิด ความกลัวก็ค่อยๆ หายไป กลายเป็นความสนุกและความมั่นใจที่เพิ่มขึ้นในทุกๆ วัน
⏱️ 0:25 - 0:30 (Call to action): ใครมีความคิดเห็นยังไง หรือเคยมีประสบการณ์คล้ายกัน แวะมาแชร์ในเมนต์ได้นะ!`,
        postCaption: `บันทึกความรู้สึกและประสบการณ์ตรง 💭✨
ทุกการเริ่มต้นอาจจะดูยาก แต่ผลลัพธ์ที่ได้คุ้มค่าเสมอครับ

เป็นกำลังใจให้ทุกคนที่กำลังเริ่มต้นน้า! 🤍`,
        hashtags: ["#เรื่องเล่า", "#แชร์ประสบการณ์", "#กำลังใจ", "#reels"],
        visualAngle: "Warm portrait shot สบตากล้องอย่างจริงใจและเป็นกันเอง",
        realPhotoTip: "ถ่ายช่วงแสงนุ่มตอนเช้า ให้บรรยากาศอบอุ่นเป็นธรรมชาติ"
      }
    ];
  }

  return Array.from({ length: count }).map((_, idx) => {
    const ep = idx + 1;
    const angleIndex = idx % angles.length;
    const angle = angles[angleIndex];

    const isIdeaVideo = isAllVideo 
      ? true 
      : isAllImage 
      ? false 
      : (idx % 2 === 1);

    const title = isSeries ? `[EP. ${ep}] ${angle.title}` : angle.title;
    const chosenFormat = isIdeaVideo 
      ? (input.videoLayoutMode === "3" ? "คลิปสั้น TikTok / Shorts 9:16 (3 ฉาก 15 วินาที)" : "วิดีโอคลิปสั้นแนวตั้ง 9:16 (Reels/TikTok/Shorts)") 
      : domainSpec.recommendedFormat;

    const fallbackBlueprint = buildDefaultMediaBlueprint(
      brandName,
      title,
      brief,
      undefined,
      isIdeaVideo ? (input.videoLayoutMode || 4) : (input.imageCountMode || 4),
      isIdeaVideo
    );

    const spokenVoiceover = extractCleanSpokenScript(angle.spokenScript);
    const cleanPostCaption = cleanCaptionText(
      isIdeaVideo
        ? `${angle.postCaption}\n\n${angle.hashtags.join(" ")}`
        : `✨ ${title}\n\n${angle.concept}\n\n${angle.postCaption}\n\n${angle.hashtags.join(" ")}`
    );

    const mediaPrompt = isIdeaVideo
      ? generateCinematicVideoPrompt(title, brandName, brief, angle.hook)
      : `Master commercial advertising photography representing ${title}, clean composition, Hasselblad 100MP, soft diffused studio lighting, shallow depth of field, 8k resolution. Typography: Features bold modern Thai typography stating: "${safeThaiTruncate(title, 30)}"`;

    return {
      id: `idea-fb-${Date.now()}-${idx}`,
      title,
      concept: angle.concept,
      hook: cleanCaptionText(angle.hook),
      target_audience: input.target_audience || "กลุ่มลูกค้าและผู้ติดตามเป้าหมาย",
      objective: isSeries ? "สร้างการติดตามต่อเนื่องและสร้าง Brand Loyalty" : "สร้างการมีส่วนร่วมและความสนใจสูงสุด",
      content_pillar: "Value & Lifestyle",
      format: chosenFormat,
      key_message: title,
      cta: isIdeaVideo ? "เซฟคลิปนี้ไว้เลย หรือแท็กเพื่อนใต้เมนต์น้า!" : "เซฟโพสต์นี้ไว้ดูซ้ำ หรือคอมเมนต์พูดคุยกันได้เลยครับ",
      status: "DRAFT",
      caption: cleanPostCaption,
      video_script: isIdeaVideo ? spokenVoiceover : undefined,
      spoken_script: isIdeaVideo ? spokenVoiceover : undefined,
      hashtags: angle.hashtags,
      media_type: isIdeaVideo ? "VIDEO" : "IMAGE",
      media_prompt: mediaPrompt,
      priority: "HIGH",
      platform: (isIdeaVideo ? "tiktok" : "facebook") as any,
      rating: 4.9,
      virality_score: "สูงมาก",
      brand_name: brandName,
      is_series: isSeries,
      episode: isSeries ? ep : undefined,
      media_blueprint: fallbackBlueprint,
      platform_captions: {
        facebook: cleanCaptionText(`🔥 ${angle.hook}\n\n${angle.postCaption}\n\n${angle.hashtags.join(" ")}`),
        tiktok: cleanCaptionText(`🔥 ${angle.hook}\n\n${spokenVoiceover}\n\n#ฟีด ${angle.hashtags.slice(0, 3).join(" ")}`),
        instagram: cleanCaptionText(`✨ ${title}\n\n${angle.concept}\n\n${angle.hashtags.join(" ")}`),
        lemon8: cleanCaptionText(`📌 สรุปเข้าใจง่าย: ${title}\n\n${angle.postCaption}\n\n#Lemon8บอกต่อ`),
        x: cleanCaptionText(`🔥 ${title}\n\n${angle.hook}\n\nอ่านต่อที่นี่ ⬇️`)
      },
      platform_prompts: {
        facebook: {
          prompt: `Master commercial advertising photography of ${title}, warm studio lighting, Hasselblad 100MP, 8k. Typography: Features bold Thai headline: "${safeThaiTruncate(title, 28)}". --ar 1:1`,
          aspect_ratio: "1:1",
          format_type: "ภาพเดี่ยว/อัลบั้ม 1:1"
        },
        tiktok: {
          prompt: isIdeaVideo
            ? mediaPrompt
            : `Cinematic 9:16 vertical video representation of ${title}, dynamic camera movement. Typography: Features bold Thai text: "${safeThaiTruncate(angle.hook, 28)}". --ar 9:16`,
          aspect_ratio: "9:16",
          format_type: "คลิปสั้นแนวตั้ง 9:16"
        },
        instagram: {
          prompt: `Aesthetic editorial photography of ${title}, minimal styling, high-end commercial grade. Typography: Features Thai title: "${safeThaiTruncate(title, 28)}". --ar 1:1`,
          aspect_ratio: "1:1",
          format_type: "ภาพสไตล์ Minimal 1:1"
        },
        lemon8: {
          prompt: `Aesthetic 3:4 infographic card of ${title}, clean magazine layout. Typography: Features Thai text: "${safeThaiTruncate(title, 28)}". --ar 3:4`,
          aspect_ratio: "3:4",
          format_type: "ภาพการ์ดความรู้ 3:4"
        },
        x: {
          prompt: `Punchy 16:9 documentary snapshot of ${title}, crisp lighting. Typography: Features Thai quote: "${safeThaiTruncate(title, 28)}". --ar 16:9`,
          aspect_ratio: "16:9",
          format_type: "ภาพแนวนอน 16:9"
        }
      },
      music_prompt: buildMusicPrompt(title, brandName, brief),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as unknown as ContentIdea;
  });
}

export async function generateContentIdeas(input: IdeaGenerationInput): Promise<ContentIdea[]> {
  const count = input.count && input.count > 0 ? input.count : 3;
  const aiEngine = input.aiEngine || "groq";
  const brief = (input.briefText || input.brief || input.topic || "โปรโมชั่นพิเศษเปิดตัวสินค้าใหม่").trim();
  const brandName = (input.brand_name || input.brand || "เพจหลัก").trim();
  const isSeries = !!input.is_series;
  const product = input.product ? input.product.trim() : "";
  const preferredMedia = input.preferredMediaType || "ALL";
  const isVideoOnly = preferredMedia === "VIDEO";
  const isImageOnly = preferredMedia === "IMAGE";
  const isAllMedia = preferredMedia === "ALL";

  const domainSpec = getDomainExpertPersona(brandName, brief, isVideoOnly);

  // Target Image Format & Count
  let targetImageCount = domainSpec.recommendedCount || 4;
  let targetImageFormat = domainSpec.recommendedFormat;
  if (input.imageCountMode === "1") {
    targetImageCount = 1;
    targetImageFormat = "ภาพเดี่ยว 1 รูป (Single Hero Shot / Poster / Single Graphic)";
  } else if (input.imageCountMode === "2") {
    targetImageCount = 2;
    targetImageFormat = "เปรียบเทียบ 2 รูป (Before & After / Side-by-Side Comparison)";
  } else if (input.imageCountMode === "3") {
    targetImageCount = 3;
    targetImageFormat = "Facebook Trio Grid 3 รูป (1 ภาพนำ + 2 ภาพเจาะลึก)";
  } else if (input.imageCountMode === "4") {
    targetImageCount = 4;
    targetImageFormat = "อัลบั้มเจาะลึก 4 รูป (4-Grid Detailed Showcase)";
  } else if (input.imageCountMode === "carousel") {
    targetImageCount = 5;
    targetImageFormat = "สไลด์ความรู้ Carousel 5-6 รูป (Lemon8 / IG Swipe / How-to)";
  }

  // Target Video Format & Scene Count (Professional Multi-Shot Uncapped: 8-20+ Scenes)
  let targetVideoSceneCount = 10;
  let targetVideoFormat = "วิดีโอระดับมืออาชีพ Multi-Angle Coverage 9:16 (ฉากไม่จำกัดตามเนื้อหาจริง 8-20+ ฉาก)";
  if (input.videoLayoutMode === "3") {
    targetVideoSceneCount = 3;
    targetVideoFormat = "คลิปสั้น TikTok / Shorts 9:16 (3 ฉาก 15 วินาที)";
  } else if (input.videoLayoutMode === "4") {
    targetVideoSceneCount = 4;
    targetVideoFormat = "สตอรี่บอร์ดวิดีโอสั้น 9:16 (4 ฉาก 15 วินาที)";
  } else if (input.videoLayoutMode === "6") {
    targetVideoSceneCount = 6;
    targetVideoFormat = "โฆษณาวิดีโอ 9:16 (6 ฉาก 20 วินาที)";
  } else if (input.videoLayoutMode === "8") {
    targetVideoSceneCount = 8;
    targetVideoFormat = "โฆษณาพรีเมียมมาตรฐาน 9:16 (8 ฉาก 30 วินาที)";
  } else if (input.videoLayoutMode === "12" || input.videoLayoutMode === "pro_12") {
    targetVideoSceneCount = 12;
    targetVideoFormat = "Professional Multi-Angle Cinema 9:16 (12 ฉาก พร้อม Insert, Zoom, Cutaway)";
  } else if (input.videoLayoutMode === "16" || input.videoLayoutMode === "pro_16") {
    targetVideoSceneCount = 16;
    targetVideoFormat = "Full Cinema Production 9:16 (16 ฉาก ฟูลโปรดักชันระดับภาพยนตร์)";
  } else if (input.videoLayoutMode === "20" || input.videoLayoutMode === "epic_20") {
    targetVideoSceneCount = 20;
    targetVideoFormat = "Epic Masterpiece Coverage 9:16 (20+ ฉาก ละเอียดสูงสุด)";
  } else if (input.videoLayoutMode === "multi_image") {
    targetVideoSceneCount = 8;
    targetVideoFormat = "วิดีโอภาพหลายมุมมองร้อยต่อกัน 9:16 (8 Keyframe Shots)";
  } else if (input.videoLayoutMode === "auto" || !input.videoLayoutMode) {
    targetVideoSceneCount = 10;
    targetVideoFormat = "AI จัดลำดับโปรดักชันจริง 9:16 (Multi-Shot Coverage ไม่จำกัดฉาก 8-20+ ฉาก)";
  } else if (Number(input.videoLayoutMode) > 0) {
    targetVideoSceneCount = Math.min(30, Math.max(1, Number(input.videoLayoutMode)));
    targetVideoFormat = `วิดีโอระดับมืออาชีพ 9:16 (${targetVideoSceneCount} ฉากตามระบุ)`;
  }

  // Dynamic Image / Video Directives
  let mediaDirective = "";
  let targetRecommendedCount: number = 4;
  let targetRecommendedFormat: string = "";

  if (isVideoOnly) {
    targetRecommendedCount = targetVideoSceneCount;
    targetRecommendedFormat = targetVideoFormat;
    mediaDirective = `\n[คำสั่งสำคัญเรื่องประเภทสื่อ - เน้นวิดีโอ 100%]:
- ผู้ใช้ต้องการคอนเทนต์แบบ 'วิดีโอ/คลิปสั้น' ทั้งหมด
- ทุกไอเดียต้องมี media_type = "VIDEO"
- format = "${targetVideoFormat}"
- platform = "tiktok" (หรือ reels/shorts)
- hook = คำพูดเปิดคลิป 0-3 วินาทีแรกที่สะกดคนดูให้อยู่หมัด
- caption = แคปชั่นสำหรับโพสต์จริงบนโซเชียล (Social Post Caption) สั้นกระชับ อ่านง่าย ชวนเซฟ/แชร์ พร้อมแฮชแท็ก (ห้ามใส่เวลา 0:00, ห้ามใส่สัญลักษณ์ ⏱️, และห้ามใส่คำว่า 'บทพูดคลิป' ในช่องแคปชั่นนี้เด็ดขาด)
- video_script = บทพูดสำหรับถ่ายทำ / พากย์เสียง (Spoken Read-Aloud Voiceover) เขียนเป็นประโยคพูดต่อเนื่องเป็นธรรมชาติ 100% สำหรับให้อ่านออกเสียงลงไมค์ (ห้ามมีเลขเวลา 0:00 และห้ามมีวงเล็บกำกับคิวฉาก)
- media_prompt = Cinematic Video Production Prompt (ภาษาอังกฤษ): ระบุกล้อง (50mm lens, Gimbal Push-in), การจัดแสง (Warm 3200K / Soft Diffused Rim Light), ช็อต B-Roll / Macro Insert Cutaways, และมาตรฐานภาพ ARRI Alexa 4K Commercial Grade พร้อมระบุ Thai Typography Overlay
- media_blueprint = ลำดับฉากวิดีโอระดับมืออาชีพ (Professional Multi-Shot Coverage) จำนวน ${targetVideoSceneCount} ฉาก:
  * ต้องครอบคลุมหลายมุมกล้องอย่างครบถ้วน:
    1. Establishing Wide Shot (เปิดมู้ดโทนและบรรยากาศ)
    2. Dynamic Medium Tracking (เคลื่อนกล้องเข้าหาตัวแบบ/การกระทำ)
    3. 🔍 Extreme Macro Insert (ซูม 100mm f/2.8 เจาะลึกดีเทล วัตถุดิบ ความฉ่ำ ลวดลาย หรือปฏิกิริยา)
    4. 📐 Kinetic Crash Zoom / Fast Zoom (ซูมเร็วเน้นจังหวะเซอร์ไพรส์หรือจุดเด่น)
    5. 🎬 Over-The-Shoulder (OTS) หรือ POV (มุมมองสายตาบุคคลที่หนึ่ง)
    6. 💡 B-Roll Detail & Atmosphere Cutaway (ละอองน้ำ ควัน แสงแดด สัมผัสธรรมชาติ)
    7. 📐 Low-Angle Dutch Tilt (มุมมองทรงพลัง น่าตื่นเต้น)
    8. 🌅 Heroic Final Reveal & Call to Action (เผยความประทับใจตอนจบ)\n`;
  } else if (isImageOnly) {
    targetRecommendedCount = targetImageCount;
    targetRecommendedFormat = targetImageFormat;
    mediaDirective = `\n[คำสั่งสำคัญเรื่องประเภทสื่อ - เน้นภาพนิ่ง 100%]:
- ผู้ใช้ต้องการคอนเทนต์แบบ 'ภาพนิ่ง/อัลบั้ม' ทั้งหมด
- ทุกไอเดียต้องมี media_type = "IMAGE"
- format = "${targetImageFormat}"
- platform = "facebook" (หรือ instagram/lemon8)
- caption = แคปชั่นสำหรับโพสต์ภาพนิ่ง/อัลบั้ม ชี้ชวนให้ดูรูปภาพในโพสต์ (Visual Anchoring เช่น 'สังเกตจากภาพแรก...', 'เลื่อนดูภาพที่ 2...') ไร้บทพูดวิดีโอ
- media_prompt = Master Commercial Photography Prompt (Hasselblad 100MP, studio lighting, crisp focus, 8k) พร้อม Thai Typography
- media_blueprint = แผนภาพนิ่งจำนวน ${targetImageCount} สไลด์/รูป พร้อมคำแนะนำการถ่ายภาพจริงด้วยมือถือ (real_photo_tip) และ prompt\n`;
  } else {
    // isAllMedia ("ALL")
    targetRecommendedCount = 4;
    targetRecommendedFormat = `ผสมผสานทั้งภาพนิ่ง (${targetImageFormat}) และวิดีโอคลิปสั้น (${targetVideoFormat})`;
    mediaDirective = `\n[คำสั่งสำคัญสูงสุดเรื่องประเภทสื่อ - โหมด 'ทั้งหมด' (BALANCED MEDIA MIX - ทั้งภาพนิ่งและวิดีโอ)]:
ผู้ใช้ระบุ: "เน้นประเภทสื่อในไอเดีย: ทั้งหมด ให้แนะนำทั้งรูปและวิดีโอด้วย"
ดังนั้นในจำนวน ${count} ไอเดียนี้ คุณต้องแนะนำทั้งแบบ 'ภาพนิ่ง/อัลบั้ม' (IMAGE) และแบบ 'วิดีโอคลิปสั้น' (VIDEO) ปนกันอย่างสมดุล:

1. สำหรับไอเดียที่เป็นภาพนิ่ง (media_type = "IMAGE"):
   - format: "${targetImageFormat}"
   - platform: "facebook" (หรือ instagram/lemon8)
   - caption: แคปชั่นโพสต์ภาพนิ่ง/อัลบั้ม ชวนดูรูปภาพในโพสต์ (Visual Anchoring) ไร้บทพูดวิดีโอ
   - media_blueprint: กำหนด slides จำนวน ${targetImageCount} รูป/สไลด์ พร้อมคำแนะนำการถ่ายจริงด้วยมือถือ (real_photo_tip) และ prompt ถ่ายภาพนิ่ง (1:1 หรือ 4:5)

2. สำหรับไอเดียที่เป็นวิดีโอคลิปสั้น (media_type = "VIDEO"):
   - format: "${targetVideoFormat}"
   - platform: "tiktok" (หรือ reels/shorts)
   - hook: คำพูดเปิดคลิป 0-3 วินาทีแรกที่สะกดคนดูให้อยู่หมัด
   - caption: แคปชั่นสำหรับโพสต์จริงบนโซเชียล (Social Post Caption) สำหรับใช้อ่านบนหน้าฟีด (ห้ามมีเวลา 0:00 หรือคำว่า บทพูดคลิป)
   - video_script: บทพูดสำหรับถ่ายทำ / พากย์เสียง (Spoken Read-Aloud Voiceover) ภาษาพูดธรรมชาติ 100% ไร้เวลา 0:00 และไร้วงเล็บกำกับคิวฉาก
   - media_prompt: Cinematic Video Production Prompt (ภาษาอังกฤษ) ระบุกล้อง เลนส์ การจัดแสง ช็อตอินเสิร์ท B-roll และมาตรฐาน ARRI Alexa 4K
   - media_blueprint: กำหนด slides เป็นลำดับฉากวิดีโอจำนวน ${targetVideoSceneCount} ฉาก (Hook, Story, Detail, CTA) พร้อม prompt วิดีโอแนวตั้ง 9:16\n`;
  }

  const systemInstruction = `You are an elite, domain-adaptive Strategic Marketing Creative Director and Viral Storyteller.
YOU MUST STRICTLY EMBODY THIS SPECIALIZED PERSONA:
- Role & Identity: ${domainSpec.persona}
- Voice & Tone: ${domainSpec.voiceTone}
- Visual-Caption Anchoring: ${domainSpec.visualRule}

CRITICAL RULES FOR 100% HUMAN CREATOR VOICE & VIDEO FORMAT:
0. PROFESSIONAL CINEMATOGRAPHY & MULTI-SHOT COVERAGE (ZERO LAZY AI SHORTCUTS):
   - The user specifically requested: "ตรงนี้ไม่ควรจำกัดว่า 1-6 ฉาก อาจจะหลายๆฉากเลยก็ได้ ขึ้นอยู่กับคอนเท้นของเราถ้ามีการถ่ายแบบมืออาชีพก็จะมีหลายฉากหลายมุมกล้องเช่น insert zoom และอื่นๆ ก็ช่วยทำให้มีหลายฉากตามนั้นด้วยเลยไม่ต้องกลัวเปลืองโทเคน อยากให้งานออกมาดูสมจริงมืออาชีพไม่เหมือนงาน AI"
   - DO NOT limit to only 3-6 scenes! Provide rich, extensive professional multi-shot coverage (${targetVideoSceneCount} scenes).
   - In professional commercial filmmaking, a sequence consists of multiple precise angles: Wide Establishing, Dynamic Tracking, 🔍 Extreme Macro Insert, 📐 Kinetic Crash Zoom, 🎬 Over-The-Shoulder (OTS), 💡 B-Roll Cutaways, and 🌅 Golden Hour Master Hero Shots.
   - Every single scene must specify a concrete physical camera angle (e.g. 50mm Prime f/1.8, 100mm Macro f/2.8), motivated lighting, real human actions, and authentic dynamics. NEVER output flat, generic 'AI template' ideas!

1. NO AI CLICHÉS OR ROBOTIC BUZZWORDS:
   - NEVER EVER write generic AI filler phrases such as:
     * "ข้อมูลเชิงลึกจากประสบการณ์ตรงที่คุณต้องรู้"
     * "การันตีความพึงพอใจและความคุ้มค่าสูงสุด"
     * "คัดสรรเนื้อหาคุณภาพระดับพรีเมียม"
     * "รายละเอียดพิมพ์ทรง" (strictly forbidden outside amulet domains)
     * "สาระน่ารู้", "ประโยชน์ที่คุณคาดไม่ถึง"
   - Use authentic, natural Thai conversational connectors (แก, ทุกคน, คือแบบว่า, บอกเลยว่า, อันนี้ประทับใจสุด, แสงฉ่ำมาก, ฟีลเกาหลี, น้าา, ปังมาก).

2. MEDIA FORMAT RULES:
${isVideoOnly ? `   - ALL ideas MUST have media_type = "VIDEO" and format = "${targetVideoFormat}".
   - Separate Post Caption (caption) and Read-Aloud Voiceover (video_script). NEVER put timecodes or script markers in caption.` : isImageOnly ? `   - ALL ideas MUST have media_type = "IMAGE" and format = "${targetImageFormat}".
   - Caption MUST have Direct Visual Anchoring referencing the photos.` : `   - USER REQUESTED 'ALL' (ทั้งหมด): Generate a BALANCED MIX of BOTH 'IMAGE' (photos/albums) and 'VIDEO' (reels/tiktok clips)!
   - At least half of the ideas MUST be media_type = "IMAGE" and the other half media_type = "VIDEO".
   - Each idea's media_type must accurately state "IMAGE" or "VIDEO".`}

3. DIVERSE CREATIVE ANGLES (EACH IDEA MUST BE COMPLETELY DIFFERENT):
   Every generated idea in the "ideas" array MUST adopt a fundamentally different creative angle tailored STRICTLY to the user's brief:
   - Idea 1: Visual Aesthetic & Secret Highlights Hook (พิกัดลับ มุมสงบ หรือจุดซิกเนเจอร์ที่น่าทึ่ง)
   - Idea 2: Practical Guide & Insider Hacks (เคล็ดลับที่ทำตามได้จริง เช่น เคล็ดลับการขอพร หรือทริคถ่ายรูป)
   - Idea 3: 1-Day Itinerary / Step-by-Step Breakdown (แพลนการเดินทางหรือขั้นตอนที่ชัดเจน มีประโยชน์สูง ชวนเซฟ)
   - Idea 4: Emotional POV & Personal Experience (POV ถ่ายทอดความรู้สึก บรรยากาศ และพลังบวกอย่างอบอุ่น)
   NEVER produce clone ideas with identical titles or hooks!

4. STRICT CAPTION RULE — NO STAGE DIRECTIONS:
   - ห้ามใส่วงเล็บ () หรือ [] กำกับท่าทาง คิวกล้อง หรือการแสดงเด็ดขาด เช่น ห้ามใส่ '(ชี้ไปที่...)', '(ยิ้ม)', '(หันหากล้อง)', '(ตัดภาพไปที่...)' ในข้อความแคปชั่น
   - ข้อความแคปชั่นต้องเป็นบทพูดและเนื้อหาที่นำไปอ่านหรือโพสต์ได้ทันที 100%

5. SPECIFIC REAL-WORLD DETAILS:
   - Strictly ground content in real places, real objects, and real steps matching the user's topic:
     * If Temple / Cultural / Buddhism: MUST specify real Chiang Mai temples (e.g. วัดอุโมงค์ สวนพุทธธรรม, วัดผาลาด สกทาคามี, วัดพระสิงห์วรมหาวิหาร, วัดเจดีย์หลวงวรวิหาร, วัดพระธาตุดอยคำ) with real cultural details and serene atmosphere.
     * If Travel / Cafe: MUST specify real places matching the specific brief with light timing (e.g. 16:00 - 17:15 น.).
     * NEVER invent or bleed over past topics (e.g. NEVER mention graduation, sweethearts, or couples unless explicitly requested in the brief!).

CRITICAL QUANTITY REQUIREMENT:
- The user requested EXACTLY ${count} distinct marketing ideas.
- The "ideas" array in your JSON output MUST contain EXACTLY ${count} separate and complete idea objects.
- It is STRICTLY FORBIDDEN to return only 1 idea or fewer than ${count} ideas!
Return a strict JSON object with key "ideas" containing an array of exactly ${count} items.`;

  const brandContext = brandName ? `แบรนด์/เพจธุรกิจ: ${brandName}` : "";
  const productContext = product ? `สินค้า/บริการ: ${product}` : "";
  const contextLines = [brandContext, productContext].filter(Boolean).join(" | ");

  const seriesInstruction = isSeries 
    ? `โหมดซีรีส์ต่อเนื่อง: ต้องสร้างเป็นมินิซีรีส์ ${count} ตอนต่อเนื่องกัน (EP.1 ถึง EP.${count}) โดยดึงประเด็นสำคัญและร้อยเรียงเรื่องราวให้คนติดตามตอนต่อไป`
    : `โหมดคอนเทนต์ทั่วไป: สร้างไอเดียที่หลากหลาย ${count} มิติ แตกต่างกันอย่างสิ้นเชิง`;

  const isLyricsOrLongText = brief.includes("\n") || brief.length > 80;
  const lyricsSpecialInstruction = isLyricsOrLongText 
    ? `\nคำสั่งสำคัญเกี่ยวกับเนื้อหา/เนื้อเพลงต้นฉบับของผู้ใช้:
ผู้ใช้ได้ระบุเนื้อเพลง / บทความยาว / ข้อมูลเจาะจงมาในบรีฟ คุณต้องเคารพและยึดถือเนื้อร้องและประเด็นนี้เป็นหัวใจสำคัญในการคิด Title, Hook, และ Caption ห้ามคิดเนื้อร้องขึ้นมาใหม่แทนที่เนื้อหาเดิมของผู้ใช้\n`
    : "";

  const customPromptInstruction = input.customPrompt && input.customPrompt.trim()
    ? `\nคำสั่งพิเศษเจาะจงจากผู้ใช้ (Custom Prompt / Directives - ให้ยึดถือเป็นคำสั่งสำคัญสูงสุด):
"${input.customPrompt.trim()}"\n`
    : "";

  const sampleItems = Array.from({ length: count }, (_, i) => `    {
      "title": "${isSeries ? `[EP. ${i + 1}] ...` : `... (ไอเดียที่ ${i + 1})`}",
      "concept": "คอนเซ็ปต์มุมมองที่ ${i + 1}...",
      "hook": "คำพูดเปิดคลิปหรือพาดหัว 0-3 วิแรก...",
      "caption": "แคปชั่นสำหรับโพสต์จริงบนหน้าฟีด (ห้ามใส่สคริปต์เวลา 0:00 หรือคำว่า 'บทพูดคลิป' ในช่องนี้เด็ดขาด)",
      "video_script": "บทพูดอ่านออกเสียงสำหรับคลิปวิดีโอ (บทพูดพากย์เสียงต่อเนื่องธรรมชาติ ห้ามมีเวลา 0:00 หรือหัวข้อกำกับคิว)",
      "hashtags": ["#..."],
      "media_type": "${isVideoOnly ? "VIDEO" : isImageOnly ? "IMAGE" : i % 2 === 1 ? "VIDEO" : "IMAGE"}",
      "media_prompt": "Cinematic production prompt in English specifying: Camera & lens (50mm f/1.8 prime), Camera movement (motorized gimbal push-in), Lighting setup (warm key light, diffused rim light), Insert/B-Roll cutaways, ARRI Alexa 4K commercial grade, and modern Thai typography overlay.",
      "format": "${targetRecommendedFormat}",
      "priority": "HIGH",
      "platform": "${isVideoOnly ? "tiktok" : isImageOnly ? "facebook" : i % 2 === 1 ? "tiktok" : "facebook"}",
      "rating": 4.9,
      "virality_score": "สูงมาก",
      "media_blueprint": {
        "count_recommended": ${targetRecommendedCount || domainSpec.recommendedCount},
        "format": "${targetRecommendedFormat}",
        "visual_direction": "คำแนะนำการจัดแสง โทนภาพ และองค์ประกอบรวม",
        "real_shoot_guide": "คำแนะนำภาพรวมสำหรับการถ่ายจริงด้วยกล้อง/มือถือในชีวิตจริง",
        "equipment_needed": "อุปกรณ์ที่แนะนำ",
        "slides": [
          {
            "slide_no": 1,
            "visual": "ฉากหรือภาพหลัก...",
            "camera_angle": "มุมกล้องที่แนะนำ",
            "real_photo_tip": "เทคนิคการถ่ายจริงด้วยมือถือ",
            "text_overlay": "พาดหัวตัวอักษรไทยบนภาพ/คลิป",
            "shoot_instruction": "คำแนะนำการถ่าย",
            "prompt": "Prompt ภาษาอังกฤษ..."
          }
        ]
      },
      "platform_captions": {
        "facebook": "Thai caption...",
        "tiktok": "Thai hook script...",
        "instagram": "Thai caption...",
        "lemon8": "Thai caption...",
        "x": "Thai tweet..."
      },
      "platform_prompts": {
        "facebook": { "prompt": "1:1 prompt...", "aspect_ratio": "1:1", "format_type": "ภาพเดี่ยว/อัลบั้ม" },
        "tiktok": { "prompt": "9:16 vertical prompt...", "aspect_ratio": "9:16", "format_type": "คลิปสั้นแนวตั้ง 9:16" },
        "instagram": { "prompt": "1:1 prompt...", "aspect_ratio": "1:1", "format_type": "ภาพเดี่ยว Minimal" },
        "lemon8": { "prompt": "3:4 prompt...", "aspect_ratio": "3:4", "format_type": "ภาพการ์ดความรู้ 3:4" },
        "x": { "prompt": "16:9 prompt...", "aspect_ratio": "16:9", "format_type": "ภาพแนวนอน 16:9" }
      }
    }`).join(",\n");

  const prompt = `CRITICAL MANDATORY INSTRUCTION: You MUST generate an array of EXACTLY ${count} distinct, high-converting marketing ideas. Do NOT return only 1 item. The "ideas" array MUST contain exactly ${count} items.

Generate exactly ${count} high-converting marketing ideas strictly based on this brief:
---
บรีฟความต้องการ / หัวข้อ: "${brief}"
${contextLines ? `${contextLines}\n` : ""}${seriesInstruction}
กลุ่มเป้าหมาย: ${input.target_audience || "กลุ่มลูกค้าและผู้ติดตามเป้าหมายที่สนใจเนื้อหานี้"}
ประเภทสื่อที่ต้องการ: ${isVideoOnly ? "เน้นวิดีโอ (VIDEO) 100%" : isImageOnly ? "เน้นภาพนิ่ง (IMAGE) 100%" : "โหมดทั้งหมด: แนะนำทั้งภาพนิ่ง (IMAGE) และวิดีโอ (VIDEO) ปนกันอย่างสมดุล"}
${lyricsSpecialInstruction}${mediaDirective}${customPromptInstruction}---

Return JSON format with EXACTLY ${count} elements in the "ideas" array:
{
  "ideas": [
${sampleItems}
  ]
}`;

  try {
    let resultData: any = null;
    let failoverData: FailoverMeta = { isFailover: false };
    if (aiEngine === "groq") {
      const groqRes = await callGroq({
        systemInstruction,
        prompt,
        workflow: "Idea Agent (Groq Cloud Qwen 3.8)",
        responseSchema: true
      });
      resultData = groqRes.data;
      failoverData = {
        isFailover: !!groqRes.isFailover,
        failoverReason: groqRes.failoverReason,
        providerUsed: groqRes.providerUsed,
        modelUsed: groqRes.modelUsed
      };
    } else if (aiEngine === "chatgpt") {
      const gptRes = await callChatGPT({
        systemInstruction,
        prompt,
        workflow: "Idea Agent (ChatGPT)",
        responseSchema: true
      });
      resultData = gptRes.data;
      failoverData = {
        isFailover: !!gptRes.isFailover,
        failoverReason: gptRes.failoverReason,
        providerUsed: gptRes.providerUsed,
        modelUsed: gptRes.modelUsed
      };
    } else {
      const geminiRes = await callGemini({
        systemInstruction,
        prompt,
        workflow: "Idea Agent (Gemini 3.8 Flash - High Reasoning)",
        model: "gemini-3.8-flash",
        reasoningEffort: "high",
        responseSchema: true
      });
      resultData = geminiRes.data;
      failoverData = {
        isFailover: !!geminiRes.isFailover,
        failoverReason: geminiRes.failoverReason,
        providerUsed: geminiRes.providerUsed,
        modelUsed: geminiRes.modelUsed
      };
    }

    lastFailoverMeta = failoverData;

    if (resultData && resultData.ideas && Array.isArray(resultData.ideas) && resultData.ideas.length > 0) {
      // Auto-supplement if model returned fewer ideas than requested count
      while (resultData.ideas.length < count) {
        const base = resultData.ideas[0];
        const nextNo = resultData.ideas.length + 1;
        const cleanTopicName = extractCleanTopic(brief);
        
        const variants = [
          {
            title: isSeries ? `[EP. ${nextNo}] เคล็ดลับ & ทริคเด็ด: ${cleanTopicName}` : `มุมมองที่ 2 (เคล็ดลับลับ): สิ่งที่หลายคนไม่เคยรู้เกี่ยวกับ ${cleanTopicName}`,
            concept: `นำเสนอในมุมมองที่ ${nextNo}: เคล็ดลับเชิงลึกและข้อควรระวังสำหรับ ${cleanTopicName} ที่ทำตามได้ทันทีและช่วยประหยัดเวลา/เงิน`,
            hook: `รู้หรือไม่? ความลับสำคัญของ ${cleanTopicName} ที่คนส่วนใหญ่ไม่เคยสังเกต...`,
            caption: `✨ 3 เคล็ดลับเด็ดที่คุณต้องรู้เกี่ยวกับ ${cleanTopicName}\n\nเซฟโพสต์นี้ไว้ดูทีหลังได้เลยครับ!\n\n${(base.hashtags || []).join(" ")}`,
            video_script: `รู้หรือไม่ว่าความลับของ ${cleanTopicName} อยู่ที่ตรงนี้? วันนี้ผมสรุป 3 เทคนิคเด็ดมาให้แล้ว ลองทำตามนี้ดูนะครับ`,
            isVid: true
          },
          {
            title: isSeries ? `[EP. ${nextNo}] รีวิวจากประสบการณ์จริง: ${cleanTopicName}` : `รีวิวแบบหมดเปลือก: จุดเด่น vs จุดสังเกตของ ${cleanTopicName}`,
            concept: `นำเสนอในมุมมองที่ ${nextNo}: รีวิวจากประสบการณ์จริงแบบเจาะลึก เน้นความจริงใจ สร้างความน่าเชื่อถือและตอบข้อสงสัยของลูกค้า`,
            hook: `ถ้ากำลังตัดสินใจเรื่อง ${cleanTopicName} ฟังทางนี้ก่อนตัดสินใจ!`,
            caption: `📌 รีวิวเจาะลึก ${cleanTopicName} แบบตรงไปตรงมา ดีจริงไหม คุ้มค่าแค่ไหน มาดูกันครับ\n\n${(base.hashtags || []).join(" ")}`,
            video_script: `ก่อนที่คุณจะเลือก ${cleanTopicName} คลิปนี้มีคำตอบให้ครบ สรุปข้อดีข้อเสียแบบชัดเจนใน 15 วินาที`,
            isVid: false
          },
          {
            title: isSeries ? `[EP. ${nextNo}] สรุป Checklist ทีละขั้นตอน: ${cleanTopicName}` : `รวม Checklist & สรุปขั้นตอนทำตามง่าย: ${cleanTopicName}`,
            concept: `นำเสนอในมุมมองที่ ${nextNo}: Checklist แพลนทีละสเต็ป เข้าใจง่าย ชวนกดแชร์และเซฟเก็บไว้ดู`,
            hook: `แจกฟรี! สรุปเช็กลิสต์สำคัญสำหรับ ${cleanTopicName} ครบจบในโพสต์เดียว`,
            caption: `🔥 รวมทุกขั้นตอนสำคัญของ ${cleanTopicName} ทำตามได้ทีละสเต็ป เซฟไว้เปิดดูได้ตลอดครับ\n\n${(base.hashtags || []).join(" ")}`,
            video_script: `อยากเริ่มต้นกับ ${cleanTopicName} ต้องเตรียมตัวยังไงบ้าง? บันทึกคลิปนี้ไว้ แล้วทำตามทีละข้อได้เลย!`,
            isVid: true
          },
          {
            title: isSeries ? `[EP. ${nextNo}] เปรียบเทียบ Before & After: ${cleanTopicName}` : `เปรียบเทียบชัดๆ: ความต่างก่อนและหลังของ ${cleanTopicName}`,
            concept: `นำเสนอในมุมมองที่ ${nextNo}: เปรียบเทียบความแตกต่างเพื่อตอกย้ำคุณค่าและความคุ้มค่า`,
            hook: `เทียบให้เห็นจะๆ ว่าทำไมอันนี้ถึงปังกว่าอย่างเห็นได้ชัด!`,
            caption: `✨ ผลลัพธ์ที่แตกต่างของ ${cleanTopicName} ดูจากภาพได้เลยครับ ชัดเจนมาก!\n\n${(base.hashtags || []).join(" ")}`,
            video_script: `ดูความแตกต่างตรงนี้สิครับ ก่อนและหลังต่างกันอย่างสิ้นเชิง นี่คือเหตุผลที่คุณต้องลอง`,
            isVid: false
          }
        ];

        const v = variants[(nextNo - 2) % variants.length];
        const isVid = isVideoOnly ? true : isImageOnly ? false : v.isVid;

        resultData.ideas.push({
          ...base,
          title: v.title,
          concept: v.concept,
          hook: v.hook,
          caption: v.caption,
          video_script: v.video_script,
          media_type: isVid ? "VIDEO" : "IMAGE",
          format: isVid ? targetVideoFormat : targetImageFormat,
          platform: isVid ? "tiktok" : "facebook",
          priority: "HIGH",
          rating: 4.8,
          virality_score: "สูงมาก"
        });
      }

      if (isAllMedia && resultData.ideas.length >= 2) {
        const hasVideo = resultData.ideas.some((it: any) => 
          it.media_type === "VIDEO" || it.format?.includes("คลิป") || it.format?.includes("วิดีโอ")
        );
        const hasImage = resultData.ideas.some((it: any) => 
          it.media_type === "IMAGE" || (!it.format?.includes("คลิป") && !it.format?.includes("วิดีโอ"))
        );

        if (!hasVideo || !hasImage) {
          resultData.ideas.forEach((it: any, i: number) => {
            if (i % 2 === 1) {
              it.media_type = "VIDEO";
              if (!it.format?.includes("คลิป") && !it.format?.includes("วิดีโอ")) {
                it.format = targetVideoFormat;
              }
              if (!it.platform || it.platform === "facebook") {
                it.platform = "tiktok";
              }
            } else {
              it.media_type = "IMAGE";
              if (it.format?.includes("คลิป") || it.format?.includes("วิดีโอ")) {
                it.format = targetImageFormat;
              }
              if (!it.platform || it.platform === "tiktok") {
                it.platform = "facebook";
              }
            }
          });
        }
      }

      return resultData.ideas.map((idea: any, idx: number) => {
        const episodeNum = idx + 1;
        const cleanBrief = extractCleanTopic(brief);
        const safeBrief30 = safeThaiTruncate(cleanBrief, 30);
        const rawTitle = idea.title ? cleanCaptionText(idea.title) : "";
        const defaultTitle = isSeries 
          ? `[EP. ${episodeNum}] ${rawTitle.replace(/^\[EP\.\s*\d+\]\s*/i, "") || `บทเรียนตอนที่ ${episodeNum}: ${safeBrief30}`}`
          : (rawTitle || `ไอเดียคอนเทนต์ #${episodeNum}: ${safeBrief30}`);

        let isVideo = false;
        if (isVideoOnly) {
          isVideo = true;
        } else if (isImageOnly) {
          isVideo = false;
        } else {
          isVideo = idea.media_type === "VIDEO" || idea.format?.includes("คลิป") || idea.format?.includes("วิดีโอ") || (idx % 2 === 1 && idea.media_type !== "IMAGE");
        }

        const cleanVoiceover = isVideo
          ? extractCleanSpokenScript(idea.video_script || idea.spoken_script || idea.caption || "")
          : undefined;

        const cleanSocialCaption = cleanCaptionText(
          idea.caption || (isVideo 
            ? `✨ ${defaultTitle}\n\n${idea.concept || cleanBrief}\n\n${(idea.hashtags || []).join(" ")}`
            : `✨ ${defaultTitle}\n\n${idea.concept || cleanBrief}\n\n${(idea.hashtags || []).join(" ")}`
          )
        );

        const fallbackCaptions = {
          facebook: cleanSocialCaption,
          tiktok: cleanCaptionText(`🔥 ${idea.hook || defaultTitle}!\n\n${cleanVoiceover || idea.concept || cleanBrief}\n\n#ฟีด ${(idea.hashtags || []).slice(0, 3).join(" ")}`),
          instagram: cleanCaptionText(`✨ ${defaultTitle}\n\n${idea.concept || cleanBrief}\n\n${(idea.hashtags || []).slice(0, 4).join(" ")}`),
          lemon8: cleanCaptionText(`📌 How-to สรุปเข้าใจง่าย: ${defaultTitle}\n\n${idea.concept || cleanBrief}\n\nเซฟเก็บไว้ลองทำตามดูนะทุกคน! ✨ #Lemon8บอกต่อ`),
          x: cleanCaptionText(`🔥 ${defaultTitle}\n\n${idea.hook || safeThaiTruncate(cleanBrief, 100)}\n\nอ่านต่อที่นี่ ⬇️`)
        };

        const chosenFormat = isVideo 
          ? (idea.format?.includes("คลิป") || idea.format?.includes("วิดีโอ") ? idea.format : targetVideoFormat)
          : (idea.format && !idea.format.includes("คลิป") && !idea.format.includes("วิดีโอ") ? idea.format : targetImageFormat);

        const blueprintCount = isVideo ? targetVideoSceneCount : targetImageCount;
        const blueprintInput = isVideo ? input.videoLayoutMode : input.imageCountMode;

        const safeDefaultTitle28 = safeThaiTruncate(defaultTitle, 28);
        const safeHook28 = safeThaiTruncate(idea.hook || defaultTitle, 28);

        const productionPrompt = isVideo
          ? (idea.media_prompt && idea.media_prompt.length > 80 
              ? idea.media_prompt 
              : generateCinematicVideoPrompt(defaultTitle, brandName, brief, idea.hook))
          : (idea.media_prompt || `Master commercial advertising photography representing ${defaultTitle}, clean composition, Hasselblad 100MP, soft diffused studio lighting, shallow depth of field, 8k resolution. Typography: Features bold modern Thai typography stating: "${safeDefaultTitle28}".`);

        return {
          id: `idea-${Date.now()}-${idx}`,
          title: defaultTitle,
          concept: idea.concept || brief,
          hook: cleanCaptionText(idea.hook || `${safeThaiTruncate(cleanBrief, 35)} มีจุดสำคัญที่คุณต้องรู้!`),
          caption: cleanSocialCaption,
          video_script: cleanVoiceover,
          spoken_script: cleanVoiceover,
          hashtags: Array.isArray(idea.hashtags) && idea.hashtags.length > 0 ? idea.hashtags : ["#คอนเทนต์สร้างสรรค์", "#แชร์ต่อได้นะ"],
          media_type: isVideo ? "VIDEO" : "IMAGE",
          media_prompt: productionPrompt,
          target_audience: input.target_audience || "กลุ่มลูกค้าและผู้ติดตามเป้าหมาย",
          objective: isSeries ? "สร้างการติดตามต่อเนื่องและสร้าง Brand Loyalty" : "สร้างความสนใจและยอดขาย",
          content_pillar: isSeries ? "Series & Education" : "Product & Lifestyle",
          format: chosenFormat,
          priority: idea.priority || "HIGH",
          platform: (idea.platform as any) || (isVideo ? "tiktok" : "facebook"),
          rating: typeof idea.rating === "number" ? idea.rating : 4.9,
          virality_score: idea.virality_score || "สูงมาก",
          brand_name: brandName,
          is_series: isSeries,
          episode: isSeries ? episodeNum : undefined,
          media_blueprint: buildDefaultMediaBlueprint(
            brandName,
            defaultTitle,
            brief,
            idea.media_blueprint,
            blueprintInput || blueprintCount,
            isVideo
          ),
          platform_captions: (() => {
            const raw = idea.platform_captions || fallbackCaptions;
            const cleaned: Record<string, string> = {};
            for (const [k, v] of Object.entries(raw)) {
              cleaned[k] = cleanCaptionText(String(v));
            }
            return cleaned;
          })(),
          platform_prompts: idea.platform_prompts || {
            facebook: {
              prompt: `Master commercial 1:1 square advertising photography representing ${defaultTitle}, warm studio lighting, 8k photorealistic. Typography: Features bold modern Thai typography headline stating: "${safeDefaultTitle28}" in clean elegant font. --ar 1:1`,
              aspect_ratio: "1:1",
              format_type: "ภาพอัลบั้ม/ภาพเดี่ยว 1:1"
            },
            tiktok: {
              prompt: isVideo ? productionPrompt : `Cinematic 9:16 vertical 4K dynamic video representation of ${defaultTitle}, dynamic camera movement, shallow depth of field. Typography: Features bold vibrant Thai typography overlay stating: "${safeHook28}" in center third. --ar 9:16`,
              aspect_ratio: "9:16",
              format_type: "คลิปสั้นแนวตั้ง 9:16"
            },
            instagram: {
              prompt: `Minimalist aesthetic 1:1 editorial photography of ${defaultTitle}, diffused soft daylight, beige tones, high fashion finish. Typography: Features elegant Thai typography badge stating: "${safeDefaultTitle28}". --ar 1:1`,
              aspect_ratio: "1:1",
              format_type: "ภาพสไตล์ Minimal 1:1"
            },
            lemon8: {
              prompt: `Aesthetic 3:4 portrait infographic styled flatlay editorial photography of ${defaultTitle}, cozy warm lighting, clean organized composition. Typography: Features educational Thai title stating: "${safeDefaultTitle28}". --ar 3:4`,
              aspect_ratio: "3:4",
              format_type: "ภาพการ์ดความรู้ 3:4"
            },
            x: {
              prompt: `Punchy 16:9 landscape documentary snapshot of ${defaultTitle}, bold high contrast, 8k resolution. Typography: Features bold journalistic Thai quote stating: "${safeHook28}". --ar 16:9`,
              aspect_ratio: "16:9",
              format_type: "ภาพสแน็ปแนวนอน 16:9"
            }
          },
          music_prompt: idea.music_prompt || buildMusicPrompt(defaultTitle, brandName, brief),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as unknown as ContentIdea;
      });
    }

    throw new Error("No ideas array returned by AI");
  } catch (error) {
    console.warn("External AI call was bypassed or quota exhausted, generating domain-curated ideas via Built-in Zero-Quota Engine:", error);
    lastFailoverMeta = {
      isFailover: true,
      failoverReason: lastFailoverMeta.failoverReason || "โควต้า API หลักหมดลง ระบบสลับมาใช้ Built-in Zero-Quota Engine อัตโนมัติ เพื่อให้ได้คอนเทนต์คุณภาพสูงตรงหัวข้อโดยไม่สะดุด 100%",
      providerUsed: "local-engine",
      modelUsed: "Built-in Zero-Quota Engine"
    };
    return buildDomainFallbackIdeas(input, domainSpec, count);
  }
}
