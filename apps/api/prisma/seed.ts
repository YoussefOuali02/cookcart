import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface IngredientSeed {
  name: string;
  category: string;
  defaultUnit: string;
  pricePerUnit: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  storageInstructions: string;
}

const ingredients: IngredientSeed[] = [
  {
    name: 'Chicken breast',
    category: 'Protein',
    defaultUnit: 'g',
    pricePerUnit: 0.012,
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    storageInstructions: 'Keep refrigerated, use within 2 days or freeze.',
  },
  {
    name: 'Rice',
    category: 'Grain',
    defaultUnit: 'g',
    pricePerUnit: 0.003,
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28,
    fatPer100g: 0.3,
    storageInstructions: 'Store in a cool, dry place.',
  },
  {
    name: 'Pasta',
    category: 'Grain',
    defaultUnit: 'g',
    pricePerUnit: 0.0025,
    caloriesPer100g: 131,
    proteinPer100g: 5,
    carbsPer100g: 25,
    fatPer100g: 1.1,
    storageInstructions: 'Store in a cool, dry place.',
  },
  {
    name: 'Tomato sauce',
    category: 'Condiment',
    defaultUnit: 'g',
    pricePerUnit: 0.004,
    caloriesPer100g: 29,
    proteinPer100g: 1.6,
    carbsPer100g: 6,
    fatPer100g: 0.2,
    storageInstructions: 'Refrigerate after opening.',
  },
  {
    name: 'Onion',
    category: 'Vegetable',
    defaultUnit: 'unit',
    pricePerUnit: 0.5,
    caloriesPer100g: 40,
    proteinPer100g: 1.1,
    carbsPer100g: 9,
    fatPer100g: 0.1,
    storageInstructions: 'Store in a cool, dry place.',
  },
  {
    name: 'Garlic',
    category: 'Vegetable',
    defaultUnit: 'clove',
    pricePerUnit: 0.1,
    caloriesPer100g: 149,
    proteinPer100g: 6.4,
    carbsPer100g: 33,
    fatPer100g: 0.5,
    storageInstructions: 'Store in a cool, dry place.',
  },
  {
    name: 'Olive oil',
    category: 'Condiment',
    defaultUnit: 'ml',
    pricePerUnit: 0.02,
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    storageInstructions: 'Store at room temperature, away from light.',
  },
  {
    name: 'Eggs',
    category: 'Protein',
    defaultUnit: 'unit',
    pricePerUnit: 0.3,
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
    storageInstructions: 'Keep refrigerated.',
  },
  {
    name: 'Tuna',
    category: 'Protein',
    defaultUnit: 'g',
    pricePerUnit: 0.015,
    caloriesPer100g: 116,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatPer100g: 1,
    storageInstructions: 'Refrigerate after opening.',
  },
  {
    name: 'Potatoes',
    category: 'Vegetable',
    defaultUnit: 'g',
    pricePerUnit: 0.002,
    caloriesPer100g: 77,
    proteinPer100g: 2,
    carbsPer100g: 17,
    fatPer100g: 0.1,
    storageInstructions: 'Store in a cool, dark, dry place.',
  },
  {
    name: 'Greek yogurt',
    category: 'Dairy',
    defaultUnit: 'g',
    pricePerUnit: 0.008,
    caloriesPer100g: 59,
    proteinPer100g: 10,
    carbsPer100g: 3.6,
    fatPer100g: 0.4,
    storageInstructions: 'Keep refrigerated.',
  },
  {
    name: 'Lettuce',
    category: 'Vegetable',
    defaultUnit: 'g',
    pricePerUnit: 0.006,
    caloriesPer100g: 15,
    proteinPer100g: 1.4,
    carbsPer100g: 2.9,
    fatPer100g: 0.2,
    storageInstructions: 'Keep refrigerated.',
  },
  {
    name: 'Carrot',
    category: 'Vegetable',
    defaultUnit: 'unit',
    pricePerUnit: 0.3,
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    carbsPer100g: 10,
    fatPer100g: 0.2,
    storageInstructions: 'Keep refrigerated.',
  },
  {
    name: 'Milk',
    category: 'Dairy',
    defaultUnit: 'ml',
    pricePerUnit: 0.0015,
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
    storageInstructions: 'Keep refrigerated.',
  },
  {
    name: 'Cheese',
    category: 'Dairy',
    defaultUnit: 'g',
    pricePerUnit: 0.015,
    caloriesPer100g: 402,
    proteinPer100g: 25,
    carbsPer100g: 1.3,
    fatPer100g: 33,
    storageInstructions: 'Keep refrigerated.',
  },
];

