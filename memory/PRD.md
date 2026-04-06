# Ready for Guests Connect - Product Requirements Document

## Original Problem Statement
Build "Ready for Guests Connect" - a cleaning service marketplace app similar to a taxi/Taksi app for the Hibiscus Coast, South Africa. The app connects property owners with cleaning teams for professional cleaning, Fresh Air Property Care (dehumidifying), and guest-ready setup services for holiday homes, Airbnb properties, and private residences.

## User Personas

### 1. Property Owner (Client)
- Holiday home owners on the Hibiscus Coast
- Airbnb hosts needing turnover cleaning
- Private residence owners wanting professional cleaning

### 2. Cleaning Team
- Professional housekeepers
- Service teams with equipment (steamer, vacuum)
- Local cleaning professionals

### 3. Administrator
- Business owner (Sandra)
- Manages teams, bookings, clients
- Handles payments and assignments

## Core Requirements (Static)

### Client Features
- Book cleaning/service
- Choose date & time
- See pricing
- Track job status
- Pay online (PayFast - pending keys)

### Team Features
- Accept jobs
- View schedule
- Mark job complete
- Upload photos

### Admin Features
- Assign jobs to teams
- Track teams
- See payments
- Manage clients
- Manage gallery photos

## Service Areas
Margate, Ramsgate, Shelly Beach, St Michael's On Sea, Oslo Beach, Uvongo, Umtentweni, Port Shepstone, Port Edward

## What's Been Implemented (April 5, 2026)

### Backend (FastAPI + MongoDB)
- ✅ User authentication (JWT + bcrypt)
- ✅ Role-based access (client, team, admin)
- ✅ Services CRUD with 27 seeded services
- ✅ Bookings CRUD with assignment
- ✅ Teams management
- ✅ Notifications system
- ✅ Gallery management with object storage
- ✅ PayFast integration endpoints (ready for keys)
- ✅ Admin seeding (info.readyforguestssa@gmail.com)

### Frontend (React + Tailwind + Shadcn)
- ✅ Landing page with hero image
- ✅ Login/Register pages
- ✅ Client dashboard with bookings
- ✅ Team dashboard with job management
- ✅ Admin dashboard (overview, bookings, teams, clients, gallery)
- ✅ Booking flow (3-step: service → date/time → property)
- ✅ In-app notifications
- ✅ Payment success/cancel pages

### Design Implementation
- Brand colors: Teal #0D7377, Beige #F5E6D3, Gold #D4AF37
- Fonts: Outfit (headings), Manrope (body)
- Phosphor icons
- Framer Motion animations
- Mobile-responsive design

## Prioritized Backlog

### P0 - Critical (Complete)
- [x] User authentication
- [x] Booking system
- [x] Job assignment
- [x] Admin dashboard

### P1 - High Priority (Next Phase)
- [ ] PayFast payment keys configuration
- [ ] SMS notifications (Twilio integration)
- [ ] Team mobile app optimization
- [ ] Booking confirmation emails

### P2 - Medium Priority
- [ ] Client reviews/ratings
- [ ] Recurring bookings
- [ ] Price calculator based on property size
- [ ] Export reports (CSV/PDF)

### P3 - Nice to Have
- [ ] Google Maps integration for addresses
- [ ] WhatsApp Business API integration
- [ ] Loyalty program
- [ ] Team performance analytics

## Next Tasks
1. Provide PayFast merchant keys to enable payments
2. Set up Twilio for SMS notifications
3. Test end-to-end payment flow
4. Add email notifications (SendGrid/Resend)
