# FoodBridge - Surplus Food Donation Platform

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Donor flow: restaurants/hotels/events submit a food donation form (food type, quantity, expiry, address/location text, contact)
- NGO/shelter flow: view pending donations, accept a donation
- Pickup confirmation: once accepted, donor sees which NGO accepted and a pickup confirmation message
- Map view: show donor location, NGO location, estimated distance and time (using a static map embed via OpenStreetMap iframe + distance calculation from coordinates)
- Two user roles: Donor and NGO
- Dashboard for donors: list of their submitted donations and statuses
- Dashboard for NGOs: list of available/pending donations to accept
- Donation statuses: pending, accepted, picked_up
- Authorization system for role-based access (Donor vs NGO)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Donation record (id, donorId, foodType, quantity, expiryTime, address, lat, lng, status, acceptedByNgoId, createdAt)
2. Backend: User profile (id, role: donor|ngo, name, address, lat, lng, contact)
3. Backend APIs: submitDonation, getDonations (all/by donor/by status), acceptDonation, markPickedUp, saveProfile, getProfile
4. Frontend: Auth-gated app with role selection on first login
5. Frontend: Donor dashboard - submit form + my donations list
6. Frontend: NGO dashboard - available donations list with accept button
7. Frontend: Donation detail page - map view using OpenStreetMap iframe embed, distance/time estimate
8. Frontend: Status badges, notifications via toast on accept
