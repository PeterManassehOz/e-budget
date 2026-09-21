# E-Budget

A modern personal finance tracking mobile application built with **React Native, Expo, TypeScript, and NativeWind**.

E-Budget helps users record, organize, search, and analyze their personal income and expenses through a clean, responsive mobile interface.

> **Current release: v1.0.0**
>
> E-Budget v1 is intentionally a **local-first application**. It does not currently require a backend, authentication system, remote database, or external API.

---

## Overview

E-Budget was built as a practical React Native application focused on the fundamentals of mobile application development:

* Transaction management
* Local data persistence
* Financial calculations
* Search and filtering
* Transaction categorization
* Analytics and visualization
* Date-based organization
* Light and dark themes
* Responsive mobile UI
* Keyboard-aware forms
* Reusable components
* Type-safe application logic

The project also serves as a foundation for the next stage of development, where the application will evolve from a local-only mobile application into a full client/server system.

---

# Version 1 — Local-First Architecture

E-Budget v1 intentionally keeps the architecture simple.

There is **no backend server** in this version.

Transaction data is persisted locally on the device, allowing the application to function without a network connection or account.

### v1 architecture

```text
┌──────────────────────────────┐
│          E-Budget            │
│      React Native / Expo     │
├──────────────────────────────┤
│                              │
│       Presentation Layer     │
│                              │
│  Dashboard                   │
│  Transactions                │
│  Analytics                   │
│  Add Transaction             │
│  Edit Transaction            │
│                              │
├──────────────────────────────┤
│                              │
│       Application Logic      │
│                              │
│  Transaction Context         │
│  Validation                  │
│  Analytics                   │
│  Grouping                    │
│  Formatting                  │
│  Transaction Factory         │
│                              │
├──────────────────────────────┤
│                              │
│       Local Persistence      │
│                              │
│        AsyncStorage          │
│                              │
└──────────────────────────────┘
```

This architecture makes v1 deliberately independent of a backend while keeping the business logic organized enough to support a future server-side implementation.

---

# Features

## Dashboard

The dashboard provides an overview of the user's financial position.

It includes:

* Current balance
* Total income
* Total expenses
* Recent transactions
* Quick access to adding transactions
* Positive/negative balance indication
* Light and dark appearance support

The dashboard is designed around the idea that the most important financial information should be visible immediately without requiring the user to navigate through multiple screens.

---

## Transaction Management

Users can:

* Add income
* Add expenses
* Edit transactions
* Delete transactions
* Search transactions
* Filter by transaction type
* View transaction dates
* Assign categories
* Add descriptions

Transactions are represented using a strongly typed model rather than loosely structured objects.

---

## Transaction Categories

The application currently supports categories such as:

### Expenses

* Food
* Transport
* Bills
* Shopping
* Entertainment
* Health
* Other

### Income

* Salary
* Freelance
* Other

Categories also have associated visual identities through the category visual configuration.

---

## Transaction Organization

Transactions can be grouped according to their dates.

The grouping utility supports labels such as:

* Today
* Yesterday
* Day of the week
* Month
* Month and year

This keeps larger transaction histories easier to scan on a mobile screen.

---

## Analytics

The Analytics section provides a financial overview derived from the locally stored transaction data.

It includes:

* Income totals
* Expense totals
* Balance
* Income vs. expense visualization
* Expense distribution by category
* Transaction statistics
* Financial summaries

The analytics layer is separated from the presentation layer through reusable utility functions.

---

## Appearance

E-Budget supports three appearance preferences:

* System
* Light
* Dark

The application uses a centralized theme system rather than scattering colors throughout the application.

Theme values are maintained through:

```text
src/constants/theme.ts
```

The theme system provides separate color palettes for light and dark modes, including:

* Backgrounds
* Surfaces
* Secondary surfaces
* Primary colors
* Text colors
* Borders
* Success states
* Danger states
* Warning states

---

# Project Structure

The project follows an Expo Router-based structure.

