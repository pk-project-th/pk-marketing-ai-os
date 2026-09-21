import { ContentAsset } from "@/types";

export const DEMO_ASSETS: ContentAsset[] = [
  {
    id: "asset-001",
    idea_id: "idea-001",
    campaign_id: "camp-001",
    framework: "PAS",
    caption_short: "🚗 เงินเดือน 35,000 อยากออกรถใหม่ แต่กลัวแบกค่าน้ำมันกับค่างวดไม่ไหว? PK Sedan X ออกแบบมาเพื่อคนทำงานเมือง ผ่อนเริ่มต้นวันละ 300 บ. ประหยัดน้ำมันถึง 26.5 กม./ลิตร!",
    caption_long: "หลายคนถามเข้ามาเยอะมากครับว่า 'ถ้าเงินเดือน 35,000 บาท แต่อยากได้รถยนต์ไฮบริดดีไซน์สวย เทคโนโลยีครบ จะตึงเกินไปไหม?'\n\nวันนี้เราถอดตัวเลขจริงมาให้ดูกันแบบหมดเปลือก:\n\n1. ค่างวดผ่อนสบาย: ดาวน์ 25% ผ่อน 84 เดือน เริ่มต้นเพียงเดือนละ 9,xxx บาท (ตกวันละประมาณ 300 กว่าบาท)\n2. ค่าน้ำมันสุดประหยัด: ด้วยเครื่องยนต์ 1.5L Turbo Hybrid วิ่งในเมือง 26.5 กม./ลิตร เติมน้ำมัน 1 ถัง วิ่งได้เกือบ 900 กิโลเมตร เฉลี่ยกิโลเมตรละไม่ถึง 1.4 บาท!\n3. ฟรีค่าบำรุงรักษา: รับประกันระบบไฮบริดและแบตเตอรี่นาน 8 ปีเต็ม ฟรีค่าแรงเช็กระยะ 5 ปี",
    cta: "👉 สนใจคำนวณค่างวดตามงบของคุณ หรือรับข้อเสนอพิเศษงาน Motor Show ทักแชทหาเราตอนนี้เลย!",
    hashtags: ["#PKSedanX", "#รถยนต์ไฮบริด", "#รถคันแรก", "#รีวิวรถยนต์", "#PKAuto", "#ผ่อนสบาย"],
    script_hook: "ถ้าคุณเงินเดือนสามหมื่นห้า แล้วมีคนบอกว่าคุณขับรถไฮบริดป้ายแดงไม่ได้... ให้ดูคลิปนี้ครับ!",
    script_intro: "วันนี้ผมเอาสมุดบัญชีกับตารางผ่อนของ PK Sedan X ตัวท็อปมาเปิดให้ดูกันชัดๆ หมัดต่อหมัด",
    script_body: "ข้อแรก ค่างวดเฉลี่ยวันละสามร้อยบาท ข้อสอง ค่าเติมน้ำมันต่อเดือนลดลงไปเกือบครึ่ง เพราะระบบไฮบริดรุ่นนี้แตะยี่สิบหกกิโลเมตรต่อลิตรในเมือง และข้อสาม แบตเตอรี่รับประกันยาวแปดปี",
    script_proof: "ลูกค้าของเรากว่าเจ็ดสิบเปอร์เซ็นต์เป็นคนทำงานรุ่นใหม่อายุยี่สิบปลายๆ ที่คำนวณแล้วว่า คุ้มกว่าค่าเดินทางแบบเดิม",
    script_cta: "อยากรู้ว่าเงินเดือนของคุณจัดไฟแนนซ์ผ่านง่ายแค่ไหน แตะลิงก์ในโปรไฟล์มาปรึกษาทีมงานได้ฟรีเลยครับ",
    video_scenes: [
      {
        timestamp: "00:00 - 00:05",
        scene: "Scene 1: Hook",
        visual: "พิธีกรยืนข้าง PK Sedan X สีขาว กำลังโบกมือปฏิเสธ พร้อมกราฟิก 'เงินเดือน 35K ขับไม่ได้จริงดิ?'",
        dialogue: "ถ้าคุณเงินเดือนสามหมื่นห้า แล้วมีคนบอกว่าคุณขับรถไฮบริดป้ายแดงไม่ได้... ให้ดูคลิปนี้ครับ!",
        on_screen_text: "เงินเดือน 35,000 ออกได้จริงไหม?",
        camera_direction: "Medium close-up ดอลลี่เข้าหาพิธีกรอย่างรวดเร็ว",
        sound_suggestion: "เสียง Whoosh กระแทกอารมณ์ + จังหวะบีตชัด"
      },
      {
        timestamp: "00:05 - 00:15",
        scene: "Scene 2: Problem & Budget Breakdown",
        visual: "ภาพกราฟิกแท็บเล็ตแสดงสลิปเงินเดือนและตารางแจกแจงค่าใช้จ่าย ค่างวด ผ่อนวันละ 300 บาท",
        dialogue: "หลายคนกลัวว่าผ่อนรถแล้วจะหมดตัว แต่ถ้าเฉลี่ยต่อวันตกแค่วันละสามร้อยบาท เท่ากับกาแฟสองแก้วเท่านั้น",
        on_screen_text: "ผ่อนเริ่มต้น ~300 บาท/วัน",
        camera_direction: "Over-the-shoulder shot โฟกัสไปที่หน้าจอ",
        sound_suggestion: "เสียงเอฟเฟกต์เครื่องคิดเลข Cash register"
      },
      {
        timestamp: "00:15 - 00:30",
        scene: "Scene 3: Real City Fuel Economy",
        visual: "มุมมองคนขับบนถนนสุขุมวิท หน้าปัดเรือนไมล์ดิจิทัลโชว์ตัวเลข 26.5 km/L สีเขียว",
        dialogue: "ยิ่งขับในเมือง ยิ่งประหยัด ด้วยระบบไฮบริดอัจฉริยะ เติมน้ำมันถังเดียววิ่งได้เกือบเก้าร้อยกิโลเมตร",
        on_screen_text: "ประหยัดสูงสุด 26.5 กม./ลิตร!",
        camera_direction: "POV shot มองจากเบาะหลังเห็นพวงมาลัยและหน้าปัด OLED",
        sound_suggestion: "เสียงเครื่องยนต์ไฮบริดเดินเงียบกริบ"
      },
      {
        timestamp: "00:30 - 00:45",
        scene: "Scene 4: Call to Action",
        visual: "พิธีกรเปิดประตูก้าวลงจากรถอย่างมั่นใจ ยิ้มให้กล้อง พร้อมแสดง QR Code",
        dialogue: "อยากรู้ว่าสิทธิพิเศษเดือนนี้ได้อะไรเพิ่มบ้าง แตะลิงก์หน้าโปรไฟล์มาทดลองขับเลยครับ!",
        on_screen_text: "ทดลองขับฟรีวันนี้! รับบัตรเติมน้ำมัน 2,000 บ.",
        camera_direction: "Wide shot ถอยกว้างเห็นตัวรถเต็มคัน",
        sound_suggestion: "ดนตรีท่อนฮุกปิดท้ายหนักแน่น"
      }
    ],
    creative_brief: {
      id: "brief-001",
      idea_id: "idea-001",
      creative_concept: "Smart Urban Lifestyle — พรีเมียม ทันสมัย คุ้มค่าทางการเงิน",
      visual_direction: "แสงธรรมชาติยามเย็น Golden Hour สะท้อนเส้นสายตัวถังรถยนต์ในฉากหลังตึกสูงกรุงเทพฯ",
      mood: "Modern, Confident, Welcoming, Financially Smart",
      composition: "ตัวรถตั้งเฉียง 45 องศา Rule of Thirds",
      subject: "PK Sedan X สี Glacier White พร้อมคนทำงานรุ่นใหม่",
      environment: "ลานจอดรถ Rooftop ใจกลางเมือง เห็นตึกระฟ้า",
      lighting: "Cinematic Warm Golden Hour ผสม Rim Light สีฟ้าอ่อน",
      typography_direction: "ฟอนต์ Sans-serif สไตล์โมเดิร์น ตัวหนาชัดเจน",
      color_direction: "Deep Navy Blue (#0F172A), Tech Blue (#3B82F6), Pure White",
      negative_space: "เว้นพื้นที่ว่าง 30% ด้านบนขวาสำหรับใส่พาดหัว",
      aspect_ratio: "16:9",
      image_prompt: "Commercial automotive photography of a sleek pearl white modern hybrid sedan parked on an urban rooftop at golden hour, Bangkok skyline in background, cinematic warm lighting, clean reflections, 8k resolution, shot on 50mm lens --ar 16:9",
      negative_prompt: "blurry, low quality, oversaturated, deformed car parts, extra wheels, cartoon",
      created_at: "2026-09-02T10:05:00Z"
    },
    status: "APPROVED",
    confidence: 0.98,
    warnings: [],
    created_at: "2026-09-02T10:05:00Z",
    updated_at: "2026-09-02T10:05:00Z"
  },
  {
    id: "asset-002",
    idea_id: "idea-002",
    campaign_id: "camp-001",
    framework: "HVPC",
    caption_short: "ติดไฟแดงสาทร 2 ชม. แต่ขาไม่ล้า? 3 ปุ่มใน PK Sedan X ที่คนขับรถติดในเมืองต้องหลงรัก Auto Brake Hold, แอร์กรอง PM2.5 และเบาะนวดผ่อนคลาย!",
    caption_long: "ใครที่ต้องขับรถผ่านถนนสาทร พระราม 4 หรือลาดพร้าวช่วงเลิกงานจะเข้าใจดีว่า การเหยียบเบรกค้างไว้ 10 นาทีมันเมื่อยขาขนาดไหน...\n\nใน PK Sedan X เราติดตั้ง 3 ผู้ช่วยที่เปลี่ยนความทรมานในรถติดให้กลายเป็นช่วงเวลาพักผ่อน:\n1. Auto Brake Hold นุ่มนวล ไม่ต้องคอยเหยียบเบรกค้าง\n2. ระบบแอร์ฟอกอากาศ Plasma Cluster กรองฝุ่น PM2.5 ภายใน 3 นาที\n3. เบาะนวดไฟฟ้าคู่หน้า ปรับได้ 4 รูปแบบ\n\nเพราะเรารู้ว่าเวลาของคุณมีค่า แม้ในวันที่การจราจรไม่เป็นใจ",
    cta: "มาลองสัมผัสความสบายด้วยตัวคุณเอง ลงทะเบียนทดลองขับฟรีคลิกเลย",
    hashtags: ["#PKSedanX", "#รถติด", "#รีวิวรถ", "#TechComfort", "#PKAuto"],
    script_hook: "ถ้าคุณต้องติดไฟแดงวันละ 2 ชั่วโมง... นี่คือ 3 ปุ่มที่คุณจะกดขอบคุณวิศวกรทุกวัน!",
    script_intro: "ชั่วโมงเร่งด่วนบนถนนสาทร วันนี้ผมจะพามาดูว่า ทำไมคนขับ PK Sedan X ถึงไม่หงุดหงิดเวลารถติด",
    script_body: "ปุ่มแรก Auto Brake Hold หยุดรถสนิทปล่อยเท้าได้เลย ปุ่มที่สอง ระบบกรองอากาศดักจับควันไอเสียและ PM2.5 ทันที และปุ่มที่สาม เบาะนวดหลังไฟฟ้าที่ผ่อนคลายกล้ามเนื้อ",
    script_proof: "ผลทดสอบระบบแอร์พบว่าสามารถลดระดับฝุ่น PM2.5 จากสีแดงเหลือสีเขียวได้ในเวลาไม่ถึง 3 นาที",
    script_cta: "อยากลองนั่งดูสักครั้ง กดนัดหมายทดลองขับได้เลยวันนี้",
    video_scenes: [
      {
        timestamp: "00:00 - 00:05",
        scene: "Scene 1: Traffic Jam POV",
        visual: "มุมมองผ่านกระจกหน้ารถเห็นไฟท้ายรถติดสีแดงยาวเหยียดบนถนนสาทร",
        dialogue: "ถ้าคุณต้องติดไฟแดงวันละ 2 ชั่วโมง... นี่คือ 3 ปุ่มที่คุณจะกดขอบคุณวิศวกรทุกวัน!",
        on_screen_text: "รถติด 2 ชม. แก้ได้ด้วย 3 ปุ่มนี้!",
        camera_direction: "POV มองตรงไปที่ถนน",
        sound_suggestion: "เสียงแตรรถและบรรยากาศจราจรเบาๆ"
      },
      {
        timestamp: "00:05 - 00:20",
        scene: "Scene 2: Button Demo",
        visual: "นิ้วกดปุ่ม Auto Brake Hold ไฟเขียวขึ้นที่หน้าปัด ผู้ขับขี่ยกเท้าออกจากแป้นเบรกอย่างสบายใจ",
        dialogue: "ปุ่มแรก ปล่อยเท้าได้เลย รถไม่ไหล ปุ่มที่สอง แอร์ฟอกอากาศบริสุทธิ์ และปุ่มที่สาม เบาะนวดไฟฟ้า",
        on_screen_text: "1. Auto Brake Hold | 2. PM2.5 Filter | 3. Massage Seat",
        camera_direction: "Macro shot โฟกัสที่นิ้วกดปุ่มคอนโซลกลาง",
        sound_suggestion: "เสียง Click นุ่มนวลแบบพรีเมียม"
      }
    ],
    creative_brief: {
      id: "brief-002",
      idea_id: "idea-002",
      creative_concept: "Sanctuary in the City — ห้องโดยสารคือโอเอซิสท่ามกลางความวุ่นวาย",
      visual_direction: "โทนสีอบอุ่นภายในห้องโดยสาร ตัดกับไฟถนนยามค่ำคืนภายนอก",
      mood: "Peaceful, Relaxing, High-tech, Cozy",
      composition: "Interior close-up เบาะหนังแท้และการจัดไฟ Ambient Light 64 สี",
      subject: "ผู้ขับขี่กำลังผ่อนคลาย ยิ้มสบายๆ มือวางบนพวงมาลัย",
      environment: "ถนนใจกลางเมืองยามค่ำคืน ฝนตกปรอยๆ มีโบเก้แสงไฟภายนอก",
      lighting: "Ambient lighting สีฟ้า Ice Blue ภายในห้องโดยสาร และแสงไฟสตรีทไลท์สีส้มสะท้อนกระจก",
      typography_direction: "ฟอนต์มินิมอล โมเดิร์น",
      color_direction: "Warm Amber, Neon Bokeh, Deep Black Interior",
      negative_space: "พื้นที่ว่างด้านซ้าย 40%",
      aspect_ratio: "9:16",
      image_prompt: "Moody atmospheric interior automotive shot of a luxury modern sedan cabin at night, soft ambient blue LED lighting, rainy window with city bokeh outside, elegant nappa leather seat, clean focus, 8k --ar 9:16",
      negative_prompt: "blurry, chaotic, messy, low resolution",
      created_at: "2026-09-03T09:35:00Z"
    },
    status: "AI_GENERATED",
    confidence: 0.95,
    warnings: [],
    created_at: "2026-09-03T09:35:00Z",
    updated_at: "2026-09-03T09:35:00Z"
  }
];
export const ADDITIONAL_ASSETS: ContentAsset[] = [
  {
    id: "asset-003",
    idea_id: "idea-003",
    campaign_id: "camp-001",
    framework: "FAB",
    caption_short: "กรุงเทพฯ - พัทยา ถังเดียวเหลือเท่าไหร่? รีวิวทดสอบจริง 26.5 กม./ลิตร ของ PK Sedan X วิ่งจริง เปิดแอร์ฉ่ำ คนนั่งเต็มคัน!",
    caption_long: "ไม่ต้องเชื่อตัวเลขในโบรชัวร์ แต่มาดูการทดสอบจริงวิ่งจากสยามพารากอนมุ่งหน้าแหลมบาลีฮาย พัทยา ไป-กลับ ระยะทางรวมกว่า 320 กิโลเมตร...\n\nผลลัพธ์ปรากฏว่า เข็มน้ำมันแทบไม่ขยับ และหน้าจอคำนวณเฉลี่ยทำได้ถึง 25.8 กม./ลิตร!",
    cta: "ดูคลิปเต็ม 10 นาทีบน YouTube แล้วลงชื่อทดลองขับได้เลย",
    hashtags: ["#PKSedanX", "#ทดสอบจริง", "#ประหยัดน้ำมัน", "#RoadTrip"],
    script_hook: "ท้าพิสูจน์ตัวเลข 26.5 กม./ลิตร! ขับจริง เปิดแอร์ฉ่ำ คนนั่ง 4 คน จะรอดไหม?",
    script_intro: "วันนี้เราไม่ได้มาขับแบบประคองเพื่อเอาตัวเลขสวยๆ แต่เราจะขับแบบที่ทุกคนขับกันทุกวัน",
    script_body: "วิ่งมอเตอร์เวย์ความเร็วร้อยถึงร้อยยี่สิบกิโลเมตรต่อชั่วโมง แซงจริง เร่งจริง และนี่คือตัวเลขที่แท้จริงหลังจากวิ่งมาสามร้อยกิโลเมตร",
    script_proof: "เติมน้ำมันกลับหัวจ่ายตัด ได้ตัวเลขคำนวณจริง 25.8 กม./ลิตร ใกล้เคียงตัวเลขมาตรฐานโรงงานที่สุด",
    script_cta: "อยากมาลองขับในเส้นทางที่คุณคุ้นเคย จองคิวได้เลยครับ",
    video_scenes: [
      {
        timestamp: "00:00 - 00:05",
        scene: "Scene 1: Gas Station Zeroing",
        visual: "หัวจ่ายน้ำมันตัด แกะสติกเกอร์ผนึกฝาถังน้ำมัน",
        dialogue: "ท้าพิสูจน์ตัวเลข 26.5 กม./ลิตร! ขับจริงเปิดแอร์ฉ่ำจะรอดไหม?",
        on_screen_text: "ทดสอบจริง BKK - Pattaya",
        camera_direction: "Close up ที่หัวจ่ายและตัวเลขศูนย์",
        sound_suggestion: "เสียงคลิกหัวจ่ายน้ำมัน"
      }
    ],
    creative_brief: {
      id: "brief-003",
      idea_id: "idea-003",
      creative_concept: "Real World Transparency — ความจริงใจที่พิสูจน์ได้",
      visual_direction: "ภาพสไตล์ Documentary Review แสงธรรมชาติ",
      mood: "Authentic, Credible, Dynamic",
      composition: "ตัวรถกำลังแล่นบนสะพานข้ามแม่น้ำบางปะกง",
      subject: "PK Sedan X สีเทา Magnetite Gray กำลังวิ่งบนถนนไฮเวย์",
      environment: "ถนนมอเตอร์เวย์ ท้องฟ้าโปร่งแดดสวย",
      lighting: "Bright natural daylight with motion blur on wheels",
      typography_direction: "Clean bold white with yellow accents",
      color_direction: "Asphalt Gray, Sky Blue, Metallic Silver",
      negative_space: "ท้องฟ้าด้านบน 35%",
      aspect_ratio: "16:9",
      image_prompt: "Dynamic motion tracking shot of a modern gray hybrid sedan driving at highway speed on a coastal bridge, sun reflection on car body, motion blur wheels, sharp car focus, 8k --ar 16:9",
      negative_prompt: "blurry body, low detail, CGI fake look",
      created_at: "2026-09-04T11:20:00Z"
    },
    status: "IN_REVIEW",
    confidence: 0.94,
    warnings: [],
    created_at: "2026-09-04T11:20:00Z",
    updated_at: "2026-09-04T11:20:00Z"
  },
  {
    id: "asset-004",
    idea_id: "idea-004",
    campaign_id: "camp-002",
    framework: "BAB",
    caption_short: "เสี้ยววินาทีแห่งชีวิต! ระบบช่วยเบรกฉุกเฉินอัตโนมัติใน PK Pilot 3.0 มองเห็นและหยุดรถได้เร็วกว่าสายตามนุษย์อย่างไร?",
    caption_long: "บนท้องถนน อุบัติเหตุเกิดขึ้นได้ในเสี้ยววินาที... มอเตอร์ไซค์เลี้ยวกะทันหัน หรือคนเดินถนนตัดหน้า\n\nกล้องคู่ Dual Lens และคลื่นเรดาร์ด้านหน้าของ PK Sensing 3.0 สแกนวัตถุ 100 ครั้งต่อวินาที และสั่งเบรกฉุกเฉินก่อนที่เท้าของคุณจะแตะแป้นเบรกถึง 0.3 วินาที\n\n0.3 วินาทีนี้ คือความแตกต่างระหว่างการเฉียดชน และการหยุดได้อย่างปลอดภัยสมบูรณ์แบบ",
    cta: "ศึกษาเทคโนโลยีความปลอดภัยระดับ 5 ดาวเพิ่มเติมได้ที่เว็บไซต์",
    hashtags: ["#PKSensing", "#ความปลอดภัย", "#ระบบเบรกฉุกเฉิน", "#PKAuto"],
    script_hook: "เสี้ยววินาทีแห่งชีวิต! เซนเซอร์หน้ารถมองเห็นอะไรก่อนสายตามนุษย์?",
    script_intro: "ถ้ามีสิ่งกีดขวางตัดหน้าในระยะกระชั้นชิด ร่างกายมนุษย์ต้องใช้เวลาตอบสนองประมาณหนึ่งวินาที",
    script_body: "แต่ระบบประมวลผลของ PK Pilot ใช้เวลาเพียงไม่กี่มิลลิวินาทีในการประเมินและสั่งการระบบเบรกไฮดรอลิกเต็มกำลัง",
    script_proof: "ผ่านการทดสอบมาตรฐานความปลอดภัย ASEAN NCAP ด้วยคะแนนการปกป้องผู้โดยสารระดับ 5 ดาวสูงสุด",
    script_cta: "ให้ความปลอดภัยปกป้องครอบครัวคุณ นัดทดลองขับระบบความปลอดภัยได้ที่โชว์รูม",
    video_scenes: [
      {
        timestamp: "00:00 - 00:05",
        scene: "Scene 1: Sudden Hazard",
        visual: "ภาพจำลองวัตถุตัดหน้าพร้อมกรอบตรวจจับสีแดงกระพริบเตือน",
        dialogue: "เสี้ยววินาทีแห่งชีวิต! เซนเซอร์หน้ารถมองเห็นอะไรก่อนสายตามนุษย์?",
        on_screen_text: "AEB: Autonomous Emergency Braking",
        camera_direction: "FPV จากกันชนหน้า",
        sound_suggestion: "เสียงสัญญาณเตือน ติ๊ด-ติ๊ด-ติ๊ด ถี่ยิบ"
      }
    ],
    creative_brief: {
      id: "brief-004",
      idea_id: "idea-004",
      creative_concept: "Guardian Angel Technology — เทคโนโลยีผู้พิทักษ์ที่มองไม่เห็น",
      visual_direction: "ภาพ 3D Wireframe HUD ล้ำสมัยซ้อนทับภาพถนนจริง",
      mood: "High-Tech, Protective, Trustworthy",
      composition: "หน้าตรงของรถยนต์ มีเส้นเลเซอร์เรดาร์สีเขียวยิงออกไปข้างหน้า",
      subject: "PK Sedan X หน้ารถเปิดไฟ Daytime Running Light รูปทรงเฉียบคม",
      environment: "ถนนจำลองสนามทดสอบความปลอดภัย",
      lighting: "Dramatic studio lighting with glowing green holographic HUD lines",
      typography_direction: "Futuristic Technical Sans-serif",
      color_direction: "Electric Cyan, Safety Red Accent, Dark Graphite",
      negative_space: "25% ด้านบน",
      aspect_ratio: "16:9",
      image_prompt: "Futuristic automotive technology visual, modern sedan front view scanning the road with glowing cyan radar and lidar sensor lines, dark background, sharp technical details, 8k --ar 16:9",
      negative_prompt: "blurry, low quality, noisy",
      created_at: "2026-09-04T14:10:00Z"
    },
    status: "DRAFT",
    confidence: 0.96,
    warnings: [],
    created_at: "2026-09-04T14:10:00Z",
    updated_at: "2026-09-04T14:10:00Z"
  },
  {
    id: "asset-005",
    idea_id: "idea-005",
    campaign_id: "camp-001",
    framework: "AIDA",
    caption_short: "กำเงิน 1 ล้าน ซื้อรุ่นไหนคุ้มสุดปี 2026? เทียบจุดต่อจุดระหว่าง PK Sedan X กับคู่แข่งในตลาด คันไหนให้อะไรมากกว่ากัน!",
    caption_long: "กำลังจะซื้อรถใหม่แต่ตัดสินใจไม่ถูก? เราเทียบสเปกจริงหมัดต่อหมัดมาให้ดูชัดๆ ทั้งแรงม้า ฟังก์ชันช่วยขับขี่ และขนาดห้องโดยสาร\n\nสไลด์ดูตารางเปรียบเทียบในแต่ละหน้าได้เลย!",
    cta: "บันทึกโพสต์นี้ไว้เปิดดูเทียบตอนไปเดินงาน หรือทักแชทขอโบรชัวร์ฉบับเต็มได้ทันที",
    hashtags: ["#เทียบสเปกรถ", "#PKSedanX", "#ซื้อรถใหม่", "#รถยนต์2026"],
    script_hook: "กำเงินล้านนึง ซื้อรุ่นไหนคุ้มสุดปี 2026? เทียบจุดต่อจุดไม่มีกั๊ก",
    script_intro: "วันนี้เราเอาสามรุ่นฮิตในกลุ่มซีดานไฮบริดมาวางเทียบกันให้เห็นชัดๆ",
    script_body: "จุดที่หนึ่ง แรงม้าสูงสุด PK Sedan X ให้มา 190 แรงม้า จุดที่สอง ระบบความปลอดภัยมีให้ครบตั้งแต่รุ่นเริ่มต้น และจุดที่สาม พื้นที่เก็บสัมภาระท้ายรถจุได้ถึงห้าร้อยลิตร",
    script_proof: "เมื่อเทียบราคาต่อแรงม้าและออปชันที่ได้ ถือเป็นตัวเลือกที่ให้ความคุ้มค่าสูงสุดในระดับราคาไม่เกินหนึ่งล้านบาท",
    script_cta: "ใครชอบรุ่นไหน หรืออยากให้เทียบจุดไหนเพิ่ม คอมเมนต์บอกกันได้เลย",
    video_scenes: [
      {
        timestamp: "00:00 - 00:05",
        scene: "Scene 1: Comparison Hook",
        visual: "กราฟิกแบ่งครึ่งหน้าจอเทียบรถยนต์สามคัน",
        dialogue: "กำเงินล้านนึง ซื้อรุ่นไหนคุ้มสุดปี 2026? เทียบจุดต่อจุดไม่มีกั๊ก",
        on_screen_text: "ศึกชิงบัลลังก์ Sedan งบล้านต้น",
        camera_direction: "Split Screen กราฟิกโมเดิร์น",
        sound_suggestion: "เสียงระฆังชกมวย หรือดนตรีแข่งขันตื่นเต้น"
      }
    ],
    creative_brief: {
      id: "brief-005",
      idea_id: "idea-005",
      creative_concept: "Ultimate Spec Showdown — คมชัด โปร่งใส ตรงไปตรงมา",
      visual_direction: "สไตล์ Infographic คลีน สะอาดตา ลายเส้นเรียบหรู",
      mood: "Analytical, Objective, Sharp, Clean",
      composition: "มุมมอง 3/4 หน้าตรง ขนานกันเพื่อเปรียบเทียบขนาดมิติตัวถัง",
      subject: "PK Sedan X จอดเด่นด้านหน้า",
      environment: "สตูดิโอสีขาว Minimalist High-key Lighting",
      lighting: "Bright even studio softbox lighting with soft floor shadows",
      typography_direction: "Bold geometric numbers and comparison badges",
      color_direction: "Monochrome White/Gray with Vibrant Blue and Emerald Green highlights",
      negative_space: "40% ด้านข้างสำหรับตารางตัวเลข",
      aspect_ratio: "1:1",
      image_prompt: "Minimalist studio photography of a sleek hybrid sedan on a pure clean white floor, bright soft overhead softbox lighting, pristine clean reflections, subtle ground shadow, 8k --ar 1:1",
      negative_prompt: "messy, artifacts, dark, saturated colors",
      created_at: "2026-09-05T08:15:00Z"
    },
    status: "APPROVED",
    confidence: 0.97,
    warnings: [],
    created_at: "2026-09-05T08:15:00Z",
    updated_at: "2026-09-05T08:15:00Z"
  }
];

export const ALL_DEMO_ASSETS = [...DEMO_ASSETS, ...ADDITIONAL_ASSETS];
