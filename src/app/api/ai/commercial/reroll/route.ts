import { NextResponse } from "next/server";
import { SceneData } from "../route";
import { callGemini } from "@/lib/ai/gemini";

// Curated high-pass-rate alternatives for Brown Rice Bowls & Grain Bowls
const RICE_BOWL_ALTERNATIVES: Record<number, Array<{
  shotType: string;
  cameraMovement: string;
  visualPromptEn: string;
  motionPrompt: string;
  thaiVoiceover?: string;
  onScreenTextTh?: string;
  textPosition?: string;
  audioSfx?: string;
}>> = {
  1: [
    {
      shotType: "ช็อต 01: เปิดเรื่อง Hook ชามข้าวกล้องโบว์ลเครื่องแน่น (มุมระนาบ 45 องศา โต๊ะสแกนดิเนเวีย)",
      cameraMovement: "45-Degree Cinematic Table Sweep 85mm",
      visualPromptEn: "Photorealistic 8K master commercial opening hook. Elegant 45-degree angle table sweep over a steaming artisan ceramic grain bowl filled with fluffy whole-grain brown rice, perfectly sliced herb-grilled chicken breast, ripe creamy Hass avocado fans, steamed edamame, and a glistening soft-boiled golden egg. Soft morning window daylight streaming through airy Scandinavian dining room, wooden chopsticks resting on ceramic chopstick rest, ARRI Alexa LF commercial food grading, vibrant fresh colors, zero in-image text, zero watches, zero cars, zero jewelry, zero fashion accessories. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Elegant 45-degree tracking sweep across artisan ceramic bowl. Wisps of translucent steam rise from warm brown rice and grilled chicken into soft morning sunbeams, 24fps.",
      thaiVoiceover: "เบื่อไหมกับอาหารคลีนที่กินยาก? เปลี่ยนมื้อสุขภาพให้อร่อยฟินด้วยข้าวกล้องโบว์ลสไตล์โฮมเมด เครื่องแน่น สารอาหารครบ 5 หมู่ในชามเดียว!",
      onScreenTextTh: "ข้าวกล้องโบว์ลโฮมเมด อร่อยฟินเครื่องแน่น! 🥗",
      textPosition: "Top Headline",
      audioSfx: "Light refreshing culinary whoosh, crisp kitchen chime."
    },
    {
      shotType: "ช็อต 01: เปิดเรื่อง Hook ออร์บิต 360 องศารอบชามข้าวกล้อง (360 Orbit Hero Hook)",
      cameraMovement: "Subtle 360 Orbit Glide 50mm Prime",
      visualPromptEn: "Photorealistic 8K heroic opening commercial shot. Smooth 360-degree orbit glide around a colorful wholesome homemade brown rice bowl on light rustic wooden dining counter. Steaming brown rice topped with golden seared chicken breast slices, creamy avocado, ruby cherry tomatoes, and golden egg. Soft morning sun flare, tack-sharp macro focus, pure food cinematography, zero in-image text, zero watches, zero cars, zero jewelry, zero fashion accessories. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Smooth 360 camera orbit around steaming colorful brown rice bowl. Glistening ingredients stay in sharp focus with gentle rising steam plumes, 24fps.",
      thaiVoiceover: "มื้อสุขภาพที่ไม่จำเจ! ข้าวกล้องโบว์ลโฮมเมด สารอาหารครบ อิ่มนาน อร่อยฟินทุกคำ!",
      onScreenTextTh: "มื้อสุขภาพ อิ่มนาน อร่อยไม่จำเจ! 🥗",
      textPosition: "Top Headline",
      audioSfx: "Smooth cinematic orbit whoosh, positive acoustic intro."
    }
  ],
  2: [
    {
      shotType: "ช็อต 02: ข้าวกล้องอินทรีย์หุงสุกร้อนๆ นุ่มหนึบ (ไม้พายคนข้าวเบามือ ควันกรุ่น)",
      cameraMovement: "Macro 100mm Wooden Paddle Fluff Action",
      visualPromptEn: "Photorealistic 8K extreme macro culinary capture. A smooth wooden rice paddle gently lifting and fluffing steaming hot cooked organic brown rice in rustic ceramic pot. Each whole grain plump, tender, and glistening with natural moisture, delicate aromatic steam billows into golden morning daylight. Cooke S4/i 100mm Macro Prime, shallow depth of field, strictly focused on hot brown rice grains, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Macro 100mm. Wooden rice paddle gently lifts steaming hot brown rice grains, soft translucent steam plumes billow upward in warm daylight, 24fps.",
      thaiVoiceover: "คัดสรรข้าวกล้องออร์แกนิกหุงสุกกำลังดี นุ่มหนึบ เคี้ยวเพลิน ไฟเบอร์สูง คุมน้ำตาลและช่วยให้อิ่มท้องยาวนาน",
      onScreenTextTh: "ข้าวกล้องออร์แกนิก นุ่มหนึบ ไฟเบอร์สูง 🌾",
      textPosition: "Lower Third",
      audioSfx: "Gentle warm steam whisper, comforting culinary hum."
    },
    {
      shotType: "ช็อต 02: ข้าวกล้องผสมไรซ์เบอร์รี่หุงสุกร้อนๆ (Slow Dolly across Steaming Grains)",
      cameraMovement: "Slow Lateral Slider 100mm Macro",
      visualPromptEn: "Extreme macro 100mm tracking slider across a steaming bed of warm organic brown rice and deep purple riceberry grains in artisan ceramic bowl. Tack-sharp focus on textured whole grains with micro moisture pearls catching side sunlight, ethereal warm steam drifting upward, ARRI Alexa LF grading, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Slow lateral macro slider across steaming brown rice and riceberry grains. Natural rising steam, rich textured grain detail, 24fps.",
      thaiVoiceover: "ข้าวกล้องอินทรีย์ผสมไรซ์เบอร์รี่ หุงสดใหม่ทุกมื้อ สารอาหารเต็มเม็ด ไฟเบอร์สูง ดีต่อลำไส้",
      onScreenTextTh: "หุงสดใหม่ สารอาหารเต็มเม็ด ดีต่อสุขภาพ 🌾",
      textPosition: "Lower Third",
      audioSfx: "Soft steam rising ambiance, light acoustic chime."
    }
  ],
  3: [
    {
      shotType: "ช็อต 03: ย่างอกไก่หมักสมุนไพร ลายกริลล์สีทอง (มีดเชฟสไลซ์เนื้อไก่นุ่มฉ่ำ 45 องศา)",
      cameraMovement: "45-Degree Chef Slice Macro 85mm",
      visualPromptEn: "Close-up culinary action of chef knife gently slicing tender herb-grilled chicken breast on wooden cutting board into clean uniform fans. Glistening natural juices seep gently from juicy white meat, crispy golden grill marks on the edges, aromatic rosemary sprigs nearby. Soft side window lighting, shallow depth of field, pure commercial food photography, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Close-up chef knife slices tender grilled chicken breast into uniform juicy slices, clear savory meat juices glistening under warm key light, 24fps.",
      thaiVoiceover: "เพิ่มโปรตีนลีนด้วยอกไก่หมักสมุนไพรธรรมชาติ ย่างจนหอมกรุ่น นุ่มฉ่ำ ไม่แห้งแข็ง",
      onScreenTextTh: "อกไก่หมักสมุนไพร นุ่มฉ่ำโปรตีนแน่น 🍗",
      textPosition: "Center Punchy",
      audioSfx: "Clean knife slice through tender meat, subtle kitchen ambience."
    },
    {
      shotType: "ช็อต 03: ย่างอกไก่หมักสมุนไพร กริลล์มาร์กสีทอง (ควันหอมบนกระทะเหล็กหล่อ)",
      cameraMovement: "Low-Angle Sizzle Track 85mm Prime",
      visualPromptEn: "Mouthwatering low-angle shot of seasoned chicken cutlet sizzling on cast-iron grill pan with deep charred diagonal marks, cracked black pepper and fresh rosemary glistening with savory olive oil droplets. Translucent white steam rising in soft window daylight, ARRI Alexa LF commercial food grading, strictly focused on meat, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Low-angle tracking shot along sizzling cast-iron grill pan. Golden seared chicken breast bubbling with clear savory juices, rising aromatic herbal steam, 24fps.",
      thaiVoiceover: "ย่างอกไก่ไฟปานกลาง ล็อกความนุ่มฉ่ำ ได้โปรตีนเน้นๆ ไม่อ้วนแน่นอน",
      onScreenTextTh: "ย่างไฟกลาง นุ่มฉ่ำ โปรตีนเน้นๆ 🍗",
      textPosition: "Center Punchy",
      audioSfx: "Satisfying grill sizzle, aromatic herbal aroma cue."
    }
  ],
  4: [
    {
      shotType: "ช็อต 04: สไลซ์อโวคาโดสดและท็อปปิ้งสีสัน (จัดเรียงท็อปปิ้งลงชามอย่างประณีต)",
      cameraMovement: "Overhead 45-Degree Bowl Assembly 50mm",
      visualPromptEn: "Artisan overhead 45-degree angle capture of wooden tongs delicately fanning freshly sliced creamy green Hass avocado onto the warm brown rice bowl. Next to ruby heirloom cherry tomato halves, steamed edamame, and purple shredded cabbage. Soft natural daylight, bright minimalist kitchen, pure culinary styling, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Wooden tongs gently arrange creamy avocado slices over warm brown rice with fluid elegance, crisp colorful vegetable toppings in place, 24fps.",
      thaiVoiceover: "อัดแน่นด้วยไขมันดีจากอโวคาโดสด พร้อมไฟเบอร์และวิตามินจากผักหลากสีสันสดใหม่",
      onScreenTextTh: "อโวคาโดสด ไขมันดี วิตามินแน่น 🥑",
      textPosition: "Lower Third",
      audioSfx: "Crisp delicate food placement, refreshing kitchen acoustic."
    },
    {
      shotType: "ช็อต 04: สไลซ์อโวคาโดสดและเตรียมท็อปปิ้ง (Flat Lay มุม 90 องศา แสงเช้าธรรมชาติ)",
      cameraMovement: "Overhead 90-Degree Flat Lay 50mm Prime",
      visualPromptEn: "Artisan overhead culinary flat-lay of ripe creamy Hass avocado being sliced into uniform fan ribbons on wooden prep board. Surrounded by bowls of steamed green edamame beans, diced sweet mango, ruby cherry tomatoes, and toasted sesame seeds. Soft Scandinavian morning daylight, 50mm Prime lens, pure food styling, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Top-down overhead glide. Chef knife smoothly fanning out creamy Hass avocado slices, crisp colorful toppings arranged with vibrant harmony on wooden board, 24fps.",
      thaiVoiceover: "ไขมันดีจากอโวคาโดสด ช่วยให้อิ่มนาน ลดคอเลสเตอรอล เติมความสดชื่นให้ร่างกาย",
      onScreenTextTh: "ไขมันดีจากอโวคาโด อิ่มนาน ลดคอเลสเตอรอล 🥑",
      textPosition: "Lower Third",
      audioSfx: "Crisp clean knife slice through avocado, fresh kitchen ambience."
    }
  ],
  5: [
    {
      shotType: "ช็อต 05: ราดน้ำสลัดงาคั่วญี่ปุ่นหอมละมุน (เหยือกเซรามิกราดเป็นสายสีทอง Slow-Motion)",
      cameraMovement: "High-Speed 120fps Side-Angle Pour 85mm",
      visualPromptEn: "High-speed 120fps slow-motion capture of a delicate handcrafted ceramic sauce jug pouring creamy golden Japanese roasted sesame dressing in a glistening ribbon over sliced avocado and brown rice. Micro dressing droplets glistening in warm window backlighting, shallow depth of field, pure commercial food cinematography, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. 120fps slow motion. Creamy roasted sesame dressing cascades smoothly from ceramic pitcher over avocado and grilled chicken in a silky unbroken ribbon, 24fps.",
      thaiVoiceover: "ราดน้ำสลัดงาคั่วญี่ปุ่นสูตรลดโซเดียม กลิ่นหอมเย้ายวน รสชาติกลมกล่อมลงตัวแบบไม่ต้องรู้สึกผิด",
      onScreenTextTh: "น้ำสลัดงาคั่วญี่ปุ่น หอมละมุน โซเดียมต่ำ 🥣",
      textPosition: "Center Punchy",
      audioSfx: "Silky smooth liquid dressing pour, gentle culinary splash."
    },
    {
      shotType: "ช็อต 05: ราดน้ำสลัดงาคั่วญี่ปุ่นหอมละมุน (มุมท็อปเฉียง 60 องศา เคลือบผักฉ่ำเงา)",
      cameraMovement: "60-Degree Angle Slow Zoom 100mm",
      visualPromptEn: "Cinematic close-up of savory roasted sesame dressing drizzled in an elegant zigzag over crisp edamame, chicken breast, and avocado in ceramic bowl, creating appetizing glossy coating. Warm morning backlight, Cooke 100mm Macro Prime, pure commercial food styling, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Slow zoom as rich sesame dressing coats fresh toppings in glossy luster, gentle liquid fluid dynamics, 24fps.",
      thaiVoiceover: "เพิ่มรสชาติกลมกล่อมหอมมัน ด้วยน้ำสลัดงาคั่วสูตรคลีน แคลอรี่ต่ำ อร่อยฟินทุกคำ",
      onScreenTextTh: "สูตรคลีน แคลต่ำ หอมมันกลมกล่อม 🥣",
      textPosition: "Center Punchy",
      audioSfx: "Gentle liquid drizzle sound, appetizing chime."
    }
  ],
  6: [
    {
      shotType: "ช็อต 06: เจาะไข่ต้มยางมะตูมเยิ้มทองคำ (ตะเกียบไม้ผ่าไข่ยางมะตูมเยิ้มหยด Slow-Mo)",
      cameraMovement: "High-Speed 120fps Macro Chopstick Split 100mm",
      visualPromptEn: "Photorealistic 8K extreme macro 100mm food-porn moment. Smooth wooden chopsticks gently split a perfect soft-boiled egg nestled on steaming warm brown rice. Luscious, velvety, golden-orange egg yolk slowly oozes in rich thick ripples across tender grilled chicken slices and rice grains. Glistening warm morning highlights, ARRI Alexa LF food commercial grading, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. 120fps slow motion. Wooden chopsticks gently press and part soft-boiled egg, luxurious velvety golden egg yolk slowly oozes and cascades down steaming warm brown rice in rich fluid dynamics, 24fps.",
      thaiVoiceover: "ไฮไลต์เด็ดคือไข่ต้มยางมะตูมเยิ้มๆ เจาะแล้วคลุกเคล้ากับข้าวกล้องร้อนๆ บอกเลยว่าฟินสุดๆ!",
      onScreenTextTh: "ไข่ยางมะตูมเยิ้มๆ ฟินเต็มคำ! 🍳",
      textPosition: "Center Punchy",
      audioSfx: "Rich culinary yolk rupture, mouthwatering chime."
    },
    {
      shotType: "ช็อต 06: เจาะไข่ต้มยางมะตูมเยิ้มทองคำ (ช้อนไม้กดไข่แดงเยิ้มคลุกเคล้าข้าวร้อน)",
      cameraMovement: "Extreme Macro 100mm Spoon Press Action",
      visualPromptEn: "Extreme macro 100mm culinary shot of wooden spoon gently pressing into soft-boiled egg yolk, causing vibrant golden-yellow lava yolk to coat brown rice grains and avocado slices. Warm natural daylight, appetizing food texture, tack-sharp macro focus, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Wooden spoon presses into golden soft-boiled egg yolk, rich yolk cascades smoothly over warm brown rice with realistic liquid viscosity, 24fps.",
      thaiVoiceover: "ไข่แดงเยิ้มๆ คลุกเคล้าข้าวกล้องและไก่ย่าง รสชาติหวานมันจากธรรมชาติ 100%",
      onScreenTextTh: "ไข่แดงเยิ้มๆ คลุกข้าวกล้อง ฟินสุดๆ! 🍳",
      textPosition: "Center Punchy",
      audioSfx: "Soft yolk release sound, satisfying culinary resonance."
    }
  ],
  7: [
    {
      shotType: "ช็อต 07: ตักชิมคำแรก อร่อยฟินเต็มช้อน (ช้อนไม้ตักข้าว ไก่ อโวคาโด ควันฉุยขึ้นกล้อง)",
      cameraMovement: "Medium Close-up 85mm Steam Lift",
      visualPromptEn: "Warm commercial culinary close-up. A wooden spoon lifts a generous steaming bite of brown rice, tender grilled chicken, creamy avocado, and glistening golden yolk from the bowl. Soft natural morning daylight, gentle steam rising, beautiful bokeh background, pure commercial cinematography, strictly focused on food presentation, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Wooden spoon lifts generous steaming mouthful of brown rice, savory chicken, avocado, and yolk toward camera. Steaming delicacy, 24fps.",
      thaiVoiceover: "ตักคำแรกเข้าไป... ข้าวกล้องนุ่มหนึบ ไก่นุ่มฉ่ำ ผสานไข่เยิ้มและน้ำสลัดงา อร่อยกลมกล่อมจนลืมไปเลยว่านี่คืออาหารคลีน!",
      onScreenTextTh: "อร่อยกลมกล่อม สุขภาพดีทุกคำ 😋",
      textPosition: "Top Center",
      audioSfx: "Gentle spoon clink, cheerful bright melodic chime."
    },
    {
      shotType: "ช็อต 07: ตักชิมคำแรก อร่อยฟินเต็มช้อน (ตะเกียบคีบไก่ย่างฉ่ำซอสพร้อมข้าวกล้อง)",
      cameraMovement: "Macro 100mm Chopstick Lift",
      visualPromptEn: "Extreme close-up of wooden chopsticks lifting a tender slice of grilled chicken breast coated in roasted sesame dressing with brown rice grains and avocado. Glistening textures, soft background bokeh, natural morning daylight, pure food commercial, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Chopsticks lift savory grilled chicken and brown rice bite toward lens with subtle appetizing steam, 24fps.",
      thaiVoiceover: "คำนี้บอกเลยว่าฟิน! ได้ทั้งรสสัมผัสกรุบกรอบ นุ่มหนึบ และกลิ่นหอมงาคั่วเต็มๆ คำ",
      onScreenTextTh: "นุ่มหนึบ หอมกลิ่นงาคั่วเต็มคำ! 😋",
      textPosition: "Top Center",
      audioSfx: "Appetizing food lift whoosh, bright chord."
    }
  ],
  8: [
    {
      shotType: "ช็อต 08: คนรักสุขภาพทานอย่างมีความสุข (มุมจิบชาเขียวคู่ข้าวกล้องโบว์ลริมหน้าต่าง)",
      cameraMovement: "Medium Portrait 50mm Daylight Glide",
      visualPromptEn: "Artisan lifestyle commercial scene of fit Asian health enthusiast sitting at a warm sunlit wooden dining table, enjoying the homemade brown rice bowl with genuine joyful smile. Minimalist Scandinavian kitchen interior, soft potted plants in background, radiant natural morning daylight, pure healthy lifestyle commercial, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Fit Asian individual savors wholesome brown rice bowl with warm genuine smile at cozy morning dining table. Natural relaxed motion, sun-drenched atmosphere, 24fps.",
      thaiVoiceover: "สุขภาพดีเริ่มต้นได้ง่ายๆ ที่บ้านคุณเอง ทานแล้วอิ่มสบายท้อง มีพลังงานลุยงานได้ทั้งวัน",
      onScreenTextTh: "อิ่มท้อง สบายตัว สุขภาพดีจากภายใน 💖",
      textPosition: "Lower Third",
      audioSfx: "Warm positive acoustic guitar strumming, cozy home ambience."
    },
    {
      shotType: "ช็อต 08: คนรักสุขภาพทานอย่างมีความสุข (ไลฟ์สไตล์สดใส ฟิตแอนด์เฟิร์ม)",
      cameraMovement: "Gentle Forward Steadicam 35mm",
      visualPromptEn: "Warm lifestyle commercial shot of cheerful Asian person sitting on sunlit breakfast bar enjoying colorful homemade grain bowl, radiant healthy glowing skin, cozy linen morning attire, bright natural kitchen interior, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Gentle forward tracking toward individual smiling happily while enjoying meal at sunny breakfast counter, 24fps.",
      thaiVoiceover: "กินคลีนแบบมีความสุข ไม่ต้องอด ไม่ต้องทนฝืน อิ่มอร่อยได้ทุกวัน",
      onScreenTextTh: "กินคลีนแบบมีความสุข ไม่อด ไม่ฝืน 💖",
      textPosition: "Lower Third",
      audioSfx: "Uplifting acoustic guitar melody, serene morning mood."
    }
  ],
  9: [
    {
      shotType: "ช็อต 09: จัดกล่อง Meal Prep พกไปกินที่ทำงาน (ปิดฝากล่องแก้ว Snap ล็อกแน่นหนา)",
      cameraMovement: "Close-up 50mm Snap-Lock Action",
      visualPromptEn: "Clean commercial shot of eco-friendly round glass bowl container filled with colorful brown rice bowl. Hand smoothly snaps airtight bamboo lid in place with satisfying precision. Morning kitchen sunlight, Scandinavian aesthetic, pure food prep photography, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Hand cleanly snaps bamboo lid onto round glass grain bowl meal prep container on light wooden counter, 24fps.",
      thaiVoiceover: "ทำเป็น Meal Prep ใส่กล่องพกไปทานที่ทำงานได้ง่ายๆ สะดวก ประหยัดเวลา และคุมแคลอรี่ได้เป๊ะ 100%",
      onScreenTextTh: "พกไปทานที่ทำงาน สะดวก คุมแคลเป๊ะ 🍱",
      textPosition: "Lower Third",
      audioSfx: "Snap of eco-friendly container lid, satisfying click."
    },
    {
      shotType: "ช็อต 09: จัดกล่อง Meal Prep พกไปกินที่ทำงาน (สไลด์กล้องผ่านแถวกล่อง Meal Prep 3 กล่อง)",
      cameraMovement: "Smooth Tracking Slider 50mm",
      visualPromptEn: "Clean commercial tracking shot of two eco-friendly round glass bowl containers neatly packed with colorful homemade brown rice bowls with bamboo lids, ready for grab-and-go meal prep. Bright modern kitchen countertop, fresh morning sunlight, pure food photography, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Smooth tracking slider past beautifully packed round glass lunch bowls with airtight lids on bright wooden counter. Crisp morning daylight, 24fps.",
      thaiVoiceover: "เตรียมไว้ล่วงหน้า เปิดตู้เย็นก็หยิบพกไปได้ทันที สะดวก สุขภาพดีทุกมื้อ",
      onScreenTextTh: "เตรียมล่วงหน้า พกพาสะดวก สุขภาพดีทุกมื้อ 🍱",
      textPosition: "Lower Third",
      audioSfx: "Smooth camera tracking whoosh, satisfying lunchbox snap."
    }
  ],
  10: [
    {
      shotType: "ช็อต 10: สรุปภาพรวม & ปิดการขาย (มุมสูง 30 องศา ควันกรุ่น โต๊ะอาหารหรูหรา)",
      cameraMovement: "Centered Master 30-Degree Pullback 50mm",
      visualPromptEn: "Grand finale heroic commercial packshot. The complete colorful homemade brown rice bowl presented majestically on rustic ceramic tableware with wooden chopsticks and small ceramic sauce ramekin on light linen cloth. Soft morning sunbeams, gentle rising steam, pure commercial food cinematography, elegant centered composition, strictly focused on culinary bowl, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Centered master pullback showcasing complete steaming brown rice bowl in all its colorful glory under soft commercial lighting, 24fps.",
      thaiVoiceover: "อยากได้ไอเดียเมนูคลีนทำง่ายแบบนี้ทุกวัน เซฟคลิปนี้ไว้เลย แล้วทักแชตรับสูตรตารางอาหารคลีน 7 วันฟรีได้เลยครับ!",
      onScreenTextTh: "เซฟสูตรทักแชตรับแพลนคลีนฟรี! 🥗",
      textPosition: "Bottom Center CTA",
      audioSfx: "Signature triumphant culinary chime, uplifting acoustic finale."
    },
    {
      shotType: "ช็อต 10: สรุปภาพรวม & ปิดการขาย (Master Hero Zoom Out เผยเซตอาหารครบครัน)",
      cameraMovement: "Smooth Backward Dolly 35mm Hero Packshot",
      visualPromptEn: "Heroic commercial finale. Smooth backward dolly revealing complete clean eating arrangement: steaming homemade brown rice bowl, tall glass of cold brew green tea with condensation beads, and wooden cutlery on white stone dining surface under morning light. Pure cinematography, elegant space for CTA typography, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Smooth backward dolly out revealing beautiful complete meal table setting with rising steam and morning sunbeams, 24fps.",
      thaiVoiceover: "เริ่มต้นหุ่นดีและสุขภาพปังวันนี้ เซฟคลิปนี้ไว้แล้วทักแชตรับสูตรตารางอาหารคลีนได้เลยครับ!",
      onScreenTextTh: "เริ่มสุขภาพดีวันนี้ ทักแชตรับสูตรฟรี! 🌟",
      textPosition: "Bottom Center CTA",
      audioSfx: "Triumphant brand sonic chime, cheerful closing resonance."
    }
  ]
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      scene,
      allScenes = [],
      productName = "ข้าวกล้องโบว์ลสไตล์โฮมเมด",
      brand = "Healthy Bowl",
      aspectRatio = "16:9",
      adStyle = "Cinematic Food & Wholesome Lifestyle",
      variationSeed = Date.now()
    } = body;

    if (!scene || typeof scene.sceneNumber !== "number") {
      return NextResponse.json({ success: false, error: "Invalid scene data provided" }, { status: 400 });
    }

    const sceneNum = scene.sceneNumber;
    const combinedStr = `${productName} ${brand} ${scene.shotType || ""} ${scene.visualPromptEn || ""}`.toLowerCase();

    const isRiceBowl =
      combinedStr.includes("ข้าว") ||
      combinedStr.includes("โบว์ล") ||
      combinedStr.includes("โบว์ลิ่ง") ||
      combinedStr.includes("โบล") ||
      combinedStr.includes("bowl") ||
      combinedStr.includes("grain bowl") ||
      combinedStr.includes("คลีน") ||
      combinedStr.includes("อาหารคลีน");

    // 1. Check curated presets first for instant, guaranteed bulletproof pass-rate
    if (isRiceBowl && RICE_BOWL_ALTERNATIVES[sceneNum]) {
      const altList = RICE_BOWL_ALTERNATIVES[sceneNum];
      const index = Math.abs(Number(variationSeed) || 0) % altList.length;
      const chosen = altList[index];

      const updatedVisualPrompt = chosen.visualPromptEn.replace(/{aspectRatio}/g, aspectRatio);

      const updatedScene: SceneData = {
        ...scene,
        shotType: chosen.shotType,
        cameraMovement: chosen.cameraMovement,
        visualPromptEn: updatedVisualPrompt,
        motionPrompt: chosen.motionPrompt,
        thaiVoiceover: chosen.thaiVoiceover || scene.thaiVoiceover,
        onScreenTextTh: chosen.onScreenTextTh || scene.onScreenTextTh,
        textPosition: chosen.textPosition || scene.textPosition || "Lower Third",
        audioSfx: chosen.audioSfx || scene.audioSfx || "Cinematic foley beat cut.",
        status: "READY"
      };

      return NextResponse.json({
        success: true,
        source: "curated_preset",
        scene: updatedScene
      });
    }

    // 2. Dynamic AI Generation with Context Continuity via callGemini
    const prevScene = allScenes.find((s: SceneData) => s.sceneNumber === sceneNum - 1);
    const nextScene = allScenes.find((s: SceneData) => s.sceneNumber === sceneNum + 1);

    const systemInstruction = `You are the Lead Commercial Cinematographer & Prompt Engineer for PK Marketing AI OS.
Your task is to re-roll and generate an alternative, ultra-high-pass-rate prompt for an individual commercial scene.
CRITICAL MANDATES:
1. PRESERVE THE NARRATIVE ARC: Do NOT change the product, main subject, or the scene's emotional/functional purpose in the story.
2. CONTINUITY: The new visual prompt and motion choreography MUST connect seamlessly to the preceding scene and succeeding scene in lighting, color grading, and environment.
3. HIGH PASS RATE (VEO 2 & IMAGEN 3):
   - Start immediately with the physical photographic subject.
   - Use professional camera lenses (Cooke Macro 100mm, ARRI Alexa LF 50mm/85mm Prime).
   - Describe exact physical motion and fluid dynamics at 24fps.
   - ALWAYS append negative safety constraints: ', zero in-image text, zero watches, zero cars, zero jewelry, zero fashion accessories, zero unrelated items, pure cinematography --ar ${aspectRatio}'.
   - NEVER include abstract utensils, wristwatches, luxury accessories, or weapons.
Return ONLY valid JSON with this schema:
{
  "shotType": "string (Thai)",
  "cameraMovement": "string (English)",
  "visualPromptEn": "string (100% English)",
  "motionPrompt": "string (100% English Veo 2 motion at 24fps)",
  "thaiVoiceover": "string (Thai)",
  "onScreenTextTh": "string (Thai)",
  "textPosition": "Top Headline | Lower Third | Center Punchy | Bottom Center CTA"
}`;

    const promptText = `Re-roll and generate an alternative high-pass-rate prompt for Scene ${sceneNum} of a ${allScenes.length || 10}-scene commercial.
Product/Campaign: ${productName} (${brand})
Ad Style: ${adStyle}
Aspect Ratio: ${aspectRatio}

Current Scene:
- Shot Type: ${scene.shotType}
- Camera: ${scene.cameraMovement}
- Visual Prompt: ${scene.visualPromptEn}
- Motion Prompt: ${scene.motionPrompt}
- Voiceover: ${scene.thaiVoiceover}
- On-Screen Text: ${scene.onScreenTextTh}

Narrative Context:
- Previous Scene (${sceneNum - 1}): ${prevScene ? `${prevScene.shotType} | ${prevScene.visualPromptEn}` : "Start of commercial"}
- Next Scene (${sceneNum + 1}): ${nextScene ? `${nextScene.shotType} | ${nextScene.visualPromptEn}` : "End of commercial"}

Generate a fresh, exciting alternative camera angle and visual composition that keeps the exact subject and story position but provides a completely new creative perspective that easily passes AI generation.`;

    try {
      const aiRes = await callGemini({
        workflow: "commercial_reroll_scene",
        systemInstruction,
        prompt: promptText,
        responseSchema: true
      });

      const parsed = aiRes.data || (aiRes.text ? JSON.parse(aiRes.text) : null);

      if (parsed && parsed.visualPromptEn) {
        // Enforce aspect ratio and safety suffix
        let cleanVisual = parsed.visualPromptEn;
        if (!cleanVisual.includes("--ar")) {
          cleanVisual += ` --ar ${aspectRatio}`;
        }
        if (!cleanVisual.includes("zero in-image text")) {
          cleanVisual = cleanVisual.replace(/--ar/, ", zero in-image text, zero watches, zero cars, zero jewelry, pure cinematography --ar");
        }

        const updatedScene: SceneData = {
          ...scene,
          shotType: parsed.shotType || scene.shotType,
          cameraMovement: parsed.cameraMovement || scene.cameraMovement,
          visualPromptEn: cleanVisual,
          motionPrompt: parsed.motionPrompt || scene.motionPrompt,
          thaiVoiceover: parsed.thaiVoiceover || scene.thaiVoiceover,
          onScreenTextTh: parsed.onScreenTextTh || scene.onScreenTextTh,
          textPosition: parsed.textPosition || scene.textPosition || "Lower Third",
          status: "READY"
        };

        return NextResponse.json({
          success: true,
          source: "ai_generation",
          scene: updatedScene
        });
      }
    } catch (aiErr) {
      console.error("AI Scene Re-roll error:", aiErr);
    }

    // Fallback: return slightly varied camera angle
    return NextResponse.json({
      success: true,
      source: "fallback",
      scene: {
        ...scene,
        visualPromptEn: scene.visualPromptEn.replace(/Macro/i, "High-Speed 120fps Macro"),
        status: "READY"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