```text
PocketBudget/
│
├── assets/
│   └── images/
│       └── tabIcons/
│           └── e-budget.jpg
│
├── src/
│   │
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── add-transaction.tsx
│   │   ├── edit-transaction.tsx
│   │   │
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── transactions.tsx
│   │       └── analytics.tsx
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── SelectField.tsx
│   │       └── ThemeSegmentedControl.tsx
│   │
│   ├── constants/
│   │   ├── categoryVisuals.ts
│   │   └── theme.ts
│   │
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   └── TransactionContext.tsx
│   │
│   ├── types/
│   │   └── transaction.ts
│   │
│   └── utils/
│       ├── currency.ts
│       ├── dateRange.ts
│       ├── transactionAnalytics.ts
│       ├── transactionFactory.ts
│       ├── transactionGrouping.ts
│       └── transactionValidation.ts
│
├── app.json
├── package.json
├── package-lock.json
├── metro.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

# Core Architecture

## Transaction Context

`TransactionContext.tsx` is responsible for the application's transaction state.

It provides the rest of the application with operations such as:

```text
transactions
addTransaction()
updateTransaction()
deleteTransaction()
```

This keeps transaction state centralized instead of allowing individual screens to maintain disconnected copies of the data.

---

## Transaction Types

The transaction model is defined in:

```text
src/types/transaction.ts
```

A transaction currently contains information such as:

```text
id
type
amount
category
description
date
createdAt
```

The type system also defines the supported transaction types and categories.

---

## Transaction Factory

Transaction creation is isolated in:

```text
src/utils/transactionFactory.ts
```

This prevents individual screens from becoming responsible for constructing transaction objects manually.

---

## Validation

Form validation is centralized in:

```text
src/utils/transactionValidation.ts
```

This keeps validation rules independent from the UI components.

---

## Analytics

Financial calculations are handled through:

```text
src/utils/transactionAnalytics.ts
```

This separation allows the same financial calculations to be reused across Dashboard and Analytics rather than duplicating calculation logic inside screens.

---

## Transaction Grouping

Date-based transaction grouping is handled by:

```text
src/utils/transactionGrouping.ts
```

This produces structured rows containing either:

```text
header
```

or:

```text
transaction item
```

This allows the presentation layer to render grouped transaction histories without embedding date-grouping logic directly into the screen.

---

# UI Architecture

The application uses reusable UI components where appropriate.

### SelectField

```text
src/components/ui/SelectField.tsx
```

Provides a reusable selection interface for fields such as transaction categories and filters.

### ThemeSegmentedControl

```text
src/components/ui/ThemeSegmentedControl.tsx
```

Provides the appearance selector for:

```text
System
Light
Dark
```

It uses the centralized `ThemeContext` rather than implementing theme state locally.

---

# Styling

E-Budget uses:

* React Native
* NativeWind
* Tailwind CSS
* Expo
* TypeScript

The visual system uses:

* Rounded-xl components
* Rounded-full circular controls
* Soft borders
* Controlled spacing
* Blue primary actions
* Green income states
* Red expense states
* Light and dark surfaces
* Responsive layouts
* Floating bottom navigation

The interface is designed specifically for mobile rather than treating a desktop web layout as the starting point.

---

# Technology Stack

| Technology                  | Purpose                           |
| --------------------------- | --------------------------------- |
| React Native                | Mobile application framework      |
| Expo                        | React Native development platform |
| Expo Router                 | File-based navigation             |
| TypeScript                  | Type safety                       |
| NativeWind                  | Utility-first styling             |
| Tailwind CSS                | Design system utilities           |
| AsyncStorage                | Local transaction persistence     |
| React Context               | Application state management      |
| Expo Vector Icons           | Interface icons                   |
| React Native DateTimePicker | Transaction date selection        |
| Expo Linear Gradient        | Gradient-based UI elements        |

---

# Why There Is No Backend in v1

The absence of a backend is intentional.

The primary objective of v1 was to establish a solid mobile application foundation before introducing distributed application architecture.

Keeping the first release local provides several advantages:

* Faster development
* Offline-first functionality
* No authentication complexity
* No network dependency
* No server deployment requirements
* Simpler debugging
* Clear separation between UI and business logic

More importantly, the application logic has been structured so that the local persistence layer can eventually be replaced or supplemented by a remote API.

---

# Version 2 — Server-Side Architecture

Version 2 will introduce the server side of E-Budget.

The goal is not simply to add an API, but to evolve E-Budget into a proper client/server application.

The expected architecture will look approximately like this:

```text
                    ┌──────────────────────┐
                    │       E-Budget       │
                    │   React Native App   │
                    └──────────┬───────────┘
                               │
                               │ HTTPS / REST API
                               ▼
                    ┌──────────────────────┐
                    │    E-Budget Server   │
                    │      Node.js API     │
                    ├──────────────────────┤
                    │ Authentication       │
                    │ Users                 │
                    │ Transactions          │
                    │ Categories            │
                    │ Analytics             │
                    └──────────┬───────────┘
                               │
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Database       │
                    │       MongoDB        │
                    └──────────────────────┘
