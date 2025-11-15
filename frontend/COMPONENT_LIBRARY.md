# LUMEN-Agent Component Library

## Overview
A comprehensive collection of reusable React components built with Tailwind CSS, Radix UI, and Lucide icons for the LUMEN-Agent financial dashboard.

---

## Layout Components

### **Sidebar**
Desktop-only persistent navigation sidebar with active route highlighting.

**Location:** `components/Sidebar.tsx`

**Features:**
- Sticky positioning
- Logo section
- Navigation items with icons
- Active route highlighting with glow effect
- Sign out button
- Scrollable content area

**Usage:**
```tsx
import { Sidebar } from '@/components/Sidebar';

<Sidebar />
```

---

### **Header**
Enhanced navigation header with active route detection and icon support.

**Location:** `components/Header.tsx`

**Features:**
- Active route detection
- Icon-based navigation items
- Gradient background with backdrop blur
- Responsive design (mobile-friendly)
- External link support
- Smooth hover transitions

**Usage:**
```tsx
import { Header } from '@/components/Header';

<Header />
```

---

### **PageLayout**
Reusable layout wrapper for consistent page structure.

**Location:** `components/PageLayout.tsx`

**Features:**
- Integrated Sidebar
- Sticky header with title
- User button in top right
- Scrollable content area
- Responsive design

**Usage:**
```tsx
import { PageLayout } from '@/components/PageLayout';

<PageLayout 
  title="Page Title" 
  description="Optional description"
>
  {/* Page content */}
</PageLayout>
```

---

## Data Display Components

### **StatsCard**
Enhanced card component for displaying statistics with icons and trends.

**Location:** `components/StatsCard.tsx`

**Props:**
```tsx
interface StatsCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  children?: ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
import { StatsCard } from '@/components/StatsCard';
import { TrendingUp } from 'lucide-react';

<StatsCard
  title="Total Spent"
  value="$1,234.56"
  icon={TrendingUp}
  trend={{ value: 12, direction: 'up' }}
/>
```

---

### **StatusBadge**
Status indicator badge with color-coded variants.

**Location:** `components/StatusBadge.tsx`

**Props:**
```tsx
interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  label: string;
  icon?: LucideIcon;
  children?: ReactNode;
}
```

**Usage:**
```tsx
import { StatusBadge } from '@/components/StatusBadge';
import { CheckCircle } from 'lucide-react';

<StatusBadge 
  status="success" 
  label="Completed" 
  icon={CheckCircle}
/>
```

---

### **EmptyState**
Empty state component for when no data is available.

**Location:** `components/EmptyState.tsx`

**Props:**
```tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}
```

**Usage:**
```tsx
import { EmptyState } from '@/components/EmptyState';
import { InboxIcon } from 'lucide-react';

<EmptyState
  icon={InboxIcon}
  title="No transactions yet"
  description="Start by uploading your first receipt"
  action={{
    label: "Upload Receipt",
    onClick: () => handleUpload()
  }}
/>
```

---

## Loading Components

### **Skeleton**
Animated loading placeholder component.

**Location:** `components/Skeleton.tsx`

**Usage:**
```tsx
import { Skeleton } from '@/components/Skeleton';

<Skeleton className="h-12 w-full rounded-lg" />
```

---

## Animation Components

### **ScrollAnimate**
Fade and slide animation for elements entering the viewport.

**Location:** `components/ScrollAnimate.tsx`

**Props:**
```tsx
interface ScrollAnimateProps {
  children: ReactNode;
  delay?: number;
}
```

**Usage:**
```tsx
import { ScrollAnimate } from '@/components/ScrollAnimate';

<ScrollAnimate delay={0.2}>
  <div>Content that animates on scroll</div>
</ScrollAnimate>
```

---

## UI Components (Radix UI + shadcn/ui)

### **Button**
Versatile button component with multiple variants.

**Location:** `components/ui/button.tsx`

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

**Sizes:** `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary" size="lg">Click me</Button>
```

---

### **Card**
Container component for grouping related content.

**Location:** `components/ui/card.tsx`

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area

**Usage:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

### **Badge**
Small label component for categorization.

**Location:** `components/ui/badge.tsx`

