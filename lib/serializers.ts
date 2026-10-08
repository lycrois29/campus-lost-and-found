export function serializeItem(item: any) {
  return {
    ...item,
    id: String(item._id),
    category: item.category ? { id: String(item.category._id), name: item.category.name } : null,
    // A reporter's email address is private, even when the report is public.
    reportedBy: item.reportedBy ? { id: String(item.reportedBy._id), name: item.reportedBy.name } : null,
  };
}

export function serializeClaim(claim: any, includeClaimantEmail: boolean) {
  return {
    ...claim,
    id: String(claim._id),
    item: claim.item ? { id: String(claim.item._id), title: claim.item.title, type: claim.item.type, status: claim.item.status, imageUrl: claim.item.imageUrl } : null,
    claimant: claim.claimant ? {
      id: String(claim.claimant._id),
      name: claim.claimant.name,
      ...(includeClaimantEmail ? { email: claim.claimant.email } : {}),
    } : null,
  };
}
