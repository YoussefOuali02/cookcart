# CookCart

CookCart is a B2B SaaS platform for grocery stores that allows customers to choose meals, order the exact ingredients needed to cook them, remove ingredients they already have at home, and follow recipe and nutrition details through web, mobile, and QR-enabled packaging.

## Project Objective

The objective of this project is to build a complete real-world SaaS product from scratch.

The project has two goals:

1. Try to validate and sell the product to grocery stores.
2. Use the project as a strong portfolio case study for high-salary full-stack software engineering jobs.

## Core Idea

Customers do not only buy groceries. They think in meals.

CookCart converts grocery products into customizable meal kits.

Example:

A customer chooses "Chicken Rice Bowl".

The platform provides the exact required ingredients:

- Chicken breast: 250g
- Rice: 150g
- Onion: 1 unit
- Garlic: 2 cloves
- Olive oil: 10ml
- Greek yogurt: 80g

If the customer already has rice and olive oil at home, they can remove them from the order.

The final order contains only the ingredients they need.

## Main Users

### Grocery Store Admin

The grocery store admin can:

- Manage meals
- Manage ingredients
- Manage stock
- Manage prices
- Manage orders
- Generate QR codes
- View analytics

### Customer

The customer can:

- Create an account
- Set diet preferences
- Add pantry ingredients manually
- Browse meals
- Customize meal kits
- Order ingredients
- View recipe instructions
- View nutrition facts
- Scan QR codes on packages

## MVP Scope

The first MVP will include:

- Authentication
- Customer meal browsing
- Manual pantry management
- Meal kit customization
- Cart
- Simulated orders
- Admin dashboard
- Ingredient management
- Meal management
- Order management

The MVP will not include:

- Real grocery integrations
- Real delivery
- Advanced AI
- Barcode scanning
- Mobile app
- Real payments

## Tech Stack

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT Authentication

### Web

- Next.js
- TypeScript
- Tailwind CSS
- React Query

### Mobile

Planned later:

- React Native
- Expo

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Cloud deployment later

## Project Structure

```text
cookcart/
  apps/
    api/
    web/
  docs/
    product.md
    roadmap.md
    database.md
    api.md
  README.md
  docker-compose.yml
```
