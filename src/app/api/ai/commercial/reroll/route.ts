import { NextResponse } from "next/server";
import { SceneData } from "../route";
import { callGemini } from "@/lib/ai/gemini";

// Curated high-pass-rate alternatives for Stir-Fried Brown Rice (Wok Stir-Fry, Zero Avocado)
const FRIED_RICE_ALTERNATIVES: Record<number, Array<{
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
      shotType: "ช็อต 01: เปิดเรื่อง Hook สะบัดกระทะเหล็ก ข้าวกล้องผัดซีอิ๊วคลีน (45 องศา Wok Action)",
      cameraMovement: "45-Degree High-Speed Wok Track 85mm",
      visualPromptEn: "Photorealistic 8K master commercial opening hook. Dynamic 45-degree angle capture of chef tossing healthy stir-fried brown rice in a seasoned iron wok. Golden caramelized brown rice grains, tender sliced chicken, and bright scallions dancing in mid-air amidst fragrant culinary steam plumes. Rich amber side lighting, ARRI Alexa LF commercial food grading, pure cinematography, strictly focused on wok food, zero avocado, zero salad, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Macro push-in on seasoned hot wok. Chef deftly tosses warm fluffy brown rice coated in savory dark soy sauce. Individual glistening grains bounce in mid-air with scrambled egg ribbons, 24fps.",
      thaiVoiceover: "เบื่อไหมกับข้าวผัดมันเยิ้ม? เปลี่ยนมาทำ 'ข้าวกล้องผัดซีอิ๊วคลีน' หอมกลิ่นกระทะ โซเดียมต่ำ อิ่มนาน ไม่อ้วนแน่นอน!",
      onScreenTextTh: "ข้าวกล้องผัดซีอิ๊วคลีน หอมกลิ่นกระทะ! 🍳🔥",
      textPosition: "Top Headline",
      audioSfx: "Roaring wok burner flame, sizzling stir-fry toss foley, crisp energetic whoosh."
    },
    {
      shotType: "ช็อต 01: เปิดเรื่อง Hook ออร์บิต 360 องศารอบจานข้าวผัดควันกรุ่น (360 Orbit Hero Hook)",
      cameraMovement: "Subtle 360 Orbit Glide 50mm Prime",
      visualPromptEn: "Photorealistic 8K heroic opening commercial shot. Smooth 360-degree orbit glide around a steaming plate of healthy stir-fried brown rice with dark soy sauce on dark textured stoneware plate. Sliced cucumbers, fresh lime wedge, and gentle steam wisps rising into morning sunbeam. Tack-sharp macro focus, pure food cinematography, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Smooth 360 camera orbit around steaming plate of stir-fried brown rice. Glistening grains and chicken stay in sharp focus with gentle rising steam plumes, 24fps.",
      thaiVoiceover: "ข้าวผัดคลีนที่อร่อยจนลืมอ้วน! หอมกลิ่นกระทะแท้ๆ เครื่องแน่น โปรตีนลีน ไฟเบอร์สูง!",
      onScreenTextTh: "ข้าวผัดคลีน อร่อยจนลืมอ้วน! 🍳✨",
      textPosition: "Top Headline",
      audioSfx: "Smooth cinematic orbit whoosh, positive acoustic intro."
    }
  ],
  2: [
    {
      shotType: "ช็อต 02: ข้าวกล้องอินทรีย์หุงแห้งเม็ดร่วน (ไม้พายคนข้าวเบามือ เม็ดสวยไม่แฉะ)",
      cameraMovement: "Macro 100mm Wooden Paddle Fluff Action",
      visualPromptEn: "Photorealistic 8K extreme macro culinary capture. A smooth wooden rice paddle gently fluffing warm cooked brown rice grains in wooden prep bowl. Each whole grain plump, firm, separate, and dry, ready for stir-frying. Soft wisps of aromatic steam rising into warm side daylight. Tack-sharp focus on textured rice grains, pure food cinematography, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Macro 100mm. Wooden paddle gently lifts warm cooked brown rice grains, soft translucent steam plumes billow upward in warm daylight, 24fps.",
      thaiVoiceover: "เคล็ดลับสำคัญคือใช้ข้าวกล้องหุงแห้งเม็ดร่วน ไม่อมน้ำ ผัดแล้วเม็ดสวย ไม่แฉะติดกระทะ",
      onScreenTextTh: "ข้าวกล้องเม็ดร่วน ผัดแล้วไม่แฉะ 🌾",
      textPosition: "Lower Third",
      audioSfx: "Gentle warm steam whisper, comforting grain texture sound."
    },
    {
      shotType: "ช็อต 02: สไลเดอร์ช้าส่องเม็ดข้าวกล้องเรียงเม็ดสวย (Slow Lateral Slider 100mm)",
      cameraMovement: "Slow Lateral Slider 100mm Macro",
      visualPromptEn: "Extreme macro 100mm tracking slider across a bowl of freshly cooked fluffy brown rice grains. Glistening with natural moisture, each grain distinctly separated, delicate steam drifting into morning window daylight, ARRI Alexa LF grading, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Slow lateral macro slider across steaming brown rice grains. Natural rising steam, rich textured grain detail, 24fps.",
      thaiVoiceover: "เลือกใช้ข้าวกล้องออร์แกนิกเต็มเมล็ด ไฟเบอร์สูง ดัชนีน้ำตาลต่ำ อิ่มสบายท้องตลอดวัน",
      onScreenTextTh: "ข้าวกล้องออร์แกนิก ไฟเบอร์สูง อิ่มนาน 🌾",
      textPosition: "Lower Third",
      audioSfx: "Soft steam rising ambiance, light acoustic chime."
    }
  ],
  3: [
    {
      shotType: "ช็อต 03: เจียวกระเทียมสับและผัดไข่ไก่สด (Extreme Macro กลิ่นหอมฟุ้ง)",
      cameraMovement: "🔍 Extreme Macro 100mm f/2.8 Sizzle Track",
      visualPromptEn: "Extreme macro 100mm f/2.8 of finely minced golden garlic sizzling in hot wok with a single drop of coconut oil. Fresh organic egg cracked in, sizzling whites bubbling into delicate golden lace with yolk scrambled into silky ribbons, warm culinary lighting, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Extreme macro of minced golden garlic sizzling gently in hot wok. Fresh egg cracked directly in, yolk spreading into golden ribbons, 24fps.",
      thaiVoiceover: "เจียวกระเทียมสับด้วยน้ำมันมะพร้าวหรือรำข้าวแค่ 1 ช้อนชา ตามด้วยไข่ไก่สด ผัดจนหอมฟุ้ง",
      onScreenTextTh: "เจียวกระเทียม & ผัดไข่หอมๆ 🧄🥚",
      textPosition: "Center Punchy",
      audioSfx: "Crisp garlic sizzle, gentle egg bubbling in hot wok."
    },
    {
      shotType: "ช็อต 03: ตะหลิวไม้ผัดไข่ไก่เนื้อนุ่ม (Wooden Spatula Scramble Track)",
      cameraMovement: "Low-Angle Tracking 50mm Prime",
      visualPromptEn: "Low-angle dynamic shot of wooden spatula gently stirring velvety scrambled egg curds in sizzling wok. Garlic bits glistening, aromatic steam rising, shallow depth of field, pure commercial cooking cinematography, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Wooden spatula rhythmically folds soft scrambled egg curds in hot wok with rising savory steam, 24fps.",
      thaiVoiceover: "ผัดไข่พอสุกนุ่ม กลิ่นกระเทียมเจียวเตะจมูกทันที ให้รสสัมผัสหอมมันธรรมชาติ",
      onScreenTextTh: "ไข่นุ่มฟู กลิ่นกระเทียมหอมฟุ้ง 🍳",
      textPosition: "Center Punchy",
      audioSfx: "Wooden spatula stir-fry scrape, gentle sizzling foley."
    }
  ],
  4: [
    {
      shotType: "ช็อต 04: ผัดอกไก่หั่นเต๋าชุ่มฉ่ำ ลีนโปรตีนสูง (Low-Angle Sizzle Track 85mm)",
      cameraMovement: "Low-Angle 45-Degree Sizzle Track 85mm",
      visualPromptEn: "Mouthwatering close-up of diced tender lean chicken breast sizzling in seasoned cast-iron wok with minced garlic and cracked black pepper. Edges searing golden brown while staying extraordinarily juicy, fragrant steam swirling upward. Cooke Anamorphic 85mm Prime, ARRI Alexa LF grading, strictly focused on wok cooking, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Low-angle tracking shot. Bite-sized diced lean chicken breast cutlets seared quickly in the hot wok. Glistening natural savory juices lock inside, 24fps.",
      thaiVoiceover: "ใส่อกไก่หั่นเต๋า โปรตีนลีนสูง ผัดด้วยไฟแรงให้สุกพอดี เนื้อจะนุ่มฉ่ำ ไม่แห้งกระด้าง",
      onScreenTextTh: "อกไก่เต๋า นุ่มฉ่ำ โปรตีนลีนสูง 🍗",
      textPosition: "Center Punchy",
      audioSfx: "Energetic wok sizzle, wooden spatula stir-fry scrape."
    },
    {
      shotType: "ช็อต 04: เซียร์อกไก่ไฟแรง ล็อกความชุ่มฉ่ำ (Macro Sear & Steam 100mm)",
      cameraMovement: "🔍 Extreme Macro 100mm f/2.8",
      visualPromptEn: "Extreme macro 100mm f/2.8 of diced chicken breast cutlets searing with golden caramelized crust in wok. Savory clear juices bubbling at the contact point, cracked black pepper glistening, soft culinary steam, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Macro of diced chicken breast cutlets searing quickly on hot wok surface with micro-bubbles of savory juice, 24fps.",
      thaiVoiceover: "ผัดไฟแรงล็อกความฉ่ำ ได้โปรตีนเน้นๆ ซ่อมแซมกล้ามเนื้อ ช่วยเผาผลาญ",
      onScreenTextTh: "ล็อกความฉ่ำ โปรตีนแน่น ซ่อมแซมกล้ามเนื้อ 🍗",
      textPosition: "Center Punchy",
      audioSfx: "High-heat searing sizzle, aromatic kitchen hum."
    }
  ],
  5: [
    {
      shotType: "ช็อต 05: ราดซีอิ๊วดำลดโซเดียมขอบกระทะ (High-Speed 120fps Slow-Motion Pour)",
      cameraMovement: "High-Speed 120fps Slow-Motion Pour",
      visualPromptEn: "High-speed 120fps slow-motion capture of low-sodium dark soy sauce drizzling against the sizzling hot rim of a seasoned wok. Sauce instantly sizzles and vaporizes into savory caramelizing bubbles and aromatic smoke, coating glistening brown rice grains. Rich amber backlighting, shallow depth of field, pure commercial culinary cinematography, zero avocado, zero salad, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. 120fps high-speed capture. Dark savory low-sodium soy sauce drizzled against the scorching hot wok rim, instantly caramelizing into dancing micro-bubbles, 24fps.",
      thaiVoiceover: "เทคนิคเด็ดคือราดซีอิ๊วขอบกระทะ ให้ความร้อนดึงกลิ่นไหม้หอมกรุ่น สไตล์ผัดซีอิ๊วโบราณ แต่โซเดียมต่ำ!",
      onScreenTextTh: "ราดซีอิ๊วขอบกระทะ หอมกลิ่นคั่วกระทะ 🥢",
      textPosition: "Center Punchy",
      audioSfx: "Loud explosive sizzle as sauce hits wok rim, rising steam hiss."
    },
    {
      shotType: "ช็อต 05: ซีอิ๊วเดือดปุดเคลือบเม็ดข้าวสีทอง (Macro Simmer & Soy Sauce Caramelize)",
      cameraMovement: "Extreme Macro 100mm Caramelization Track",
      visualPromptEn: "Extreme macro 100mm shot of dark savory soy sauce bubbling furiously on hot wok bottom, instantly coating brown rice grains in a glistening golden-brown glaze. Fragrant culinary smoke ribbons drifting, warm rim light, zero avocado, zero salad, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Dark soy sauce bubbles furiously and adheres smoothly to tossing brown rice grains, transforming them into a rich amber glaze, 24fps.",
      thaiVoiceover: "ซีอิ๊วสูตรลดโซเดียมพิเศษ ได้รสชาติเข้มข้นกลมกล่อมโดยไม่ทำให้ตัวบวมน้ำ",
      onScreenTextTh: "ซีอิ๊วลดโซเดียม รสเข้มข้น ไม่บวมน้ำ 🥣",
      textPosition: "Center Punchy",
      audioSfx: "Active boiling bubble sizzle, rich culinary cue."
    }
  ],
  6: [
    {
      shotType: "ช็อต 06: สะบัดกระทะไฟแรง โรยต้นหอมซอย (Dynamic Kinetic Wok Toss)",
      cameraMovement: "Dynamic Low-Angle Kinetic Wok Flip",
      visualPromptEn: "Dynamic low-angle culinary action shot. Seasoned iron wok being tossed rhythmically, sending glossy caramelized brown rice grains, egg fragments, and vibrant green chopped scallions flying in an elegant arc against warm atmospheric kitchen lighting. Tack-sharp focus on mid-air rice grains, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Dynamic low-angle shot. Chef flips the wok vigorously, sending warm savory brown rice, diced chicken, and bright chopped scallions flying in a smooth parabolic arc, 24fps.",
      thaiVoiceover: "เร่งไฟแรงสะบัดกระทะอย่างรวดเร็ว โรยต้นหอมซอย ให้ซีอิ๊วและกลิ่นกระทะเคลือบข้าวทุกเม็ดอย่างทั่วถึง",
      onScreenTextTh: "สะบัดไฟแรง เม็ดข้าวเคลือบซอสทั่วถึง 🔥",
      textPosition: "Lower Third",
      audioSfx: "Rhythmic metal wok toss clatter, flame burner roar, scallion sizzle."
    },
    {
      shotType: "ช็อต 06: โรยต้นหอมซอยสดใหม่ลงกระทะ (Fresh Scallion Sprinkle 60fps)",
      cameraMovement: "Overhead 60-Degree Macro 50mm",
      visualPromptEn: "Overhead 60-degree angle capture of fresh emerald chopped spring onions scattered generously over steaming stir-fried brown rice in wok. Colors popping brightly against dark savory rice grains, micro-steam rising, pure culinary cinematography, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Hand tosses fresh green chopped scallions across sizzling hot brown rice in wok, steam reacting, 24fps.",
      thaiVoiceover: "โรยต้นหอมซอยเพิ่มความสดชื่นและกลิ่นหอมเฉพาะตัว เมนูผัดซีอิ๊วที่สมบูรณ์แบบ",
      onScreenTextTh: "ต้นหอมซอยสดใหม่ กลิ่นหอมสดชื่น 🌿",
      textPosition: "Lower Third",
      audioSfx: "Crisp vegetable scatter whisper, light wok sizzle."
    }
  ],
  7: [
    {
      shotType: "ช็อต 07: บีบมะนาวสดฉ่ำน้ำลงบนข้าวผัดร้อนๆ (Extreme Macro 100mm Slow-Mo Squeeze)",
      cameraMovement: "Extreme Macro 100mm Slow Motion 60fps",
      visualPromptEn: "Extreme macro 100mm f/2.8 shot of a fresh juicy lime wedge being gently squeezed above steaming stir-fried brown rice. Citrus droplets bursting and glistening as they land on hot savory rice grains, micro-steam reacting, warm side morning window daylight, pure culinary food porn, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. 60fps slow motion. Fresh jade-green lime wedge gently squeezed over steaming fried rice. Translucent citrus juice droplets explode in mid-air and mist over glossy hot rice grains, 24fps.",
      thaiVoiceover: "บีบมะนาวสดลงไปตัดรส... กรดซิตริกจะช่วยชูรสซีอิ๊วให้กลมกล่อม มีมิติ และสดชื่นขึ้นทันที",
      onScreenTextTh: "บีบมะนาวสด กลมกล่อมตัดเลี่ยน 🍋",
      textPosition: "Center Punchy",
      audioSfx: "Crisp lime squeeze pop, micro-droplets sizzling on hot food."
    },
    {
      shotType: "ช็อต 07: ละอองน้ำมะนาวสดกระทบเม็ดข้าวร้อน (Backlit Macro Citrus Burst)",
      cameraMovement: "Backlit Macro 85mm Prime 120fps",
      visualPromptEn: "Backlit macro 85mm Prime shot of glistening lime juice mist catching warm morning sunbeams as it descends onto hot savory brown rice. Individual translucent drops sparkling, soft aromatic vapor curling, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. 120fps backlighting. Fine mist of fresh lime juice showers over steaming brown rice grains, glistening highlights, 24fps.",
      thaiVoiceover: "ความเปรี้ยวละมุนของมะนาวสด ช่วยเร่งการย่อย และเติมวิตามินซีให้ร่างกายสดชื่น",
      onScreenTextTh: "มะนาวสด วิตามินซีสูง ช่วยกระตุ้นเผาผลาญ 🍋",
      textPosition: "Center Punchy",
      audioSfx: "Delicate citrus mist hiss, pleasant acoustic chord."
    }
  ],
  8: [
    {
      shotType: "ช็อต 08: จัดเสิร์ฟเคียงแตงกวาซอยและพริกน้ำปลาคลีน (Overhead 45-Degree Artisan Plating)",
      cameraMovement: "Overhead 45-Degree Artisan Plating 50mm",
      visualPromptEn: "Artisan overhead 45-degree presentation of piping-hot stir-fried brown rice served on dark textured ceramic plate, accompanied by crisp cucumber slices, fresh lime wedge, and a tiny ramekin of bird's eye chili in light tamari. Delicate rising steam, warm minimalist dining setting, pure food styling, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. 45-degree angle. Steaming aromatic brown rice scooped cleanly onto modern rustic matte black ceramic dish, garnished with crisp cucumber slices and lime wedge on the side, 24fps.",
      thaiVoiceover: "ตักใส่จาน เคียงด้วยแตงกวากรอบๆ มื้อนี้ไฟเบอร์สูง โปรตีนแน่น แคลอรี่เบา สบายท้อง",
      onScreenTextTh: "เคียงแตงกวาสด แคลต่ำ โปรตีนสูง 🥒",
      textPosition: "Lower Third",
      audioSfx: "Ceramic plate placement clink, delicate fork sound."
    },
    {
      shotType: "ช็อต 08: สไลเดอร์ผ่านแตงกวาซอยสดฉ่ำกรอบ (Crisp Cucumber Slices Slider)",
      cameraMovement: "Smooth Tracking Slider 50mm Macro",
      visualPromptEn: "Tracking slider across crisp green cucumber ribbons and lime wedge arranged beside the steaming mound of stir-fried brown rice. Micro water beads on cucumber skin, pure food commercial, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Smooth tracking slider past crisp fresh cucumber slices and steaming brown rice plate, 24fps.",
      thaiVoiceover: "แตงกวาสดช่วยเติมน้ำและไฟเบอร์ เคี้ยวกรุบกรอบตัดรสชาติได้อย่างสมบูรณ์แบบ",
      onScreenTextTh: "แตงกวากรอบ เติมไฟเบอร์ สบายท้อง 🥒",
      textPosition: "Lower Third",
      audioSfx: "Crisp cucumber crunch sound cue, light chime."
    }
  ],
  9: [
    {
      shotType: "ช็อต 09: ตักชิมคำแรก ควันกรุ่น อร่อยเข้มข้น (Medium Close-up 85mm Prime)",
      cameraMovement: "Medium Close-up 85mm Prime Bokeh",
      visualPromptEn: "Warm commercial culinary close-up. Spoon lifting a generous steaming mouthful of fragrant stir-fried brown rice with juicy chicken and scrambled egg. Glistening low-sodium soy glaze, steam drifting toward camera, beautiful creamy background bokeh, strictly focused on food presentation, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. A clean spoon lifts a generous steaming bite of savory brown rice, egg, and tender chicken directly toward camera. Soft warm kitchen daylight, 24fps.",
      thaiVoiceover: "ตักคำแรกเข้าไป... หอมกลิ่นคั่วกระทะ เม็ดข้าวนุ่มหนึบ รสชาติกลมกล่อมเข้มข้น อร่อยจนลืมไปเลยว่านี่คือเมนูคลีน!",
      onScreenTextTh: "อร่อยเข้มข้น หอมกระทะทุกคำ 😋",
      textPosition: "Top Center",
      audioSfx: "Gentle spoon clink, cheerful bright melodic chime."
    },
    {
      shotType: "ช็อต 09: คนรักสุขภาพทานอย่างฟิน มีความสุข (Healthy Diner Joyful Smile)",
      cameraMovement: "Medium Portrait 85mm Prime Soft Light",
      visualPromptEn: "Warm lifestyle commercial shot of fit Asian food enthusiast enjoying a delicious forkful of healthy stir-fried brown rice at sunny dining table. Genuine happy smile, radiant natural skin, warm morning kitchen backdrop, pure lifestyle cinematography, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Person tastes a spoonful of stir-fried brown rice, eyes lighting up with genuine satisfaction and culinary bliss, smiling at camera, 24fps.",
      thaiVoiceover: "กินคลีนให้มีความสุข คือการได้ทานของอร่อยทุกมื้อ ไม่ต้องอด ไม่ต้องทนฝืน",
      onScreenTextTh: "กินคลีนอย่างมีความสุข อร่อยทุกคำ 💖",
      textPosition: "Lower Third",
      audioSfx: "Delightful smile chime, warm positive acoustic rhythm."
    }
  ],
  10: [
    {
      shotType: "ช็อต 10: สรุปสูตร & ปิดท้าย Call to Action (Heroic Fried Rice Packshot & Final CTA)",
      cameraMovement: "Centered Master Culinary Pullback",
      visualPromptEn: "Grand finale heroic commercial packshot. The complete glistening plate of healthy stir-fried brown rice with dark soy sauce, lime wedge, and cucumber slices centered on rustic linen dining table. Translucent steam rising gracefully under warm 3200K key light, elegant centered composition, strictly focused on culinary plate, zero avocado, zero salad dressing, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Centered master pullback showcasing complete plate of steaming healthy stir-fried brown rice on dining table next to iced unsweetened green tea, warm golden lighting, 24fps.",
      thaiVoiceover: "อยากได้สูตรเมนูคลีนทำง่าย อร่อยไม่อ้วนแบบนี้ เซฟคลิปนี้ไว้เลย แล้วทักแชตรับตารางอาหารคลีน 7 วันฟรีได้เลยครับ!",
      onScreenTextTh: "เซฟสูตรทักแชตรับตารางคลีนฟรี! 🍳✨",
      textPosition: "Bottom Center CTA",
      audioSfx: "Signature triumphant culinary chime, uplifting acoustic finale."
    },
    {
      shotType: "ช็อต 10: จัดเซ็ตเพื่อสุขภาพพร้อมเครื่องดื่ม (Healthy Fried Rice Lifestyle Set & CTA)",
      cameraMovement: "Smooth Overhead Pullback 35mm",
      visualPromptEn: "Centered commercial master shot of stir-fried brown rice plate paired with tall glass of iced lemon infused water and recipe card on minimalist oak table. Warm morning light, pristine aesthetic, pure food commercial, zero avocado, zero in-image text, zero watches, zero cars, zero jewelry. --ar {aspectRatio}",
      motionPrompt: "Photorealistic 8K image-to-video. Overhead camera pulls back smoothly revealing complete wholesome dining setting with steam rising, 24fps.",
      thaiVoiceover: "กดบันทึกคลิปนี้ไว้เลย แล้วแชร์ให้เพื่อนสายสุขภาพ กดติดตามเพื่อสูตรเมนูคลีนเด็ดๆ ทุกวันนะครับ!",
      onScreenTextTh: "กดเซฟ & ติดตามรับสูตรคลีนทุกวัน! 🌟",
      textPosition: "Bottom Center CTA",
      audioSfx: "Triumphant energetic acoustic crescendo, closing bell."
    }
  ]
};

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

    const isFriedRice =
      combinedStr.includes("ข้าวผัด") ||
      combinedStr.includes("ผัดข้าว") ||
      combinedStr.includes("fried rice") ||
      combinedStr.includes("ข้าวกล้องผัด") ||
      (combinedStr.includes("ผัด") && (combinedStr.includes("ข้าว") || combinedStr.includes("ซีอิ๊ว") || combinedStr.includes("กระเทียม") || combinedStr.includes("คลีน")));

    const isRiceBowl =
      !isFriedRice &&
      (combinedStr.includes("ข้าว") ||
       combinedStr.includes("โบว์ล") ||
       combinedStr.includes("โบว์ลิ่ง") ||
       combinedStr.includes("โบล") ||
       combinedStr.includes("bowl") ||
       combinedStr.includes("grain bowl") ||
       combinedStr.includes("คลีน") ||
       combinedStr.includes("อาหารคลีน"));

    // 1. Check curated presets first for instant, guaranteed bulletproof pass-rate
    if (isFriedRice && FRIED_RICE_ALTERNATIVES[sceneNum]) {
      const altList = FRIED_RICE_ALTERNATIVES[sceneNum];
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
        if (isFriedRice && !cleanVisual.includes("zero avocado")) {
          cleanVisual = cleanVisual.replace(/--ar/, ", zero avocado, zero salad, zero salad dressing --ar");
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
