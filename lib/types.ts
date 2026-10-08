export type Role = "Student" | "Admin";
export type ItemType = "Lost" | "Found";
export type ItemStatus = "Pending" | "Approved" | "Rejected" | "Collected" | "Returned";
export type ClaimStatus = "Pending" | "Approved" | "Rejected";

export type SessionUser = { id: string; name: string; email: string; role: Role };
export type Category = { id: string; name: string; description?: string; isActive?: boolean };
export type Item = {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  category: Category | null;
  location: string;
  dateOccurred: string;
  imageUrl?: string;
  status: ItemStatus;
  reportedBy: { id: string; name: string; email?: string } | null;
};
export type Claim = {
  id: string;
  message: string;
  proof?: string;
  status: ClaimStatus;
  item: { id: string; title: string; type: ItemType; status: ItemStatus; imageUrl?: string } | null;
  claimant: { id: string; name: string; email?: string } | null;
  createdAt?: string;
};