**Usage:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">New</Badge>
```

---

### **Tabs**
Tab navigation component.

**Location:** `components/ui/tabs.tsx`

**Components:**
- `Tabs` - Container
- `TabsList` - Tab list
- `TabsTrigger` - Individual tab
- `TabsContent` - Tab content

**Usage:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

### **Input**
Text input component.

**Location:** `components/ui/input.tsx`

**Usage:**
```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Enter text..." />
```

---

### **Label**
Form label component.

**Location:** `components/ui/label.tsx`

**Usage:**
```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="input">Label text</Label>
```

---

### **Alert**
Alert message component.

**Location:** `components/ui/alert.tsx`

**Components:**
- `Alert` - Container
- `AlertTitle` - Title
- `AlertDescription` - Description

**Usage:**
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert message</AlertDescription>
</Alert>
```

---

### **Dialog**
Modal dialog component.

**Location:** `components/ui/dialog.tsx`

**Usage:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

---

### **Sheet**
Side panel component.

**Location:** `components/ui/sheet.tsx`

**Usage:**
```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

---

### **Accordion**
Collapsible content component.

**Location:** `components/ui/accordion.tsx`

**Usage:**
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### **ScrollArea**
Scrollable container component.

**Location:** `components/ui/scroll-area.tsx`

**Usage:**
```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-[200px]">
  {/* Scrollable content */}
</ScrollArea>
```

---

### **Table**
Data table component.

**Location:** `components/ui/table.tsx`

**Components:**
- `Table` - Container
- `TableHeader` - Header row
- `TableBody` - Body rows
- `TableRow` - Individual row
- `TableHead` - Header cell
- `TableCell` - Data cell

**Usage:**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## CSS Classes

### **Enhanced Classes** (in `globals.css`)

**`.card-enhanced`**
- Gradient background
- Border with primary color
- Shadow with hover effect
- Smooth transitions

**`.nav-bg-darker`**
- Semi-transparent background
- Backdrop blur effect

**`.gradient-text`**
- Gradient text effect
- Primary to accent colors

**`.transition-smooth`**
- Smooth 300ms transitions
- Ease-in-out timing

---

## Color Palette

### Dark Theme
- **Background**: `#0F172A`
- **Card**: `#1E293B`
- **Primary**: `#8B5CF6` (Purple)
- **Secondary**: `#22C55E` (Green)
- **Accent**: `#4F46E5` (Indigo)
- **Destructive**: `#EF4444` (Red)
- **Foreground**: `#F1F5F9` (Light Gray)
- **Muted**: `#94A3B8` (Gray)

---

## Icons

All components use **Lucide React** icons. Common icons:
- `LayoutDashboard` - Dashboard
- `Receipt` - Expenses
- `BarChart3` - Analytics
- `Gift` - Rewards
- `Brain` - AI
- `User` - Profile
- `LogOut` - Sign out
- `TrendingUp` - Upward trend
- `AlertTriangle` - Warning
- `CheckCircle` - Success

---

## Best Practices

1. **Consistency**: Use the same components across pages
2. **Accessibility**: Always include proper labels and ARIA attributes
3. **Responsiveness**: Test on mobile, tablet, and desktop
4. **Performance**: Use React.memo for expensive components
5. **Styling**: Prefer Tailwind classes over inline styles
6. **Icons**: Use Lucide icons for consistency
7. **Colors**: Use CSS variables for theming

---

## Dependencies

- **React** 18.2.0+
- **Next.js** 14.2.25+
- **Tailwind CSS** 4.0+
- **Radix UI** (various packages)
- **Lucide React** 0.553.0+
- **Framer Motion** 12.23.24+
- **Sonner** (Toast notifications)

---

## File Structure
```
components/
├── Layout Components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── PageLayout.tsx
├── Data Display
│   ├── StatsCard.tsx
│   ├── StatusBadge.tsx
│   └── EmptyState.tsx
├── Loading
│   └── Skeleton.tsx
├── Animation
│   └── ScrollAnimate.tsx
├── UI Components
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── alert.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── accordion.tsx
│   │   ├── scroll-area.tsx
│   │   ├── table.tsx
│   │   └── navigation-menu.tsx
│   └── [Other components]
└── [Feature components]
```

---

## Maintenance

- Update components when design changes
- Keep documentation in sync with code
- Test responsive behavior regularly
- Monitor performance metrics
- Update dependencies quarterly

---

*Last Updated: November 15, 2025*
