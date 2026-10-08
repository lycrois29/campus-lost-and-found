import ItemDetails from "@/components/ItemDetails";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ItemDetails id={id} />; }
