-- Production validation hardening and booking cancellation behavior.

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS unique_booking;

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking
  ON bookings (venue_id, booking_date)
  WHERE status <> 'cancelled';

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_guest_count_positive,
  ADD CONSTRAINT bookings_guest_count_positive CHECK (guest_count > 0);

ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_capacity_positive,
  ADD CONSTRAINT venues_capacity_positive CHECK (capacity > 0);

ALTER TABLE venues
  DROP CONSTRAINT IF EXISTS venues_price_per_seat_non_negative,
  ADD CONSTRAINT venues_price_per_seat_non_negative CHECK (price_per_seat >= 0);

ALTER TABLE singers
  DROP CONSTRAINT IF EXISTS singers_price_non_negative,
  ADD CONSTRAINT singers_price_non_negative CHECK (price >= 0);

ALTER TABLE cars
  DROP CONSTRAINT IF EXISTS cars_price_non_negative,
  ADD CONSTRAINT cars_price_non_negative CHECK (price >= 0);

ALTER TABLE karnay_surnay
  DROP CONSTRAINT IF EXISTS karnay_surnay_price_non_negative,
  ADD CONSTRAINT karnay_surnay_price_non_negative CHECK (price IS NULL OR price >= 0);