```

The exact implementation may evolve during v2 development, but the central principle will remain:

```text
Mobile Client
      ↓
API
      ↓
Server
      ↓
Database
```

---

# Proposed v2 Data Model

The current v1 transaction object is intentionally simple.

In v2, transactions will become associated with authenticated users and persisted on the server.

A transaction schema could evolve toward a model similar to:

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  type: "income" | "expense",

  amount: number,

  category: string,

  description: string,

  date: Date,

  createdAt: Date,

  updatedAt: Date
}
```

The important architectural change is the addition of:

```text
userId
```

which allows transactions to belong to a specific authenticated account.

The final schema will be determined during v2 implementation rather than treating this preliminary structure as a fixed contract.

---

# Proposed v2 User Model

A server-side user model could contain information similar to:

```ts
{
  _id: ObjectId,

  name: string,

  email: string,

  passwordHash: string,

  createdAt: Date,

  updatedAt: Date
}
```

Authentication would then allow users to access their financial data across supported devices rather than keeping the data exclusively on one device.

---

# Expected v2 Capabilities

The server-side version is expected to introduce capabilities such as:

* User registration
* User authentication
* Secure password handling
* Persistent cloud-based transactions
* User-specific transaction data
* API-based transaction CRUD
* Cross-device synchronization
* Server-side validation
* Server-side analytics where appropriate
* Account-level data isolation

Additional capabilities may be introduced as the architecture develops.

---

# v1 → v2 Evolution

The intended progression is:

```text
v1

React Native
     │
     ├── Context
     ├── Utilities
     ├── Analytics
     └── AsyncStorage
```

becoming:

```text
v2

React Native
     │
     │ HTTPS
     ▼
Node.js / API
     │
     ├── Authentication
     ├── Validation
     ├── Business Logic
     └── Transaction Services
     │
     ▼
MongoDB
```

The purpose of this evolution is to demonstrate that the application can move from a standalone mobile product into a distributed full-stack system without throwing away the foundational work established in v1.

---

# Current Status

## Version 1.0.0

**Status:** Completed

### Included

* [x] Dashboard
* [x] Transaction creation
* [x] Transaction editing
* [x] Transaction deletion
* [x] Transaction search
* [x] Transaction filtering
* [x] Transaction categorization
* [x] Date selection
* [x] Transaction validation
* [x] Local persistence
* [x] Financial calculations
* [x] Analytics
* [x] Transaction grouping
* [x] Light mode
* [x] Dark mode
* [x] System appearance mode
* [x] Keyboard-aware forms
* [x] Floating bottom navigation
* [x] Responsive mobile UI
* [x] TypeScript architecture

---

# Version 2 Roadmap

The planned direction for v2 includes:

* [ ] Backend API
* [ ] Database integration
* [ ] User accounts
* [ ] Authentication
* [ ] Secure authorization
* [ ] Cloud transaction persistence
* [ ] API-driven transaction management
* [ ] Cross-device synchronization
* [ ] Server-side validation
* [ ] Improved data consistency
* [ ] Production backend deployment

The roadmap is intentionally open-ended. v2 will be designed after evaluating the lessons learned from the v1 client-only architecture.

---

# Development

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

For Android:

```bash
npx expo start --android
```

For development on a physical device, Expo Go can be used during the v1 development cycle.

---

# Project Philosophy

E-Budget is being developed incrementally.

Rather than introducing a backend, authentication, database, and networking before the mobile foundation is stable, v1 focuses on building a complete and usable client application first.

The next stage is then to introduce server-side architecture deliberately.

This makes the project a progression from:

**local mobile application → full-stack financial application**

rather than two disconnected implementations.

---

# License

This project is currently maintained as a personal development and portfolio project.

