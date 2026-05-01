# CookCart Database Plan

## Initial MVP Tables

The first version will use these main entities:

- User
- UserProfile
- Ingredient
- Meal
- MealIngredient
- PantryItem
- Cart
- CartMeal
- CartIngredient
- Order
- OrderItem

## User

Stores account information.

Fields:

- id
- firstName
- lastName
- email
- passwordHash
- role
- createdAt
- updatedAt

## UserProfile

Stores customer profile data.

Fields:

- id
- userId
- age
- heightCm
- weightKg
- goal
- dietType
- createdAt
- updatedAt

## Ingredient

Stores generic ingredient data.

Fields:

- id
- name
- category
- defaultUnit
- caloriesPer100g
- proteinPer100g
- carbsPer100g
- fatPer100g
- storageInstructions
- createdAt
- updatedAt

## Meal

Stores meal data.

Fields:

- id
- name
- description
- imageUrl
- cookingTimeMinutes
- difficulty
- cuisine
- dietTags
- instructions
- isPublished
- createdAt
- updatedAt

## MealIngredient

Connects meals to ingredients.

Fields:

- id
- mealId
- ingredientId
- quantity
- unit
- isOptional
- cookingStep
- createdAt
- updatedAt

## PantryItem

Stores ingredients the customer already has.

Fields:

- id
- userId
- ingredientId
- quantity
- unit
- expiryDate
- alwaysAvailable
- createdAt
- updatedAt

## Cart

Stores the customer cart.

Fields:

- id
- userId
- createdAt
- updatedAt

## CartMeal

Stores meals added to cart.

Fields:

- id
- cartId
- mealId
- servings
- createdAt
- updatedAt

## CartIngredient

Stores ingredients inside a customized meal kit.

Fields:

- id
- cartMealId
- ingredientId
- quantity
- unit
- price
- isRemovedByUser
- removalReason
- createdAt
- updatedAt

## Order

Stores order information.

Fields:

- id
- userId
- status
- totalPrice
- createdAt
- updatedAt

## OrderItem

Stores ordered ingredients.

Fields:

- id
- orderId
- mealId
- ingredientId
- quantity
- unit
- price
- createdAt
- updatedAt
