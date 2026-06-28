require('dotenv').config();
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const defaultProducts = [
  // 1. Vegetables (30 items)
  { name: 'Potatoes (Regular)', sku: 'VEG-POT-REG', category: 'Vegetables', cost_price: 15, selling_price: 25, unit: 'kg' },
  { name: 'Onions (Red)', sku: 'VEG-ON-RED', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Tomatoes (Local)', sku: 'VEG-TOM-LOC', category: 'Vegetables', cost_price: 15, selling_price: 25, unit: 'kg' },
  { name: 'Tomatoes (Hybrid)', sku: 'VEG-TOM-HYB', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Carrots (Orange)', sku: 'VEG-CAR-ORA', category: 'Vegetables', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Cucumbers (Local)', sku: 'VEG-CUC-LOC', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Cauliflower', sku: 'VEG-CAU-001', category: 'Vegetables', cost_price: 25, selling_price: 45, unit: 'piece' },
  { name: 'Cabbage', sku: 'VEG-CAB-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'piece' },
  { name: 'Green Chillies', sku: 'VEG-GCH-001', category: 'Vegetables', cost_price: 40, selling_price: 70, unit: '250g' },
  { name: 'Ginger', sku: 'VEG-GIN-001', category: 'Vegetables', cost_price: 50, selling_price: 90, unit: '250g' },
  { name: 'Garlic', sku: 'VEG-GAR-001', category: 'Vegetables', cost_price: 60, selling_price: 100, unit: '250g' },
  { name: 'Lemon', sku: 'VEG-LEM-001', category: 'Vegetables', cost_price: 20, selling_price: 40, unit: '250g' },
  { name: 'Lady Finger (Okra)', sku: 'VEG-LAD-001', category: 'Vegetables', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Brinjal (Large)', sku: 'VEG-BRI-LAR', category: 'Vegetables', cost_price: 25, selling_price: 45, unit: 'kg' },
  { name: 'Brinjal (Small)', sku: 'VEG-BRI-SMA', category: 'Vegetables', cost_price: 25, selling_price: 45, unit: 'kg' },
  { name: 'Bottle Gourd', sku: 'VEG-BOT-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'piece' },
  { name: 'Bitter Gourd', sku: 'VEG-BIT-001', category: 'Vegetables', cost_price: 35, selling_price: 60, unit: 'kg' },
  { name: 'Ridge Gourd', sku: 'VEG-RID-001', category: 'Vegetables', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Snake Gourd', sku: 'VEG-SNA-001', category: 'Vegetables', cost_price: 25, selling_price: 45, unit: 'kg' },
  { name: 'Pumpkin', sku: 'VEG-PUM-001', category: 'Vegetables', cost_price: 15, selling_price: 25, unit: 'kg' },
  { name: 'Capsicum (Green)', sku: 'VEG-CAP-GRE', category: 'Vegetables', cost_price: 40, selling_price: 70, unit: 'kg' },
  { name: 'Beans (French)', sku: 'VEG-BEA-FRE', category: 'Vegetables', cost_price: 50, selling_price: 90, unit: 'kg' },
  { name: 'Green Peas', sku: 'VEG-PEA-GRE', category: 'Vegetables', cost_price: 60, selling_price: 100, unit: 'kg' },
  { name: 'Spinach (Palak)', sku: 'VEG-SPI-PAL', category: 'Vegetables', cost_price: 10, selling_price: 20, unit: 'bunch' },
  { name: 'Coriander Leaves', sku: 'VEG-COR-001', category: 'Vegetables', cost_price: 10, selling_price: 20, unit: 'bunch' },
  { name: 'Mint Leaves', sku: 'VEG-MIN-001', category: 'Vegetables', cost_price: 10, selling_price: 20, unit: 'bunch' },
  { name: 'Radish', sku: 'VEG-RAD-001', category: 'Vegetables', cost_price: 20, selling_price: 35, unit: 'kg' },
  { name: 'Beetroot', sku: 'VEG-BEE-001', category: 'Vegetables', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Sweet Potato', sku: 'VEG-SWE-001', category: 'Vegetables', cost_price: 25, selling_price: 45, unit: 'kg' },
  { name: 'Drumstick', sku: 'VEG-DRU-001', category: 'Vegetables', cost_price: 5, selling_price: 10, unit: 'piece' },
  { name: 'Mushroom', sku: 'VEG-MUS-001', category: 'Vegetables', cost_price: 80, selling_price: 140, unit: 'kg' },
  { name: 'Corn (Fresh)', sku: 'VEG-COR-FRE', category: 'Vegetables', cost_price: 40, selling_price: 70, unit: 'kg' },
  { name: 'Peas (Fresh)', sku: 'VEG-PEA-FRE', category: 'Vegetables', cost_price: 50, selling_price: 90, unit: 'kg' },
  { name: 'Beet Leaves', sku: 'VEG-BEL-001', category: 'Vegetables', cost_price: 15, selling_price: 30, unit: 'bunch' },
  { name: 'Fenugreek Leaves (Methi)', sku: 'VEG-MET-001', category: 'Vegetables', cost_price: 20, selling_price: 40, unit: 'bunch' },

  // 2. Fruits (25 items)
  { name: 'Bananas (Robusta)', sku: 'FRU-BAN-ROB', category: 'Fruits', cost_price: 30, selling_price: 50, unit: 'dozen' },
  { name: 'Apples (Shimla)', sku: 'FRU-APP-SHI', category: 'Fruits', cost_price: 80, selling_price: 120, unit: 'kg' },
  { name: 'Apples (Washington)', sku: 'FRU-APP-WAS', category: 'Fruits', cost_price: 150, selling_price: 220, unit: 'kg' },
  { name: 'Oranges (Nagpur)', sku: 'FRU-ORA-NAG', category: 'Fruits', cost_price: 60, selling_price: 90, unit: 'kg' },
  { name: 'Pomegranate', sku: 'FRU-POM-001', category: 'Fruits', cost_price: 100, selling_price: 160, unit: 'kg' },
  { name: 'Grapes (Green)', sku: 'FRU-GRA-GRE', category: 'Fruits', cost_price: 50, selling_price: 80, unit: 'kg' },
  { name: 'Grapes (Black)', sku: 'FRU-GRA-BLA', category: 'Fruits', cost_price: 80, selling_price: 120, unit: 'kg' },
  { name: 'Papaya', sku: 'FRU-PAP-001', category: 'Fruits', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Watermelon', sku: 'FRU-WAT-001', category: 'Fruits', cost_price: 15, selling_price: 25, unit: 'kg' },
  { name: 'Muskmelon', sku: 'FRU-MUS-001', category: 'Fruits', cost_price: 30, selling_price: 50, unit: 'kg' },
  { name: 'Pineapple', sku: 'FRU-PIN-001', category: 'Fruits', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Mango (Alphonso)', sku: 'FRU-MAN-ALP', category: 'Fruits', cost_price: 400, selling_price: 600, unit: 'dozen' },
  { name: 'Mango (Badami)', sku: 'FRU-MAN-BAD', category: 'Fruits', cost_price: 80, selling_price: 130, unit: 'kg' },
  { name: 'Guava', sku: 'FRU-GUA-001', category: 'Fruits', cost_price: 40, selling_price: 70, unit: 'kg' },
  { name: 'Sapota (Chikoo)', sku: 'FRU-SAP-001', category: 'Fruits', cost_price: 40, selling_price: 70, unit: 'kg' },
  { name: 'Kiwi (Pack of 3)', sku: 'FRU-KIW-003', category: 'Fruits', cost_price: 60, selling_price: 100, unit: 'pack' },
  { name: 'Dragon Fruit', sku: 'FRU-DRA-001', category: 'Fruits', cost_price: 50, selling_price: 90, unit: 'piece' },
  { name: 'Pear', sku: 'FRU-PEA-001', category: 'Fruits', cost_price: 100, selling_price: 160, unit: 'kg' },
  { name: 'Plums', sku: 'FRU-PLU-001', category: 'Fruits', cost_price: 120, selling_price: 200, unit: 'kg' },
  { name: 'Sweet Lime (Mosambi)', sku: 'FRU-SWE-MOS', category: 'Fruits', cost_price: 50, selling_price: 80, unit: 'kg' },
  { name: 'Coconut (Tender)', sku: 'FRU-COC-TEN', category: 'Fruits', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Coconut (Dry)', sku: 'FRU-COC-DRY', category: 'Fruits', cost_price: 20, selling_price: 35, unit: 'piece' },
  { name: 'Lemon (Pack of 5)', sku: 'FRU-LEM-005', category: 'Fruits', cost_price: 15, selling_price: 30, unit: 'pack' },
  { name: 'Custard Apple', sku: 'FRU-CUS-001', category: 'Fruits', cost_price: 80, selling_price: 130, unit: 'kg' },
  { name: 'Strawberry (Pack)', sku: 'FRU-STR-001', category: 'Fruits', cost_price: 50, selling_price: 90, unit: 'pack' },
  { name: 'Blueberry (Pack)', sku: 'FRU-BLU-001', category: 'Fruits', cost_price: 120, selling_price: 200, unit: 'pack' },
  { name: 'Blackberry (Pack)', sku: 'FRU-BLA-001', category: 'Fruits', cost_price: 100, selling_price: 180, unit: 'pack' },
  { name: 'Raspberries (Pack)', sku: 'FRU-RAS-001', category: 'Fruits', cost_price: 110, selling_price: 190, unit: 'pack' },
  { name: 'Avocado', sku: 'FRU-AVO-001', category: 'Fruits', cost_price: 80, selling_price: 140, unit: 'kg' },
  { name: 'Dates (Imported)', sku: 'FRU-DAT-IMP', category: 'Fruits', cost_price: 200, selling_price: 350, unit: 'kg' },

  // 3. Dairy & Bakery (25 items)
  { name: 'Amul Taza Milk (1L)', sku: 'DAI-AMU-TAZ', category: 'Dairy', cost_price: 50, selling_price: 65, unit: 'piece' },
  { name: 'Amul Gold Milk (1L)', sku: 'DAI-AMU-GOL', category: 'Dairy', cost_price: 55, selling_price: 72, unit: 'piece' },
  { name: 'Nandini Milk (1L)', sku: 'DAI-NAN-MIL', category: 'Dairy', cost_price: 45, selling_price: 58, unit: 'piece' },
  { name: 'Amul Paneer (200g)', sku: 'DAI-AMU-PAN', category: 'Dairy', cost_price: 85, selling_price: 120, unit: 'piece' },
  { name: 'Amul Butter (100g)', sku: 'DAI-AMU-BUT', category: 'Dairy', cost_price: 50, selling_price: 60, unit: 'piece' },
  { name: 'Amul Butter (500g)', sku: 'DAI-AMU-B500', category: 'Dairy', cost_price: 240, selling_price: 285, unit: 'piece' },
  { name: 'Amul Cheese Slices (200g)', sku: 'DAI-AMU-CHE', category: 'Dairy', cost_price: 130, selling_price: 165, unit: 'piece' },
  { name: 'Amul Cheese Block (200g)', sku: 'DAI-AMU-CBL', category: 'Dairy', cost_price: 110, selling_price: 145, unit: 'piece' },
  { name: 'Amul Curd (500g)', sku: 'DAI-AMU-CUR', category: 'Dairy', cost_price: 30, selling_price: 45, unit: 'piece' },
  { name: 'Amul Curd (1kg)', sku: 'DAI-AMU-C1KG', category: 'Dairy', cost_price: 55, selling_price: 85, unit: 'piece' },
  { name: 'Mother Dairy Curd (400g)', sku: 'DAI-MOT-CUR', category: 'Dairy', cost_price: 25, selling_price: 40, unit: 'piece' },
  { name: 'Amul Ghee (500ml)', sku: 'DAI-AMU-GHE', category: 'Dairy', cost_price: 280, selling_price: 350, unit: 'piece' },
  { name: 'Amul Ghee (1L)', sku: 'DAI-AMU-G1L', category: 'Dairy', cost_price: 550, selling_price: 680, unit: 'piece' },
  { name: 'Amul Masti Buttermilk (200ml)', sku: 'DAI-AMU-BML', category: 'Dairy', cost_price: 10, selling_price: 15, unit: 'piece' },
  { name: 'Amul Kool (200ml)', sku: 'DAI-AMU-KOO', category: 'Dairy', cost_price: 20, selling_price: 30, unit: 'piece' },
  { name: 'Eggs (6 pack)', sku: 'DAI-EGG-006', category: 'Dairy', cost_price: 35, selling_price: 55, unit: 'pack' },
  { name: 'Eggs (12 pack)', sku: 'DAI-EGG-012', category: 'Dairy', cost_price: 70, selling_price: 100, unit: 'pack' },
  { name: 'Britannia White Bread (400g)', sku: 'BAK-BRI-WHI', category: 'Bakery', cost_price: 35, selling_price: 50, unit: 'piece' },
  { name: 'Britannia Brown Bread (400g)', sku: 'BAK-BRI-BRO', category: 'Bakery', cost_price: 40, selling_price: 55, unit: 'piece' },
  { name: 'Britannia Multigrain Bread (400g)', sku: 'BAK-BRI-MUL', category: 'Bakery', cost_price: 45, selling_price: 65, unit: 'piece' },
  { name: 'Britannia Fruit Cake (150g)', sku: 'BAK-BRI-CAK', category: 'Bakery', cost_price: 25, selling_price: 40, unit: 'piece' },
  { name: 'Britannia Rusk (200g)', sku: 'BAK-BRI-RUS', category: 'Bakery', cost_price: 30, selling_price: 45, unit: 'piece' },
  { name: 'Pav (6 pack)', sku: 'BAK-PAV-006', category: 'Bakery', cost_price: 20, selling_price: 35, unit: 'pack' },
  { name: 'Burger Buns (2 pack)', sku: 'BAK-BUN-002', category: 'Bakery', cost_price: 15, selling_price: 30, unit: 'pack' },
  { name: 'Pizza Base (2 pack)', sku: 'BAK-PIZ-002', category: 'Bakery', cost_price: 25, selling_price: 45, unit: 'pack' },
  { name: 'Croissants (Pack of 3)', sku: 'BAK-CRO-003', category: 'Bakery', cost_price: 35, selling_price: 65, unit: 'pack' },
  { name: 'Donuts (Pack of 4)', sku: 'BAK-DON-004', category: 'Bakery', cost_price: 40, selling_price: 70, unit: 'pack' },
  { name: 'Muffins (Pack of 3)', sku: 'BAK-MUF-003', category: 'Bakery', cost_price: 45, selling_price: 75, unit: 'pack' },
  { name: 'Cookies (Pack of 6)', sku: 'BAK-COO-006', category: 'Bakery', cost_price: 30, selling_price: 55, unit: 'pack' },
  { name: 'Cake (Sponge 500g)', sku: 'BAK-CAK-500', category: 'Bakery', cost_price: 150, selling_price: 250, unit: 'piece' },

  // 4. Staples - Grains, Flours, Pulses (40 items)
  { name: 'Ashirvaad Atta (5kg)', sku: 'STA-ASH-A5K', category: 'Staples', cost_price: 200, selling_price: 285, unit: 'piece' },
  { name: 'Ashirvaad Atta (10kg)', sku: 'STA-ASH-A10', category: 'Staples', cost_price: 380, selling_price: 540, unit: 'piece' },
  { name: 'Fortune Atta (5kg)', sku: 'STA-FOR-A5K', category: 'Staples', cost_price: 180, selling_price: 260, unit: 'piece' },
  { name: 'Pillsbury Atta (5kg)', sku: 'STA-PIL-A5K', category: 'Staples', cost_price: 210, selling_price: 295, unit: 'piece' },
  { name: 'Basmati Rice (India Gate 5kg)', sku: 'STA-ING-R5K', category: 'Staples', cost_price: 450, selling_price: 650, unit: 'piece' },
  { name: 'Basmati Rice (Daawat 5kg)', sku: 'STA-DAA-R5K', category: 'Staples', cost_price: 400, selling_price: 580, unit: 'piece' },
  { name: 'Sona Masuri Rice (5kg)', sku: 'STA-SON-R5K', category: 'Staples', cost_price: 250, selling_price: 380, unit: 'piece' },
  { name: 'Sona Masuri Rice (10kg)', sku: 'STA-SON-R10', category: 'Staples', cost_price: 480, selling_price: 720, unit: 'piece' },
  { name: 'Ponni Rice (5kg)', sku: 'STA-PON-R5K', category: 'Staples', cost_price: 280, selling_price: 420, unit: 'piece' },
  { name: 'Brown Rice (1kg)', sku: 'STA-BRO-R1K', category: 'Staples', cost_price: 80, selling_price: 130, unit: 'piece' },
  { name: 'Idli Rice (5kg)', sku: 'STA-IDL-R5K', category: 'Staples', cost_price: 200, selling_price: 320, unit: 'piece' },
  { name: 'Toor Dal (1kg)', sku: 'STA-TOO-D1K', category: 'Staples', cost_price: 110, selling_price: 160, unit: 'piece' },
  { name: 'Moong Dal (1kg)', sku: 'STA-MOO-D1K', category: 'Staples', cost_price: 100, selling_price: 150, unit: 'piece' },
  { name: 'Moong Dal Chilka (1kg)', sku: 'STA-MOC-D1K', category: 'Staples', cost_price: 95, selling_price: 140, unit: 'piece' },
  { name: 'Moong Whole (1kg)', sku: 'STA-MOW-D1K', category: 'Staples', cost_price: 90, selling_price: 135, unit: 'piece' },
  { name: 'Chana Dal (1kg)', sku: 'STA-CHA-D1K', category: 'Staples', cost_price: 70, selling_price: 110, unit: 'piece' },
  { name: 'Urad Dal (1kg)', sku: 'STA-URA-D1K', category: 'Staples', cost_price: 120, selling_price: 180, unit: 'piece' },
  { name: 'Urad Dal Whole (1kg)', sku: 'STA-URW-D1K', category: 'Staples', cost_price: 130, selling_price: 195, unit: 'piece' },
  { name: 'Masoor Dal (1kg)', sku: 'STA-MAS-D1K', category: 'Staples', cost_price: 80, selling_price: 125, unit: 'piece' },
  { name: 'Rajma Red (1kg)', sku: 'STA-RAJ-R1K', category: 'Staples', cost_price: 120, selling_price: 190, unit: 'piece' },
  { name: 'Rajma Chitra (1kg)', sku: 'STA-RAJ-C1K', category: 'Staples', cost_price: 110, selling_price: 175, unit: 'piece' },
  { name: 'Kabuli Chana (1kg)', sku: 'STA-KAB-C1K', category: 'Staples', cost_price: 100, selling_price: 160, unit: 'piece' },
  { name: 'Black Chana (1kg)', sku: 'STA-BLA-C1K', category: 'Staples', cost_price: 70, selling_price: 115, unit: 'piece' },
  { name: 'Sugar (1kg)', sku: 'STA-SUG-1K', category: 'Staples', cost_price: 38, selling_price: 48, unit: 'piece' },
  { name: 'Sugar (5kg)', sku: 'STA-SUG-5K', category: 'Staples', cost_price: 180, selling_price: 230, unit: 'piece' },
  { name: 'Jaggery (1kg)', sku: 'STA-JAG-1K', category: 'Staples', cost_price: 50, selling_price: 85, unit: 'piece' },
  { name: 'Tata Salt (1kg)', sku: 'STA-TAT-S1K', category: 'Staples', cost_price: 22, selling_price: 28, unit: 'piece' },
  { name: 'Tata Salt Lite (1kg)', sku: 'STA-TAT-SL1', category: 'Staples', cost_price: 35, selling_price: 45, unit: 'piece' },
  { name: 'Rock Salt (1kg)', sku: 'STA-ROC-S1K', category: 'Staples', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Besan (500g)', sku: 'STA-BES-500', category: 'Staples', cost_price: 40, selling_price: 65, unit: 'piece' },
  { name: 'Maida (500g)', sku: 'STA-MAI-500', category: 'Staples', cost_price: 25, selling_price: 40, unit: 'piece' },
  { name: 'Sooji / Rava (500g)', sku: 'STA-SOO-500', category: 'Staples', cost_price: 30, selling_price: 45, unit: 'piece' },
  { name: 'Poha (500g)', sku: 'STA-POH-500', category: 'Staples', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Sabudana (500g)', sku: 'STA-SAB-500', category: 'Staples', cost_price: 40, selling_price: 75, unit: 'piece' },
  { name: 'Dalia (500g)', sku: 'STA-DAL-500', category: 'Staples', cost_price: 30, selling_price: 50, unit: 'piece' },
  { name: 'Vermicelli (500g)', sku: 'STA-VER-500', category: 'Staples', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Wheat (Whole 5kg)', sku: 'STA-WHE-5K', category: 'Staples', cost_price: 150, selling_price: 240, unit: 'piece' },
  { name: 'Bajra (1kg)', sku: 'STA-BAJ-1K', category: 'Staples', cost_price: 30, selling_price: 55, unit: 'piece' },
  { name: 'Jowar (1kg)', sku: 'STA-JOW-1K', category: 'Staples', cost_price: 40, selling_price: 75, unit: 'piece' },
  { name: 'Ragi (1kg)', sku: 'STA-RAG-1K', category: 'Staples', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Semolina (Rava 1kg)', sku: 'STA-SEM-1K', category: 'Staples', cost_price: 35, selling_price: 60, unit: 'piece' },
  { name: 'Cornflour (500g)', sku: 'STA-COR-500', category: 'Staples', cost_price: 25, selling_price: 45, unit: 'piece' },
  { name: 'Arrowroot (500g)', sku: 'STA-ARR-500', category: 'Staples', cost_price: 35, selling_price: 65, unit: 'piece' },
  { name: 'Tapioca Starch (500g)', sku: 'STA-TAP-500', category: 'Staples', cost_price: 30, selling_price: 55, unit: 'piece' },
  { name: 'Pasta (500g)', sku: 'STA-PAS-500', category: 'Staples', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Noodles (500g)', sku: 'STA-NOO-500', category: 'Staples', cost_price: 35, selling_price: 60, unit: 'piece' },
  { name: 'Spaghetti (500g)', sku: 'STA-SPA-500', category: 'Staples', cost_price: 40, selling_price: 70, unit: 'piece' },
  { name: 'Penne (500g)', sku: 'STA-PEN-500', category: 'Staples', cost_price: 45, selling_price: 75, unit: 'piece' },

  // 5. Oils & Ghee (15 items)
  { name: 'Fortune Sunflower Oil (1L)', sku: 'OIL-FOR-S1L', category: 'Oils', cost_price: 110, selling_price: 165, unit: 'piece' },
  { name: 'Fortune Sunflower Oil (5L)', sku: 'OIL-FOR-S5L', category: 'Oils', cost_price: 520, selling_price: 780, unit: 'piece' },
  { name: 'Fortune Mustard Oil (1L)', sku: 'OIL-FOR-M1L', category: 'Oils', cost_price: 130, selling_price: 195, unit: 'piece' },
  { name: 'Fortune Groundnut Oil (1L)', sku: 'OIL-FOR-G1L', category: 'Oils', cost_price: 160, selling_price: 240, unit: 'piece' },
  { name: 'Saffola Gold Oil (1L)', sku: 'OIL-SAF-G1L', category: 'Oils', cost_price: 140, selling_price: 210, unit: 'piece' },
  { name: 'Saffola Gold Oil (5L)', sku: 'OIL-SAF-G5L', category: 'Oils', cost_price: 650, selling_price: 980, unit: 'piece' },
  { name: 'Sundrop Lite Oil (1L)', sku: 'OIL-SUN-L1L', category: 'Oils', cost_price: 130, selling_price: 190, unit: 'piece' },
  { name: 'Dhara Mustard Oil (1L)', sku: 'OIL-DHA-M1L', category: 'Oils', cost_price: 125, selling_price: 185, unit: 'piece' },
  { name: 'Figaro Olive Oil (500ml)', sku: 'OIL-FIG-O500', category: 'Oils', cost_price: 450, selling_price: 650, unit: 'piece' },
  { name: 'Borges Olive Oil (1L)', sku: 'OIL-BOR-O1L', category: 'Oils', cost_price: 800, selling_price: 1200, unit: 'piece' },
  { name: 'Parachute Coconut Oil (500ml)', sku: 'OIL-PAR-C500', category: 'Oils', cost_price: 180, selling_price: 240, unit: 'piece' },
  { name: 'Amul Ghee (500ml Tin)', sku: 'GHE-AMU-T500', category: 'Oils', cost_price: 290, selling_price: 360, unit: 'piece' },
  { name: 'Amul Ghee (1L Tin)', sku: 'GHE-AMU-T1L', category: 'Oils', cost_price: 570, selling_price: 700, unit: 'piece' },
  { name: 'Mother Dairy Ghee (1L)', sku: 'GHE-MOT-1L', category: 'Oils', cost_price: 540, selling_price: 660, unit: 'piece' },
  { name: 'Patanjali Cow Ghee (1L)', sku: 'GHE-PAT-1L', category: 'Oils', cost_price: 520, selling_price: 640, unit: 'piece' },
  { name: 'Vanaspati Ghee (1L)', sku: 'GHE-VAN-1L', category: 'Oils', cost_price: 280, selling_price: 380, unit: 'piece' },
  { name: 'Sesame Oil (500ml)', sku: 'OIL-SES-500', category: 'Oils', cost_price: 200, selling_price: 320, unit: 'piece' },
  { name: 'Coconut Oil (500ml)', sku: 'OIL-COC-500', category: 'Oils', cost_price: 150, selling_price: 240, unit: 'piece' },
  { name: 'Neem Oil (500ml)', sku: 'OIL-NEE-500', category: 'Oils', cost_price: 180, selling_price: 300, unit: 'piece' },
  { name: 'Castor Oil (500ml)', sku: 'OIL-CAS-500', category: 'Oils', cost_price: 100, selling_price: 180, unit: 'piece' }
];

const defaultCustomers = [
  { name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh@email.com', address: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { name: 'Priya Singh', mobile: '9876543211', email: 'priya@email.com', address: '456 Park Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { name: 'Amit Patel', mobile: '9876543212', email: 'amit@email.com', address: '789 Market Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { name: 'Neha Gupta', mobile: '9876543213', email: 'neha@email.com', address: '321 Garden Lane', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { name: 'Vikram Sharma', mobile: '9876543214', email: 'vikram@email.com', address: '654 River Road', city: 'Hyderabad', state: 'Telangana', pincode: '500001' }
];

async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log('🔄 Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role ENUM('cashier','manager','admin','master_admin') DEFAULT 'cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        sku VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        quantity INT DEFAULT 0,
        unit VARCHAR(50),
        cost_price DECIMAL(10,2) DEFAULT 0,
        selling_price DECIMAL(10,2) DEFAULT 0,
        min_stock_level INT DEFAULT 10,
        max_stock_level INT DEFAULT 100,
        supplier VARCHAR(100),
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        total_purchases DECIMAL(12,2) DEFAULT 0,
        loyalty_points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Sales table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_date DATE,
        cashier_id INT,
        total_items INT DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cashier_id) REFERENCES users(id)
      )
    `);

    // Sale items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT,
        product_id INT,
        quantity INT,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100),
        description TEXT,
        amount DECIMAL(10,2),
        expense_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        s_key VARCHAR(100) PRIMARY KEY,
        s_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created');

    // Seed users
    console.log('🔄 Seeding users...');
    const [existingMaster] = await connection.query("SELECT * FROM users WHERE username = 'master'");
    if (existingMaster.length === 0) {
      const hashedMasterPassword = await bcrypt.hash('master123', 10);
      await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['master', hashedMasterPassword, 'Master Admin', 'master_admin']);
      console.log('✅ Master admin created: master / master123');
    }

    const [existingAdmin] = await connection.query("SELECT * FROM users WHERE username = 'admin'");
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['admin', hashedPassword, 'Admin User', 'admin']);
      console.log('✅ Admin created: admin / admin123');
    }

    const [existingCashier] = await connection.query("SELECT * FROM users WHERE username = 'cashier'");
    if (existingCashier.length === 0) {
      const hashedPassword = await bcrypt.hash('cashier123', 10);
      await connection.query("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", ['cashier', hashedPassword, 'Cashier User', 'cashier']);
      console.log('✅ Cashier created: cashier / cashier123');
    }

    // Seed products
    console.log('🔄 Seeding products...');
    for (const product of defaultProducts) {
      try {
        await connection.query(
          'INSERT INTO products (name, sku, category, quantity, unit, cost_price, selling_price, min_stock_level, max_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [product.name, product.sku, product.category, 50, product.unit, product.cost_price, product.selling_price, 10, 100]
        );
      } catch (err) {
        // Product already exists
      }
    }
    console.log(`✅ ${defaultProducts.length} products seeded`);

    // Seed customers
    console.log('🔄 Seeding customers...');
    for (const customer of defaultCustomers) {
      try {
        await connection.query(
          'INSERT INTO customers (name, mobile, email, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [customer.name, customer.mobile, customer.email, customer.address, customer.city, customer.state, customer.pincode]
        );
      } catch (err) {
        // Customer already exists
      }
    }
    console.log(`✅ ${defaultCustomers.length} customers seeded`);

    // Seed settings
    console.log('🔄 Seeding settings...');
    const defaultSettings = [
      ['shop_name', 'Fresh Grocery Store'],
      ['shop_address', '123, Market Street'],
      ['shop_city', 'Mumbai'],
      ['shop_state', 'Maharashtra'],
      ['shop_pincode', '400001'],
      ['shop_phone', '+91 22 1234 5678'],
      ['shop_email', 'info@freshgrocery.in'],
      ['shop_gstin', '27AABCU9603R1ZX'],
      ['currency', 'Rs'],
      ['theme_primary', '#2d5016'],
      ['theme_secondary', '#4a7c2c'],
      ['theme_accent', '#e74c3c'],
      ['theme_success', '#27ae60'],
      ['theme_warning', '#f39c12'],
      ['backup_enabled', 'true'],
      ['backup_interval', '2'],
      ['ftp_enabled', 'false'],
      ['ftp_host', ''],
      ['ftp_user', ''],
      ['ftp_pass', ''],
      ['ftp_path', '/backups'],
      ['ftp_port', '21']
    ];
    for (const [key, value] of defaultSettings) {
      await connection.query("INSERT IGNORE INTO settings (s_key, s_value) VALUES (?, ?)", [key, value]);
    }
    console.log('✅ Settings seeded');

    connection.release();
    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Login Credentials:');
    console.log('   Master Admin: master / master123');
    console.log('   Admin: admin / admin123');
    console.log('   Cashier: cashier / cashier123');
    console.log(`\n📦 Total Products Seeded: ${defaultProducts.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initDatabase();