interface MealSeed {
  name: string;
  description: string;
  cookingTimeMinutes: number;
  difficulty: string;
  cuisine: string;
  dietTags: string[];
  instructions: string;
  isPublished: boolean;
  ingredients: { name: string; quantity: number; unit: string }[];
}

const meals: MealSeed[] = [
  {
    name: 'Chicken Rice Bowl',
    description:
      'A high-protein bowl with seasoned chicken breast, rice, and a yogurt sauce.',
    cookingTimeMinutes: 30,
    difficulty: 'easy',
    cuisine: 'Fusion',
    dietTags: ['high-protein'],
    instructions:
      '1. Cook rice. 2. Season and pan-sear chicken breast. 3. Saute onion and garlic in olive oil. 4. Slice chicken and serve over rice with yogurt sauce.',
    isPublished: true,
    ingredients: [
      { name: 'Chicken breast', quantity: 250, unit: 'g' },
      { name: 'Rice', quantity: 150, unit: 'g' },
      { name: 'Onion', quantity: 1, unit: 'unit' },
      { name: 'Garlic', quantity: 2, unit: 'clove' },
      { name: 'Olive oil', quantity: 10, unit: 'ml' },
      { name: 'Greek yogurt', quantity: 80, unit: 'g' },
    ],
  },
  {
    name: 'Tuna Pasta',
    description:
      'Pasta tossed with tuna, tomato sauce, and sauteed onion and garlic.',
    cookingTimeMinutes: 25,
    difficulty: 'easy',
    cuisine: 'Italian',
    dietTags: ['high-protein'],
    instructions:
      '1. Boil pasta. 2. Saute onion and garlic in olive oil. 3. Add tomato sauce and tuna, simmer. 4. Toss with cooked pasta.',
    isPublished: true,
    ingredients: [
      { name: 'Pasta', quantity: 200, unit: 'g' },
      { name: 'Tuna', quantity: 150, unit: 'g' },
      { name: 'Tomato sauce', quantity: 100, unit: 'g' },
      { name: 'Onion', quantity: 1, unit: 'unit' },
      { name: 'Garlic', quantity: 2, unit: 'clove' },
      { name: 'Olive oil', quantity: 10, unit: 'ml' },
    ],
  },
  {
    name: 'Vegetable Omelette',
    description: 'Fluffy eggs folded with carrot, onion, and melted cheese.',
    cookingTimeMinutes: 15,
    difficulty: 'easy',
    cuisine: 'French',
    dietTags: ['vegetarian'],
    instructions:
      '1. Whisk eggs with milk. 2. Saute onion and carrot in olive oil. 3. Pour eggs into the pan, add cheese, and fold once set.',
    isPublished: true,
    ingredients: [
      { name: 'Eggs', quantity: 3, unit: 'unit' },
      { name: 'Milk', quantity: 30, unit: 'ml' },
      { name: 'Onion', quantity: 0.5, unit: 'unit' },
      { name: 'Carrot', quantity: 1, unit: 'unit' },
      { name: 'Cheese', quantity: 30, unit: 'g' },
      { name: 'Olive oil', quantity: 5, unit: 'ml' },
    ],
  },
  {
    name: 'Greek Yogurt Chicken Wrap',
    description: 'Seasoned chicken with a cool yogurt sauce and crisp lettuce.',
    cookingTimeMinutes: 20,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    dietTags: ['high-protein'],
    instructions:
      '1. Season and pan-sear chicken breast. 2. Mix yogurt with garlic and olive oil for the sauce. 3. Slice chicken and assemble with lettuce and sauce.',
    isPublished: true,
    ingredients: [
      { name: 'Chicken breast', quantity: 200, unit: 'g' },
      { name: 'Greek yogurt', quantity: 100, unit: 'g' },
      { name: 'Lettuce', quantity: 50, unit: 'g' },
      { name: 'Onion', quantity: 0.5, unit: 'unit' },
      { name: 'Garlic', quantity: 1, unit: 'clove' },
      { name: 'Olive oil', quantity: 5, unit: 'ml' },
    ],
  },
  {
    name: 'Potato Egg Skillet',
    description:
      'A hearty skillet of pan-fried potatoes, eggs, onion, and cheese.',
    cookingTimeMinutes: 30,
    difficulty: 'medium',
    cuisine: 'Comfort food',
    dietTags: ['vegetarian'],
    instructions:
      '1. Dice and pan-fry potatoes in olive oil until golden. 2. Add onion and cook until soft. 3. Crack in eggs and cook to preference. 4. Top with cheese.',
    isPublished: true,
    ingredients: [
      { name: 'Potatoes', quantity: 300, unit: 'g' },
      { name: 'Eggs', quantity: 2, unit: 'unit' },
      { name: 'Onion', quantity: 0.5, unit: 'unit' },
      { name: 'Cheese', quantity: 30, unit: 'g' },
      { name: 'Olive oil', quantity: 10, unit: 'ml' },
    ],
  },
  {
    name: 'Healthy Chicken Salad',
    description:
      'A light salad of grilled chicken, lettuce, and carrot with a yogurt dressing.',
    cookingTimeMinutes: 20,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    dietTags: ['high-protein', 'low-carb'],
    instructions:
      '1. Season and grill chicken breast. 2. Toss lettuce and carrot. 3. Slice chicken over the salad. 4. Drizzle with yogurt and olive oil dressing.',
    isPublished: true,
    ingredients: [
      { name: 'Chicken breast', quantity: 200, unit: 'g' },
      { name: 'Lettuce', quantity: 100, unit: 'g' },
      { name: 'Carrot', quantity: 1, unit: 'unit' },
      { name: 'Cheese', quantity: 30, unit: 'g' },
      { name: 'Olive oil', quantity: 10, unit: 'ml' },
      { name: 'Greek yogurt', quantity: 50, unit: 'g' },
    ],
  },
];

