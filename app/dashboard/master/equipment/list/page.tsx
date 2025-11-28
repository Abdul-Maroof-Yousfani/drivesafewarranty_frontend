import { getEquipments } from "@/lib/actions/equipment";
import { EquipmentList } from "./equipment-list";

export default async function EquipmentListPage({
  searchParams,
}: {
  searchParams: Promise<{ newItemId?: string }>;
}) {
  const { newItemId } = await searchParams;
  const { data: equipments } = await getEquipments();

  return <EquipmentList initialEquipments={equipments || []} newItemId={newItemId} />;
}

