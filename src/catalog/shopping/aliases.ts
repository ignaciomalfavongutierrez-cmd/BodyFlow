import type { IngredientAlias  } from '../../types/shoppingDiet';

export const INGREDIENT_ALIASES: IngredientAlias[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Proteínas
  // ─────────────────────────────────────────────────────────────────────────────
  // Pollo (ing-1)
  { id: 'alias-1', ingredient_id: 'ing-1', alias: 'pollo' },
  { id: 'alias-2', ingredient_id: 'ing-1', alias: 'pechuga de pollo' },
  { id: 'alias-3', ingredient_id: 'ing-1', alias: 'pechuga pollo' },
  { id: 'alias-4', ingredient_id: 'ing-1', alias: 'pechuga de pollo sin piel' },
  { id: 'alias-5', ingredient_id: 'ing-1', alias: 'pechuga deshebrada' },
  { id: 'alias-25', ingredient_id: 'ing-1', alias: 'pechuga asada' },
  { id: 'alias-26', ingredient_id: 'ing-1', alias: 'pechuga a la plancha' },
  { id: 'alias-27', ingredient_id: 'ing-1', alias: 'fajitas de pollo' },

  // Atún (ing-2)
  { id: 'alias-6', ingredient_id: 'ing-2', alias: 'atun' },
  { id: 'alias-7', ingredient_id: 'ing-2', alias: 'atún' },
  { id: 'alias-8', ingredient_id: 'ing-2', alias: 'lata de atun' },
  { id: 'alias-9', ingredient_id: 'ing-2', alias: 'atun en agua' },
  { id: 'alias-28', ingredient_id: 'ing-2', alias: 'atún en agua' },
  { id: 'alias-29', ingredient_id: 'ing-2', alias: 'atun dolores' },

  // Huevo (ing-3)
  { id: 'alias-10', ingredient_id: 'ing-3', alias: 'huevo' },
  { id: 'alias-11', ingredient_id: 'ing-3', alias: 'huevos' },
  { id: 'alias-12', ingredient_id: 'ing-3', alias: 'huevo entero' },
  { id: 'alias-30', ingredient_id: 'ing-3', alias: 'huevos enteros' },
  { id: 'alias-31', ingredient_id: 'ing-3', alias: 'huevo cocido' },
  { id: 'alias-32', ingredient_id: 'ing-3', alias: 'huevos revueltos' },

  // Carne molida de res (ing-4)
  { id: 'alias-33', ingredient_id: 'ing-4', alias: 'carne molida' },
  { id: 'alias-34', ingredient_id: 'ing-4', alias: 'carne molida de res' },
  { id: 'alias-35', ingredient_id: 'ing-4', alias: 'carne de res molida' },
  { id: 'alias-36', ingredient_id: 'ing-4', alias: 'molida 90/10' },
  { id: 'alias-37', ingredient_id: 'ing-4', alias: 'molida 95/5' },

  // Filete de pescado (ing-5)
  { id: 'alias-38', ingredient_id: 'ing-5', alias: 'pescado' },
  { id: 'alias-39', ingredient_id: 'ing-5', alias: 'filete de pescado' },
  { id: 'alias-40', ingredient_id: 'ing-5', alias: 'filete de tilapia' },
  { id: 'alias-41', ingredient_id: 'ing-5', alias: 'tilapia' },
  { id: 'alias-42', ingredient_id: 'ing-5', alias: 'basa' },
  { id: 'alias-43', ingredient_id: 'ing-5', alias: 'pescado blanco' },

  // Pechuga de pavo (ing-28)
  { id: 'alias-44', ingredient_id: 'ing-28', alias: 'pechuga de pavo' },
  { id: 'alias-45', ingredient_id: 'ing-28', alias: 'jamon de pavo' },
  { id: 'alias-46', ingredient_id: 'ing-28', alias: 'jamón de pavo' },
  { id: 'alias-47', ingredient_id: 'ing-28', alias: 'pavo' },

  // Claras de huevo (ing-29)
  { id: 'alias-48', ingredient_id: 'ing-29', alias: 'claras' },
  { id: 'alias-49', ingredient_id: 'ing-29', alias: 'clara de huevo' },
  { id: 'alias-50', ingredient_id: 'ing-29', alias: 'claras de huevo' },
  { id: 'alias-51', ingredient_id: 'ing-29', alias: 'clara' },
  { id: 'alias-52', ingredient_id: 'ing-29', alias: 'san juan claras' },

  // Salmón (ing-30)
  { id: 'alias-53', ingredient_id: 'ing-30', alias: 'salmon' },
  { id: 'alias-54', ingredient_id: 'ing-30', alias: 'salmón' },
  { id: 'alias-55', ingredient_id: 'ing-30', alias: 'filete de salmon' },
  { id: 'alias-56', ingredient_id: 'ing-30', alias: 'salmon fresco' },

  // Camarón (ing-31)
  { id: 'alias-57', ingredient_id: 'ing-31', alias: 'camaron' },
  { id: 'alias-58', ingredient_id: 'ing-31', alias: 'camarón' },
  { id: 'alias-59', ingredient_id: 'ing-31', alias: 'camarones' },

  // Bistec de res (ing-32)
  { id: 'alias-60', ingredient_id: 'ing-32', alias: 'bistec' },
  { id: 'alias-61', ingredient_id: 'ing-32', alias: 'bistec de res' },
  { id: 'alias-62', ingredient_id: 'ing-32', alias: 'carne de res' },
  { id: 'alias-63', ingredient_id: 'ing-32', alias: 'filete de res' },
  { id: 'alias-64', ingredient_id: 'ing-32', alias: 'arrachera magra' },

  // Lomo de cerdo (ing-33)
  { id: 'alias-65', ingredient_id: 'ing-33', alias: 'lomo de cerdo' },
  { id: 'alias-66', ingredient_id: 'ing-33', alias: 'chuleta de cerdo' },
  { id: 'alias-67', ingredient_id: 'ing-33', alias: 'cerdo magro' },

  // Proteína en polvo (ing-34)
  { id: 'alias-68', ingredient_id: 'ing-34', alias: 'proteina en polvo' },
  { id: 'alias-69', ingredient_id: 'ing-34', alias: 'proteína en polvo' },
  { id: 'alias-70', ingredient_id: 'ing-34', alias: 'whey protein' },
  { id: 'alias-71', ingredient_id: 'ing-34', alias: 'proteina whey' },
  { id: 'alias-72', ingredient_id: 'ing-34', alias: 'scoop de proteina' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Cereales
  // ─────────────────────────────────────────────────────────────────────────────
  // Avena (ing-6)
  { id: 'alias-73', ingredient_id: 'ing-6', alias: 'avena' },
  { id: 'alias-74', ingredient_id: 'ing-6', alias: 'hojuelas de avena' },
  { id: 'alias-75', ingredient_id: 'ing-6', alias: 'avena en hojuelas' },
  { id: 'alias-76', ingredient_id: 'ing-6', alias: 'avena cocida' },
  { id: 'alias-77', ingredient_id: 'ing-6', alias: 'harina de avena' },

  // Arroz (ing-7)
  { id: 'alias-13', ingredient_id: 'ing-7', alias: 'arroz' },
  { id: 'alias-14', ingredient_id: 'ing-7', alias: 'arroz blanco' },
  { id: 'alias-15', ingredient_id: 'ing-7', alias: 'arroz cocido' },
  { id: 'alias-78', ingredient_id: 'ing-7', alias: 'arroz al vapor' },

  // Tortillas de maíz (ing-8)
  { id: 'alias-21', ingredient_id: 'ing-8', alias: 'tortilla' },
  { id: 'alias-22', ingredient_id: 'ing-8', alias: 'tortillas' },
  { id: 'alias-23', ingredient_id: 'ing-8', alias: 'tortilla de maiz' },
  { id: 'alias-24', ingredient_id: 'ing-8', alias: 'tortillas de maíz' },
  { id: 'alias-79', ingredient_id: 'ing-8', alias: 'tortilla de comal' },

  // Tostadas horneadas (ing-9)
  { id: 'alias-80', ingredient_id: 'ing-9', alias: 'tostadas' },
  { id: 'alias-81', ingredient_id: 'ing-9', alias: 'tostadas horneadas' },
  { id: 'alias-82', ingredient_id: 'ing-9', alias: 'tostada horneada' },
  { id: 'alias-83', ingredient_id: 'ing-9', alias: 'sanissimo' },
  { id: 'alias-84', ingredient_id: 'ing-9', alias: 'tostadas sanissimo' },

  // Pan integral (ing-10)
  { id: 'alias-85', ingredient_id: 'ing-10', alias: 'pan' },
  { id: 'alias-86', ingredient_id: 'ing-10', alias: 'pan integral' },
  { id: 'alias-87', ingredient_id: 'ing-10', alias: 'pan tostado' },
  { id: 'alias-88', ingredient_id: 'ing-10', alias: 'pan bimbo cero' },
  { id: 'alias-89', ingredient_id: 'ing-10', alias: 'pan pita' },

  // Quinoa (ing-35)
  { id: 'alias-90', ingredient_id: 'ing-35', alias: 'quinoa' },
  { id: 'alias-91', ingredient_id: 'ing-35', alias: 'quinua' },
  { id: 'alias-92', ingredient_id: 'ing-35', alias: 'quinoa cocida' },

  // Arroz integral (ing-36)
  { id: 'alias-93', ingredient_id: 'ing-36', alias: 'arroz integral' },
  { id: 'alias-94', ingredient_id: 'ing-36', alias: 'arroz integral cocido' },

  // Pasta integral (ing-37)
  { id: 'alias-95', ingredient_id: 'ing-37', alias: 'pasta' },
  { id: 'alias-96', ingredient_id: 'ing-37', alias: 'pasta integral' },
  { id: 'alias-97', ingredient_id: 'ing-37', alias: 'espagueti' },
  { id: 'alias-98', ingredient_id: 'ing-37', alias: 'spaghetti' },

  // Tortillas de nopal (ing-38)
  { id: 'alias-99', ingredient_id: 'ing-38', alias: 'tortilla de nopal' },
  { id: 'alias-100', ingredient_id: 'ing-38', alias: 'tortillas de nopal' },
  { id: 'alias-101', ingredient_id: 'ing-38', alias: 'nopalinas' },

  // Galletas de arroz (ing-39)
  { id: 'alias-102', ingredient_id: 'ing-39', alias: 'galletas de arroz' },
  { id: 'alias-103', ingredient_id: 'ing-39', alias: 'rice cake' },
  { id: 'alias-104', ingredient_id: 'ing-39', alias: 'rice cakes' },

  // Papa (ing-40)
  { id: 'alias-105', ingredient_id: 'ing-40', alias: 'papa' },
  { id: 'alias-106', ingredient_id: 'ing-40', alias: 'papas' },
  { id: 'alias-107', ingredient_id: 'ing-40', alias: 'papa cocida' },
  { id: 'alias-108', ingredient_id: 'ing-40', alias: 'papa al horno' },

  // Camote (ing-41)
  { id: 'alias-109', ingredient_id: 'ing-41', alias: 'camote' },
  { id: 'alias-110', ingredient_id: 'ing-41', alias: 'batata' },
  { id: 'alias-111', ingredient_id: 'ing-41', alias: 'boniato' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Verduras
  // ─────────────────────────────────────────────────────────────────────────────
  // Jitomate (ing-11)
  { id: 'alias-112', ingredient_id: 'ing-11', alias: 'jitomate' },
  { id: 'alias-113', ingredient_id: 'ing-11', alias: 'tomate' },
  { id: 'alias-114', ingredient_id: 'ing-11', alias: 'jitomates' },
  { id: 'alias-115', ingredient_id: 'ing-11', alias: 'tomate rojo' },
  { id: 'alias-116', ingredient_id: 'ing-11', alias: 'jitomate bola' },
  { id: 'alias-117', ingredient_id: 'ing-11', alias: 'jitomate saladet' },

  // Cebolla (ing-12)
  { id: 'alias-118', ingredient_id: 'ing-12', alias: 'cebolla' },
  { id: 'alias-119', ingredient_id: 'ing-12', alias: 'cebolla blanca' },
  { id: 'alias-120', ingredient_id: 'ing-12', alias: 'cebolla morada' },

  // Espinaca (ing-13)
  { id: 'alias-121', ingredient_id: 'ing-13', alias: 'espinaca' },
  { id: 'alias-122', ingredient_id: 'ing-13', alias: 'espinacas' },
  { id: 'alias-123', ingredient_id: 'ing-13', alias: 'espinaca cruda' },
  { id: 'alias-124', ingredient_id: 'ing-13', alias: 'espinaca cocida' },

  // Zanahoria (ing-14)
  { id: 'alias-125', ingredient_id: 'ing-14', alias: 'zanahoria' },
  { id: 'alias-126', ingredient_id: 'ing-14', alias: 'zanahorias' },
  { id: 'alias-127', ingredient_id: 'ing-14', alias: 'zanahoria rallada' },

  // Calabacita (ing-42)
  { id: 'alias-128', ingredient_id: 'ing-42', alias: 'calabacita' },
  { id: 'alias-129', ingredient_id: 'ing-42', alias: 'calabacitas' },
  { id: 'alias-130', ingredient_id: 'ing-42', alias: 'calabaza' },
  { id: 'alias-131', ingredient_id: 'ing-42', alias: 'zucchini' },

  // Brócoli (ing-43)
  { id: 'alias-132', ingredient_id: 'ing-43', alias: 'brocoli' },
  { id: 'alias-133', ingredient_id: 'ing-43', alias: 'brócoli' },
  { id: 'alias-134', ingredient_id: 'ing-43', alias: 'brocolis' },

  // Champiñones (ing-44)
  { id: 'alias-135', ingredient_id: 'ing-44', alias: 'champinon' },
  { id: 'alias-136', ingredient_id: 'ing-44', alias: 'champiñon' },
  { id: 'alias-137', ingredient_id: 'ing-44', alias: 'champinones' },
  { id: 'alias-138', ingredient_id: 'ing-44', alias: 'champiñones' },
  { id: 'alias-139', ingredient_id: 'ing-44', alias: 'hongos' },
  { id: 'alias-140', ingredient_id: 'ing-44', alias: 'setas' },

  // Nopales (ing-45)
  { id: 'alias-141', ingredient_id: 'ing-45', alias: 'nopal' },
  { id: 'alias-142', ingredient_id: 'ing-45', alias: 'nopales' },
  { id: 'alias-143', ingredient_id: 'ing-45', alias: 'nopal cocido' },
  { id: 'alias-144', ingredient_id: 'ing-45', alias: 'nopal asado' },

  // Lechuga (ing-46)
  { id: 'alias-145', ingredient_id: 'ing-46', alias: 'lechuga' },
  { id: 'alias-146', ingredient_id: 'ing-46', alias: 'lechuga orejona' },
  { id: 'alias-147', ingredient_id: 'ing-46', alias: 'lechuga romana' },
  { id: 'alias-148', ingredient_id: 'ing-46', alias: 'lechuga italiana' },

  // Pepino (ing-47)
  { id: 'alias-149', ingredient_id: 'ing-47', alias: 'pepino' },
  { id: 'alias-150', ingredient_id: 'ing-47', alias: 'pepinos' },

  // Apio (ing-48)
  { id: 'alias-151', ingredient_id: 'ing-48', alias: 'apio' },
  { id: 'alias-152', ingredient_id: 'ing-48', alias: 'ramas de apio' },

  // Pimiento morrón (ing-49)
  { id: 'alias-153', ingredient_id: 'ing-49', alias: 'pimiento' },
  { id: 'alias-154', ingredient_id: 'ing-49', alias: 'pimiento morron' },
  { id: 'alias-155', ingredient_id: 'ing-49', alias: 'pimiento morrón' },
  { id: 'alias-156', ingredient_id: 'ing-49', alias: 'pimientos' },

  // Ejotes (ing-50)
  { id: 'alias-157', ingredient_id: 'ing-50', alias: 'ejote' },
  { id: 'alias-158', ingredient_id: 'ing-50', alias: 'ejotes' },
  { id: 'alias-159', ingredient_id: 'ing-50', alias: 'judias verdes' },

  // Coliflor (ing-51)
  { id: 'alias-160', ingredient_id: 'ing-51', alias: 'coliflor' },

  // Espárragos (ing-52)
  { id: 'alias-161', ingredient_id: 'ing-52', alias: 'esparrago' },
  { id: 'alias-162', ingredient_id: 'ing-52', alias: 'espárrago' },
  { id: 'alias-163', ingredient_id: 'ing-52', alias: 'esparragos' },
  { id: 'alias-164', ingredient_id: 'ing-52', alias: 'espárragos' },

  // Mix de verduras salteadas (ing-53)
  { id: 'alias-165', ingredient_id: 'ing-53', alias: 'verduras salteadas' },
  { id: 'alias-166', ingredient_id: 'ing-53', alias: 'verdura salteada' },
  { id: 'alias-167', ingredient_id: 'ing-53', alias: 'mix de verduras' },
  { id: 'alias-168', ingredient_id: 'ing-53', alias: 'verduras mixtas' },
  { id: 'alias-169', ingredient_id: 'ing-53', alias: 'vegetales salteados' },
  { id: 'alias-170', ingredient_id: 'ing-53', alias: 'verdura al gusto' },
  { id: 'alias-171', ingredient_id: 'ing-53', alias: 'verduras al gusto' },
  { id: 'alias-172', ingredient_id: 'ing-53', alias: 'verduras libres' },

  // Verduras al vapor (ing-54)
  { id: 'alias-173', ingredient_id: 'ing-54', alias: 'verduras al vapor' },
  { id: 'alias-174', ingredient_id: 'ing-54', alias: 'verduras cocidas' },

  // Ensalada verde (ing-55)
  { id: 'alias-175', ingredient_id: 'ing-55', alias: 'ensalada verde' },
  { id: 'alias-176', ingredient_id: 'ing-55', alias: 'ensalada' },
  { id: 'alias-177', ingredient_id: 'ing-55', alias: 'ensalada fresca' },
  { id: 'alias-178', ingredient_id: 'ing-55', alias: 'ensalada al gusto' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Frutas
  // ─────────────────────────────────────────────────────────────────────────────
  // Plátano (ing-15)
  { id: 'alias-179', ingredient_id: 'ing-15', alias: 'platano' },
  { id: 'alias-180', ingredient_id: 'ing-15', alias: 'plátano' },
  { id: 'alias-181', ingredient_id: 'ing-15', alias: 'banana' },
  { id: 'alias-182', ingredient_id: 'ing-15', alias: 'platanos' },

  // Manzana (ing-16)
  { id: 'alias-183', ingredient_id: 'ing-16', alias: 'manzana' },
  { id: 'alias-184', ingredient_id: 'ing-16', alias: 'manzanas' },
  { id: 'alias-185', ingredient_id: 'ing-16', alias: 'manzana roja' },
  { id: 'alias-186', ingredient_id: 'ing-16', alias: 'manzana verde' },

  // Fresa (ing-17)
  { id: 'alias-187', ingredient_id: 'ing-17', alias: 'fresa' },
  { id: 'alias-188', ingredient_id: 'ing-17', alias: 'fresas' },
  { id: 'alias-189', ingredient_id: 'ing-17', alias: 'frutilla' },

  // Frutos rojos (ing-56)
  { id: 'alias-190', ingredient_id: 'ing-56', alias: 'frutos rojos' },
  { id: 'alias-191', ingredient_id: 'ing-56', alias: 'berries' },
  { id: 'alias-192', ingredient_id: 'ing-56', alias: 'moras' },
  { id: 'alias-193', ingredient_id: 'ing-56', alias: 'frambuesas' },
  { id: 'alias-194', ingredient_id: 'ing-56', alias: 'fruta al gusto' },
  { id: 'alias-195', ingredient_id: 'ing-56', alias: 'porcion de fruta' },

  // Papaya (ing-57)
  { id: 'alias-196', ingredient_id: 'ing-57', alias: 'papaya' },

  // Melón (ing-58)
  { id: 'alias-197', ingredient_id: 'ing-58', alias: 'melon' },
  { id: 'alias-198', ingredient_id: 'ing-58', alias: 'melón' },

  // Piña (ing-59)
  { id: 'alias-199', ingredient_id: 'ing-59', alias: 'pina' },
  { id: 'alias-200', ingredient_id: 'ing-59', alias: 'piña' },

  // Arándanos (ing-60)
  { id: 'alias-201', ingredient_id: 'ing-60', alias: 'arandano' },
  { id: 'alias-202', ingredient_id: 'ing-60', alias: 'arándano' },
  { id: 'alias-203', ingredient_id: 'ing-60', alias: 'arandanos' },
  { id: 'alias-204', ingredient_id: 'ing-60', alias: 'arándanos' },
  { id: 'alias-205', ingredient_id: 'ing-60', alias: 'blueberries' },

  // Naranja (ing-61)
  { id: 'alias-206', ingredient_id: 'ing-61', alias: 'naranja' },
  { id: 'alias-207', ingredient_id: 'ing-61', alias: 'naranjas' },

  // Mango (ing-62)
  { id: 'alias-208', ingredient_id: 'ing-62', alias: 'mango' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Grasas
  // ─────────────────────────────────────────────────────────────────────────────
  // Crema de cacahuate (ing-18)
  { id: 'alias-209', ingredient_id: 'ing-18', alias: 'crema de cacahuate' },
  { id: 'alias-210', ingredient_id: 'ing-18', alias: 'mantequilla de maní' },
  { id: 'alias-211', ingredient_id: 'ing-18', alias: 'mantequilla de cacahuate' },
  { id: 'alias-212', ingredient_id: 'ing-18', alias: 'peanut butter' },

  // Aguacate (ing-19)
  { id: 'alias-213', ingredient_id: 'ing-19', alias: 'aguacate' },
  { id: 'alias-214', ingredient_id: 'ing-19', alias: 'palta' },
  { id: 'alias-215', ingredient_id: 'ing-19', alias: 'aguacate hass' },

  // Aceite de oliva (ing-20)
  { id: 'alias-216', ingredient_id: 'ing-20', alias: 'aceite de oliva' },
  { id: 'alias-217', ingredient_id: 'ing-20', alias: 'aceite de oliva extra virgen' },
  { id: 'alias-218', ingredient_id: 'ing-20', alias: 'aceite oliva' },

  // Aceite en aerosol / spray (ing-63)
  { id: 'alias-219', ingredient_id: 'ing-63', alias: 'aceite en aerosol' },
  { id: 'alias-220', ingredient_id: 'ing-63', alias: 'aceite en spray' },
  { id: 'alias-221', ingredient_id: 'ing-63', alias: 'pam' },
  { id: 'alias-222', ingredient_id: 'ing-63', alias: 'aceite pam' },
  { id: 'alias-223', ingredient_id: 'ing-63', alias: 'spray para cocinar' },
  { id: 'alias-224', ingredient_id: 'ing-63', alias: 'grasa para cocinar' },

  // Almendras (ing-64)
  { id: 'alias-225', ingredient_id: 'ing-64', alias: 'almendra' },
  { id: 'alias-226', ingredient_id: 'ing-64', alias: 'almendras' },
  { id: 'alias-227', ingredient_id: 'ing-64', alias: 'almendras naturales' },

  // Nuez (ing-65)
  { id: 'alias-228', ingredient_id: 'ing-65', alias: 'nuez' },
  { id: 'alias-229', ingredient_id: 'ing-65', alias: 'nueces' },
  { id: 'alias-230', ingredient_id: 'ing-65', alias: 'nuez pecana' },

  // Chía (ing-66)
  { id: 'alias-231', ingredient_id: 'ing-66', alias: 'chia' },
  { id: 'alias-232', ingredient_id: 'ing-66', alias: 'chía' },
  { id: 'alias-233', ingredient_id: 'ing-66', alias: 'semillas de chia' },
  { id: 'alias-234', ingredient_id: 'ing-66', alias: 'semillas de chía' },

  // Cacahuates (ing-67)
  { id: 'alias-235', ingredient_id: 'ing-67', alias: 'cacahuate' },
  { id: 'alias-236', ingredient_id: 'ing-67', alias: 'cacahuates' },
  { id: 'alias-237', ingredient_id: 'ing-67', alias: 'mani' },
  { id: 'alias-238', ingredient_id: 'ing-67', alias: 'maní' },

  // Aceite de coco (ing-68)
  { id: 'alias-239', ingredient_id: 'ing-68', alias: 'aceite de coco' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Leguminosas
  // ─────────────────────────────────────────────────────────────────────────────
  // Frijol negro (ing-21)
  { id: 'alias-240', ingredient_id: 'ing-21', alias: 'frijol' },
  { id: 'alias-241', ingredient_id: 'ing-21', alias: 'frijoles' },
  { id: 'alias-242', ingredient_id: 'ing-21', alias: 'frijol negro' },
  { id: 'alias-243', ingredient_id: 'ing-21', alias: 'frijoles negros' },
  { id: 'alias-244', ingredient_id: 'ing-21', alias: 'frijoles cocidos' },

  // Lentejas (ing-22)
  { id: 'alias-245', ingredient_id: 'ing-22', alias: 'lenteja' },
  { id: 'alias-246', ingredient_id: 'ing-22', alias: 'lentejas' },
  { id: 'alias-247', ingredient_id: 'ing-22', alias: 'lentejas cocidas' },

  // Garbanzos (ing-69)
  { id: 'alias-248', ingredient_id: 'ing-69', alias: 'garbanzo' },
  { id: 'alias-249', ingredient_id: 'ing-69', alias: 'garbanzos' },
  { id: 'alias-250', ingredient_id: 'ing-69', alias: 'garbanzos cocidos' },

  // Frijol bayo (ing-70)
  { id: 'alias-251', ingredient_id: 'ing-70', alias: 'frijol bayo' },
  { id: 'alias-252', ingredient_id: 'ing-70', alias: 'frijoles bayos' },
  { id: 'alias-253', ingredient_id: 'ing-70', alias: 'frijol pinto' },

  // Habas (ing-71)
  { id: 'alias-254', ingredient_id: 'ing-71', alias: 'haba' },
  { id: 'alias-255', ingredient_id: 'ing-71', alias: 'habas' },

  // Edamames (ing-72)
  { id: 'alias-256', ingredient_id: 'ing-72', alias: 'edamame' },
  { id: 'alias-257', ingredient_id: 'ing-72', alias: 'edamames' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Lácteos (¡Incluyendo Yogurt Griego con todas sus variantes y faltas de ortografía!)
  // ─────────────────────────────────────────────────────────────────────────────
  // Yogurt griego (ing-25)
  { id: 'alias-258', ingredient_id: 'ing-25', alias: 'yogurt griego' },
  { id: 'alias-259', ingredient_id: 'ing-25', alias: 'yogut griego' },
  { id: 'alias-260', ingredient_id: 'ing-25', alias: 'yogur griego' },
  // Yogurt griego (ing-25) - Por defecto para la práctica nutricional
  { id: 'alias-261', ingredient_id: 'ing-25', alias: 'yoghurt griego' },
  { id: 'alias-262', ingredient_id: 'ing-25', alias: 'yogurth griego' },
  { id: 'alias-263', ingredient_id: 'ing-25', alias: 'yogut griego natural' },
  { id: 'alias-264', ingredient_id: 'ing-25', alias: 'yogurt griego natural' },
  { id: 'alias-265', ingredient_id: 'ing-25', alias: 'yogur griego natural' },
  { id: 'alias-266', ingredient_id: 'ing-25', alias: 'yoghurt griego natural' },
  { id: 'alias-267', ingredient_id: 'ing-25', alias: 'yogurt griego fage' },
  { id: 'alias-268', ingredient_id: 'ing-25', alias: 'yogurt griego chobani' },
  { id: 'alias-269', ingredient_id: 'ing-25', alias: 'yogurt griego oikos' },
  { id: 'alias-270', ingredient_id: 'ing-25', alias: 'yogurt griego sin azucar' },
  { id: 'alias-271', ingredient_id: 'ing-25', alias: 'yogurt griego sin azúcar' },
  { id: 'alias-272', ingredient_id: 'ing-25', alias: 'yogurt' },
  { id: 'alias-273', ingredient_id: 'ing-25', alias: 'yogut' },
  { id: 'alias-274', ingredient_id: 'ing-25', alias: 'yogur' },
  { id: 'alias-275', ingredient_id: 'ing-25', alias: 'yoghurt' },
  { id: 'alias-276', ingredient_id: 'ing-25', alias: 'yogurt natural' },
  { id: 'alias-277', ingredient_id: 'ing-25', alias: 'yogut natural' },
  { id: 'alias-278', ingredient_id: 'ing-25', alias: 'yogur natural' },
  { id: 'alias-279', ingredient_id: 'ing-25', alias: 'yogurt sin azucar' },
  { id: 'alias-365', ingredient_id: 'ing-25', alias: 'yogurt natural bajo en grasa' },
  { id: 'alias-366', ingredient_id: 'ing-25', alias: 'yogur natural bajo en grasa' },
  { id: 'alias-367', ingredient_id: 'ing-25', alias: 'yogut natural bajo en grasa' },
  { id: 'alias-368', ingredient_id: 'ing-25', alias: 'yogurt bajo en grasa' },

  // Yogurt natural sin azúcar explícito (ing-73)
  { id: 'alias-369', ingredient_id: 'ing-73', alias: 'yogurt natural sin azucar' },
  { id: 'alias-370', ingredient_id: 'ing-73', alias: 'yogurt natural sin azúcar' },
  { id: 'alias-371', ingredient_id: 'ing-73', alias: 'yogurt no griego' },

  // Leche entera (ing-23)
  { id: 'alias-16', ingredient_id: 'ing-23', alias: 'leche' },
  { id: 'alias-17', ingredient_id: 'ing-23', alias: 'leche entera' },
  { id: 'alias-280', ingredient_id: 'ing-23', alias: 'leche lala entera' },

  // Leche descremada (ing-24)
  { id: 'alias-18', ingredient_id: 'ing-24', alias: 'leche descremada' },
  { id: 'alias-19', ingredient_id: 'ing-24', alias: 'leche desnatada' },
  { id: 'alias-20', ingredient_id: 'ing-24', alias: 'leche light' },

  // Leche deslactosada light (ing-77)
  { id: 'alias-281', ingredient_id: 'ing-77', alias: 'leche deslactosada' },
  { id: 'alias-282', ingredient_id: 'ing-77', alias: 'leche deslactosada light' },
  { id: 'alias-283', ingredient_id: 'ing-77', alias: 'leche alpura deslactosada' },

  // Queso panela (ing-74)
  { id: 'alias-284', ingredient_id: 'ing-74', alias: 'queso panela' },
  { id: 'alias-285', ingredient_id: 'ing-74', alias: 'panela' },
  { id: 'alias-286', ingredient_id: 'ing-74', alias: 'queso fresco' },
  { id: 'alias-287', ingredient_id: 'ing-74', alias: 'queso canasto' },

  // Queso cottage (ing-75)
  { id: 'alias-288', ingredient_id: 'ing-75', alias: 'queso cottage' },
  { id: 'alias-289', ingredient_id: 'ing-75', alias: 'cottage' },
  { id: 'alias-290', ingredient_id: 'ing-75', alias: 'requeson' },
  { id: 'alias-291', ingredient_id: 'ing-75', alias: 'requesón' },

  // Queso Oaxaca (ing-76)
  { id: 'alias-292', ingredient_id: 'ing-76', alias: 'queso oaxaca' },
  { id: 'alias-293', ingredient_id: 'ing-76', alias: 'queso de hebra' },
  { id: 'alias-294', ingredient_id: 'ing-76', alias: 'quesillo' },

  // Kéfir (ing-78)
  { id: 'alias-295', ingredient_id: 'ing-78', alias: 'kefir' },
  { id: 'alias-296', ingredient_id: 'ing-78', alias: 'kéfir' },
  { id: 'alias-297', ingredient_id: 'ing-78', alias: 'leche de búlgaros' },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Otros
  // ─────────────────────────────────────────────────────────────────────────────
  // Canela (ing-26)
  { id: 'alias-298', ingredient_id: 'ing-26', alias: 'canela' },
  { id: 'alias-299', ingredient_id: 'ing-26', alias: 'canela en polvo' },
  { id: 'alias-300', ingredient_id: 'ing-26', alias: 'canela molida' },

  // Limón (ing-27)
  { id: 'alias-301', ingredient_id: 'ing-27', alias: 'limon' },
  { id: 'alias-302', ingredient_id: 'ing-27', alias: 'limón' },
  { id: 'alias-303', ingredient_id: 'ing-27', alias: 'jugo de limon' },
  { id: 'alias-304', ingredient_id: 'ing-27', alias: 'limones' },

  // Sal (ing-79)
  { id: 'alias-305', ingredient_id: 'ing-79', alias: 'sal' },
  { id: 'alias-306', ingredient_id: 'ing-79', alias: 'sal de mar' },
  { id: 'alias-307', ingredient_id: 'ing-79', alias: 'sal rosa' },

  // Pimienta (ing-80)
  { id: 'alias-308', ingredient_id: 'ing-80', alias: 'pimienta' },
  { id: 'alias-309', ingredient_id: 'ing-80', alias: 'pimienta negra' },

  // Ajo en polvo (ing-81)
  { id: 'alias-310', ingredient_id: 'ing-81', alias: 'ajo en polvo' },
  { id: 'alias-311', ingredient_id: 'ing-81', alias: 'diente de ajo' },
  { id: 'alias-312', ingredient_id: 'ing-81', alias: 'ajo' },

  // Orégano (ing-82)
  { id: 'alias-313', ingredient_id: 'ing-82', alias: 'oregano' },
  { id: 'alias-314', ingredient_id: 'ing-82', alias: 'orégano' },

  // Café (ing-83)
  { id: 'alias-315', ingredient_id: 'ing-83', alias: 'cafe' },
  { id: 'alias-316', ingredient_id: 'ing-83', alias: 'café' },
  { id: 'alias-317', ingredient_id: 'ing-83', alias: 'cafe soluble' },

  // Té (ing-84)
  { id: 'alias-318', ingredient_id: 'ing-84', alias: 'te' },
  { id: 'alias-319', ingredient_id: 'ing-84', alias: 'té' },
  { id: 'alias-320', ingredient_id: 'ing-84', alias: 'te verde' },
  { id: 'alias-321', ingredient_id: 'ing-84', alias: 'té verde' },

  // Miel de abeja (ing-85)
  { id: 'alias-322', ingredient_id: 'ing-85', alias: 'miel' },
  { id: 'alias-323', ingredient_id: 'ing-85', alias: 'miel de abeja' },
  { id: 'alias-324', ingredient_id: 'ing-85', alias: 'miel natural' },
  { id: 'alias-325', ingredient_id: 'ing-85', alias: 'miel pura' },

  // Mermelada natural (ing-86)
  { id: 'alias-326', ingredient_id: 'ing-86', alias: 'mermelada' },
  { id: 'alias-327', ingredient_id: 'ing-86', alias: 'mermelada natural' },
  { id: 'alias-328', ingredient_id: 'ing-86', alias: 'mermelada sin azucar' },
  { id: 'alias-329', ingredient_id: 'ing-86', alias: 'mermelada sin azúcar' },
  { id: 'alias-330', ingredient_id: 'ing-86', alias: 'mermelada de fresa' },

  // Mostaza (ing-87)
  { id: 'alias-331', ingredient_id: 'ing-87', alias: 'mostaza' },
  { id: 'alias-332', ingredient_id: 'ing-87', alias: 'mostaza dijon' },
  { id: 'alias-333', ingredient_id: 'ing-87', alias: 'mostaza heinz' },
  { id: 'alias-334', ingredient_id: 'ing-87', alias: 'mostaza francesa' },

  // Salsa de soya (ing-88)
  { id: 'alias-335', ingredient_id: 'ing-88', alias: 'salsa de soya' },
  { id: 'alias-336', ingredient_id: 'ing-88', alias: 'soya' },
  { id: 'alias-337', ingredient_id: 'ing-88', alias: 'soy sauce' },

  // Vinagre (ing-89)
  { id: 'alias-338', ingredient_id: 'ing-89', alias: 'vinagre' },
  { id: 'alias-339', ingredient_id: 'ing-89', alias: 'vinagre de manzana' },
  { id: 'alias-340', ingredient_id: 'ing-89', alias: 'vinagre balsamico' },
  { id: 'alias-341', ingredient_id: 'ing-89', alias: 'vinagre balsámico' },

  // Fruta de temporada (ing-90)
  { id: 'alias-342', ingredient_id: 'ing-90', alias: 'fruta' },
  { id: 'alias-343', ingredient_id: 'ing-90', alias: '1 fruta' },
  { id: 'alias-344', ingredient_id: 'ing-90', alias: 'fruta de temporada' },
  { id: 'alias-345', ingredient_id: 'ing-90', alias: 'fruta fresca' },
  { id: 'alias-346', ingredient_id: 'ing-90', alias: 'fruta variada' },
  { id: 'alias-347', ingredient_id: 'ing-90', alias: 'taza de fruta' },
  { id: 'alias-348', ingredient_id: 'ing-90', alias: '1 taza de fruta' },
  { id: 'alias-349', ingredient_id: 'ing-90', alias: 'fruta picada' },

  // Verduras mixtas / para guisar (ing-91)
  { id: 'alias-350', ingredient_id: 'ing-91', alias: 'verdura para sandwich' },
  { id: 'alias-351', ingredient_id: 'ing-91', alias: 'verdura para sándwich' },
  { id: 'alias-352', ingredient_id: 'ing-91', alias: 'verdura para guisar' },
  { id: 'alias-353', ingredient_id: 'ing-91', alias: 'verduras para omelette' },
  { id: 'alias-354', ingredient_id: 'ing-91', alias: 'verdura para omelette' },
  { id: 'alias-355', ingredient_id: 'ing-91', alias: 'verduras para guisar' },

  // Avena / Granola (ing-6)
  { id: 'alias-356', ingredient_id: 'ing-6', alias: 'barra de avena' },
  { id: 'alias-357', ingredient_id: 'ing-6', alias: 'granola casera' },
  { id: 'alias-358', ingredient_id: 'ing-6', alias: 'barra de avena o granola casera' },
  { id: 'alias-359', ingredient_id: 'ing-6', alias: 'avena con granola' },

  // Tostadas integrales (ing-9)
  { id: 'alias-360', ingredient_id: 'ing-9', alias: 'tostada integral' },
  { id: 'alias-361', ingredient_id: 'ing-9', alias: 'tostadas integrales' },

  // Pollo a la plancha / asado (ing-1)
  { id: 'alias-362', ingredient_id: 'ing-1', alias: 'pollo asado' },
  { id: 'alias-363', ingredient_id: 'ing-1', alias: 'pollo a la plancha' },
  { id: 'alias-364', ingredient_id: 'ing-1', alias: 'pechuga a la plancha' },
];
