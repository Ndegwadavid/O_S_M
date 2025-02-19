optiplus_internal/
├── .env.local
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── admin-login/
│   │   │   │   └── page.tsx
│   │   │   └── staff-login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   ├── clients/
│   │   │   │   └── page.tsx
│   │   │   ├── examination/
│   │   │   │   └── page.tsx
│   │   │   └── reception/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── clients/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── client/
│   │   │   └── RegistrationForm.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   └── ui/
│   │       └── Button.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
└── public/
    └── logo.svg