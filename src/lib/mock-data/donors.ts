import type { Donor } from "@/types";

export const donors: Donor[] = [
  {
    id: "donor-01",
    fullName: "Ayesha Rahman",
    email: "ayesha.rahman@example.com",
    phone: "01700-000201",
    joinedAt: "2025-11-04",
    status: "active",
    showNamePublicly: false,
    address: "Gulshan, Dhaka",
    bio: "Education consultant and monthly supporter of two nursing students.",
  },
  {
    id: "donor-02",
    fullName: "Tanvir Islam",
    email: "tanvir.islam@example.com",
    phone: "01700-000202",
    joinedAt: "2026-01-18",
    status: "active",
    showNamePublicly: true,
    address: "Dhanmondi, Dhaka",
  },
  {
    id: "donor-03",
    fullName: "Farzana Haque",
    email: "farzana.haque@example.com",
    phone: "01700-000203",
    joinedAt: "2026-02-02",
    status: "active",
    showNamePublicly: false,
    address: "Uttara, Dhaka",
  },
  {
    id: "donor-04",
    fullName: "Mohammad Ali",
    email: "mohammad.ali@example.com",
    phone: "01700-000204",
    joinedAt: "2025-09-11",
    status: "active",
    showNamePublicly: true,
    address: "Agrabad, Chattogram",
  },
  {
    id: "donor-05",
    fullName: "Sadia Noor",
    email: "sadia.noor@example.com",
    phone: "01700-000205",
    joinedAt: "2026-03-27",
    status: "active",
    showNamePublicly: false,
    address: "Zindabazar, Sylhet",
  },
  {
    id: "donor-06",
    fullName: "Rezaul Karim",
    email: "rezaul.karim@example.com",
    phone: "01700-000206",
    joinedAt: "2025-07-09",
    status: "active",
    showNamePublicly: true,
    address: "Boalia, Rajshahi",
  },
  {
    id: "donor-07",
    fullName: "Nabila Sultana",
    email: "nabila.sultana@example.com",
    phone: "01700-000207",
    joinedAt: "2026-05-14",
    status: "active",
    showNamePublicly: false,
    address: "Khalishpur, Khulna",
  },
  {
    id: "donor-08",
    fullName: "CEBBD Community Fund",
    email: "fund@cebbd.org",
    phone: "01700-000208",
    joinedAt: "2025-01-01",
    status: "active",
    showNamePublicly: true,
    address: "CEBBD Head Office, Dhaka",
    bio: "Pooled contributions from the CEBBD community of supporters.",
  },
];

export const demoDonorId = "donor-01";

export function getDonorById(id: string) {
  return donors.find((donor) => donor.id === id);
}

export function getDonorName(id: string) {
  return getDonorById(id)?.fullName ?? "Supporter";
}
