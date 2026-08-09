/**
 * Nigeria's 36 states plus the FCT, and the 20 Local Government Areas of
 * Lagos State.
 *
 * **Why this exists.** Delivery eligibility turns on one question — "is
 * this address in Lagos?" — and `isLagosAddress` answers it by lowercasing
 * the state and city fields and checking whether the text contains
 * "lagos". With both fields as free text that is wrong in three
 * directions at once: a customer in Ikeja who leaves State blank is read
 * as *not* Lagos and loses Food Central; a typo ("Lagoss", "LAgos ")
 * fails the same way; and "Lagos Street, Abuja" is read as Lagos when it
 * is 700km away. Every one of those is a real order either wrongly
 * refused or wrongly accepted.
 *
 * A fixed list removes the whole class of problem at the point of entry
 * rather than trying to parse it afterwards, which is why State becomes a
 * picker rather than a box. The LGA list is the same idea one level down:
 * it gives a real, checkable location inside Lagos, which is also the
 * granularity any future zone-based delivery pricing will need — flat
 * ₦2,500 to every LGA is a launch simplification, not a permanent one.
 */

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
  "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara",
] as const

/** The exact string the State picker stores for Lagos. */
export const LAGOS_STATE = "Lagos"

/**
 * All 20 statutory LGAs of Lagos State. Kept as the full official list
 * rather than the handful we currently deliver to most often — a customer
 * in an LGA missing from the list would have no way to describe where
 * they live, which is worse than a longer dropdown.
 */
export const LAGOS_LGAS = [
  "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
  "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja",
  "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo",
  "Oshodi-Isolo", "Shomolu", "Surulere",
] as const