async function main() {
  console.log('Seeding ingredients...');
  const ingredientRecords = new Map<string, string>();

  for (const ingredient of ingredients) {
    const record = await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: ingredient,
      create: ingredient,
    });
    ingredientRecords.set(record.name, record.id);
  }

  console.log('Seeding meals...');
  for (const meal of meals) {
    const { ingredients: mealIngredients, ...mealData } = meal;

    const existing = await prisma.meal.findFirst({
      where: { name: meal.name },
    });

    const mealRecord = existing
      ? await prisma.meal.update({ where: { id: existing.id }, data: mealData })
      : await prisma.meal.create({ data: mealData });

    for (const mealIngredient of mealIngredients) {
      const ingredientId = ingredientRecords.get(mealIngredient.name);
      if (!ingredientId) {
        throw new Error(`Unknown ingredient: ${mealIngredient.name}`);
      }

      await prisma.mealIngredient.upsert({
        where: {
          mealId_ingredientId: {
            mealId: mealRecord.id,
            ingredientId,
          },
        },
        update: {
          quantity: mealIngredient.quantity,
          unit: mealIngredient.unit,
        },
        create: {
          mealId: mealRecord.id,
          ingredientId,
          quantity: mealIngredient.quantity,
          unit: mealIngredient.unit,
        },
      });
    }
  }

  console.log(
    `Seeded ${ingredients.length} ingredients and ${meals.length} meals.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
