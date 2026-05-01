# CookCart API Plan

## Auth

```text
POST /auth/register
POST /auth/login
GET /auth/me
```

## Users

```text
GET /users/me
PATCH /users/me
GET /users/me/profile
PUT /users/me/profile
```

## Ingredients

```text
GET /ingredients
POST /admin/ingredients
PATCH /admin/ingredients/:id
DELETE /admin/ingredients/:id
```

## Meals

```text
GET /meals
GET /meals/:id
POST /admin/meals
PATCH /admin/meals/:id
DELETE /admin/meals/:id
POST /admin/meals/:id/ingredients
```

## Pantry

```text
GET /pantry
POST /pantry
PATCH /pantry/:id
DELETE /pantry/:id
Meal Kit Preview
```

## Meal Kit Preview

```text
POST /meals/:id/preview-kit
```

## Cart

```text
GET /cart
POST /cart/meals
PATCH /cart/ingredients/:id
DELETE /cart/meals/:id
POST /cart/checkout
```

## Orders

```text
GET /orders
GET /orders/:id
POST /orders
PATCH /orders/:id/cancel
```

## Admin Orders

```text
GET /admin/orders
GET /admin/orders/:id
PATCH /admin/orders/:id/status
```
